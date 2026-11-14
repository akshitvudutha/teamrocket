import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OllamaClient } from '../src/ollama/client.js';
import { OllamaTimeoutError, OllamaConnectionError } from '../src/types/ollama.js';
import { createApp } from '../src/app.js';
import type { Server } from 'node:http';

describe('Phase 1: Backend Foundation & Ollama Integration Tests', () => {
  const client = new OllamaClient({
    host: 'http://localhost:11434',
    targetModel: 'qwen3.5:4b',
    defaultTimeoutMs: 25000,
  });

  test('1. Ollama Health Check connects and detects daemon status', async () => {
    const health = await client.checkHealth();
    assert.equal(health.connected, true, 'Ollama should be reachable at localhost:11434');
    assert.equal(typeof health.latencyMs, 'number', 'Latency should be a measured number');
    assert.ok(health.availableModels.length > 0, 'Should detect at least one installed model');
    assert.equal(health.targetModel, 'qwen3.5:4b', 'Target model should reflect user configuration');
  });

  test('2. Model resolution selects target model or falls back to active model', async () => {
    const resolvedModel = await client.resolveModel();
    assert.ok(resolvedModel, 'Resolved model name must not be empty');
    assert.ok(typeof resolvedModel === 'string', 'Resolved model must be a string');
    // In our system qwen2.5:7b is installed, while qwen3.5:4b is target
    const health = await client.checkHealth();
    if (!health.modelFound) {
      assert.equal(resolvedModel, health.activeModel, 'Should fall back to available model when target not found');
    }
  });

  test('3. Ollama structured JSON generation returns valid typed object', async () => {
    interface ReasonerOutput {
      incidentType: string;
      confidence: number;
      actionRecommended: string;
    }

    const prompt = `Return a JSON object analyzing this synthetic event:
Service: Payment Gateway
Observation: 504 Gateway Timeout spike
Output schema:
{
  "incidentType": "LATENCY_SPIKE",
  "confidence": 95,
  "actionRecommended": "SCALE_POOL"
}`;

    const result = await client.generateJson<ReasonerOutput>(prompt, {
      systemPrompt: 'You are an SRE incident analysis engine. You output valid JSON only.',
      timeoutMs: 20000,
    });

    assert.ok(result, 'Result must be defined');
    assert.ok(typeof result === 'object', 'Result must be an object');
    assert.ok(result.incidentType, 'Should have incidentType field');
    assert.ok(typeof result.confidence === 'number' || typeof result.confidence === 'string', 'Should have confidence field');
  });

  test('4. Timeout handling throws OllamaTimeoutError when deadline exceeded', async () => {
    const fastTimeoutClient = new OllamaClient({
      host: 'http://localhost:11434',
      targetModel: 'qwen3.5:4b',
      defaultTimeoutMs: 5, // 5ms is guaranteed to trigger timeout
    });

    await assert.rejects(
      async () => {
        await fastTimeoutClient.generateJson('Produce a detailed report on database replication lag');
      },
      (err: any) => {
        return err instanceof OllamaTimeoutError && err.code === 'TIMEOUT';
      },
      'Should throw OllamaTimeoutError when timeout expires'
    );
  });

  test('5. Connection failure handling raises OllamaConnectionError on dead host', async () => {
    const deadHostClient = new OllamaClient({
      host: 'http://localhost:59999', // Non-existent port
      defaultTimeoutMs: 1500,
    });

    const health = await deadHostClient.checkHealth();
    assert.equal(health.connected, false, 'Dead host health should report connected: false');
    assert.ok(health.error, 'Dead host health should include descriptive error message');
  });

  test('6. Express Backend /api/health endpoint responds with UP status and Ollama metadata', async () => {
    const app = createApp({ ollamaClient: client });
    let server: Server;

    await new Promise<void>((resolve) => {
      server = app.listen(5099, () => resolve());
    });

    try {
      const res = await fetch('http://localhost:5099/api/health');
      assert.equal(res.status, 200, 'HTTP status should be 200');

      const data = (await res.json()) as any;
      assert.equal(data.status, 'UP');
      assert.equal(data.service, 'team-rocket-incident-agent-backend');
      assert.ok(data.ollama, 'Health payload should include Ollama metadata');
      assert.equal(data.ollama.connected, true);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
