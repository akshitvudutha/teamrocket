export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    // User requested qwen3.5:4b as initial target model
    targetModel: process.env.OLLAMA_MODEL || 'qwen3.5:4b',
    // Fallback timeout in milliseconds
    defaultTimeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '30000', 10),
  },
};
