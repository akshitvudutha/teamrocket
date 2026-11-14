export interface OllamaModelTag {
  name: string;
  model: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaHealthStatus {
  connected: boolean;
  version?: string;
  host: string;
  targetModel: string;
  activeModel: string;
  modelFound: boolean;
  availableModels: string[];
  latencyMs: number;
  error?: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  systemPrompt?: string;
  timeoutMs?: number;
  temperature?: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaError extends Error {
  constructor(message: string, public readonly code: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'OllamaError';
  }
}

export class OllamaTimeoutError extends OllamaError {
  constructor(timeoutMs: number) {
    super(`Ollama request timed out after ${timeoutMs}ms`, 'TIMEOUT');
    this.name = 'OllamaTimeoutError';
  }
}

export class OllamaConnectionError extends OllamaError {
  constructor(host: string, cause?: unknown) {
    super(`Failed to connect to Ollama daemon at ${host}`, 'CONNECTION_REFUSED', cause);
    this.name = 'OllamaConnectionError';
  }
}

export class OllamaParseError extends OllamaError {
  constructor(rawOutput: string, cause?: unknown) {
    super(`Failed to parse structured JSON from Ollama output: ${rawOutput}`, 'JSON_PARSE_ERROR', cause);
    this.name = 'OllamaParseError';
  }
}
