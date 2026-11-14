import {
  OllamaHealthStatus,
  OllamaGenerateOptions,
  OllamaGenerateResponse,
  OllamaModelTag,
  OllamaTimeoutError,
  OllamaConnectionError,
  OllamaParseError,
  OllamaError,
} from '../types/ollama.js';

export interface OllamaClientConfig {
  host?: string;
  targetModel?: string;
  defaultTimeoutMs?: number;
}

export class OllamaClient {
  public readonly host: string;
  public readonly targetModel: string;
  public readonly defaultTimeoutMs: number;

  constructor(cfg?: OllamaClientConfig) {
    this.host = (cfg?.host || 'http://localhost:11434').replace(/\/+$/, '');
    this.targetModel = cfg?.targetModel || 'qwen3.5:4b';
    this.defaultTimeoutMs = cfg?.defaultTimeoutMs || 30000;
  }

  /**
   * Comprehensive health check of the Ollama service.
   * Probes daemon connectivity, lists installed models, and checks if target model is present.
   */
  async checkHealth(): Promise<OllamaHealthStatus> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // 1. Fetch available models from /api/tags
      const tagsRes = await fetch(`${this.host}/api/tags`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!tagsRes.ok) {
        throw new OllamaError(`Ollama tags API returned HTTP ${tagsRes.status}`, 'HTTP_ERROR');
      }

      const tagsData = (await tagsRes.json()) as { models?: OllamaModelTag[] };
      const availableModels = (tagsData.models || []).map((m) => m.name);

      // Check if target model is present in tags
      const targetExactOrPrefix = availableModels.some(
        (m) => m === this.targetModel || m.startsWith(`${this.targetModel}:`)
      );

      // If target model not found, select first available model as fallback
      const activeModel = targetExactOrPrefix ? this.targetModel : availableModels[0] || this.targetModel;

      // 2. Fetch Ollama version (optional, best-effort)
      let version: string | undefined;
      try {
        const verRes = await fetch(`${this.host}/api/version`, {
          signal: AbortSignal.timeout(2000),
        });
        if (verRes.ok) {
          const verData = (await verRes.json()) as { version?: string };
          version = verData.version;
        }
      } catch {
        // Version endpoint is optional
      }

      return {
        connected: true,
        version,
        host: this.host,
        targetModel: this.targetModel,
        activeModel,
        modelFound: targetExactOrPrefix,
        availableModels,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        return {
          connected: false,
          host: this.host,
          targetModel: this.targetModel,
          activeModel: this.targetModel,
          modelFound: false,
          availableModels: [],
          latencyMs: Date.now() - startTime,
          error: 'Connection timed out while probing Ollama daemon',
        };
      }

      return {
        connected: false,
        host: this.host,
        targetModel: this.targetModel,
        activeModel: this.targetModel,
        modelFound: false,
        availableModels: [],
        latencyMs: Date.now() - startTime,
        error: err.message || 'Connection refused or host unreachable',
      };
    }
  }

  /**
   * Resolves which model to call: the requested model, the targetModel, or an available local fallback.
   */
  async resolveModel(requestedModel?: string): Promise<string> {
    if (requestedModel) return requestedModel;
    const health = await this.checkHealth();
    return health.activeModel;
  }

  /**
   * Executes a prompt and enforces structured JSON output using Ollama's native format: 'json'.
   * Handles timeouts, parses JSON, and throws typed domain errors.
   */
  async generateJson<T = unknown>(prompt: string, options?: OllamaGenerateOptions): Promise<T> {
    const timeoutMs = options?.timeoutMs || this.defaultTimeoutMs;
    const model = await this.resolveModel(options?.model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: options?.systemPrompt,
          format: 'json',
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.1, // low temperature for deterministic structured reasoning
          },
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        throw new OllamaError(
          `Ollama generate API returned HTTP ${response.status}: ${await response.text()}`,
          'GENERATE_ERROR'
        );
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      const rawText = data.response?.trim();

      if (!rawText) {
        throw new OllamaParseError('(empty response string)');
      }

      try {
        const parsed = JSON.parse(rawText) as T;
        return parsed;
      } catch (parseErr) {
        throw new OllamaParseError(rawText, parseErr);
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError' || err.code === 20) {
        throw new OllamaTimeoutError(timeoutMs);
      }
      if (err instanceof OllamaError) {
        throw err;
      }
      if (err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
        throw new OllamaConnectionError(this.host, err);
      }
      throw new OllamaError(err.message || 'Unknown Ollama invocation failure', 'UNKNOWN', err);
    }
  }

  /**
   * Executes a text prompt with timeout and connection error management.
   */
  async generateText(prompt: string, options?: OllamaGenerateOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || this.defaultTimeoutMs;
    const model = await this.resolveModel(options?.model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: options?.systemPrompt,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.2,
          },
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        throw new OllamaError(
          `Ollama generate API returned HTTP ${response.status}: ${await response.text()}`,
          'GENERATE_ERROR'
        );
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      return data.response?.trim() || '';
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError' || err.code === 20) {
        throw new OllamaTimeoutError(timeoutMs);
      }
      if (err instanceof OllamaError) {
        throw err;
      }
      if (err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
        throw new OllamaConnectionError(this.host, err);
      }
      throw new OllamaError(err.message || 'Unknown Ollama invocation failure', 'UNKNOWN', err);
    }
  }
}
