import { Router, Request, Response } from 'express';
import { OllamaClient } from '../ollama/client.js';
import { config } from '../config.js';

export const createHealthRouter = (ollamaClient: OllamaClient): Router => {
  const router = Router();

  // Root health endpoint
  router.get('/health', async (_req: Request, res: Response) => {
    const ollamaStatus = await ollamaClient.checkHealth();
    res.json({
      status: 'UP',
      service: 'team-rocket-incident-agent-backend',
      timestamp: new Date().toISOString(),
      ollama: ollamaStatus,
    });
  });

  // Dedicated Ollama status check
  router.get('/ollama/status', async (_req: Request, res: Response) => {
    const status = await ollamaClient.checkHealth();
    res.json(status);
  });

  // Quick reasoning test endpoint
  router.post('/ollama/test-reasoning', async (req: Request, res: Response) => {
    const { prompt, model } = req.body;
    try {
      const result = await ollamaClient.generateJson<{ status: string; reasoning: string }>(
        prompt || 'Analyze this: Service payment-gw reported 504. Output JSON { "status": "ANALYZED", "reasoning": "High latency" }',
        {
          model,
          systemPrompt: 'You are an SRE incident analysis assistant. You only output valid JSON.',
        }
      );
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
        code: err.code || 'OLLAMA_ERROR',
      });
    }
  });

  return router;
};
