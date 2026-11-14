import { createApp } from './app.js';
import { config } from './config.js';
import { OllamaClient } from './ollama/client.js';

const ollamaClient = new OllamaClient({
  host: config.ollama.host,
  targetModel: config.ollama.targetModel,
  defaultTimeoutMs: config.ollama.defaultTimeoutMs,
});

const app = createApp({ ollamaClient });

app.listen(config.port, async () => {
  console.log(`[Team Rocket Backend] Operational on http://localhost:${config.port}`);
  console.log(`[Team Rocket Backend] Probing Ollama at ${config.ollama.host}...`);

  const health = await ollamaClient.checkHealth();
  if (health.connected) {
    console.log(`[Team Rocket Backend] Ollama connected (v${health.version || 'unknown'})`);
    console.log(`[Team Rocket Backend] Target model: ${health.targetModel} (Found: ${health.modelFound})`);
    console.log(`[Team Rocket Backend] Active fallback/selected model: ${health.activeModel}`);
    console.log(`[Team Rocket Backend] Available models: ${health.availableModels.join(', ') || 'none'}`);
  } else {
    console.warn(`[Team Rocket Backend] Ollama unreachable: ${health.error}`);
  }
});
