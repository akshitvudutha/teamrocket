import express, { Express } from 'express';
import cors from 'cors';
import { OllamaClient } from './ollama/client.js';
import { EvidencePipeline } from './logs/pipeline.js';
import { createHealthRouter } from './routes/health.js';
import { createEvidenceRouter } from './routes/evidenceRoutes.js';

export interface AppContext {
  ollamaClient: OllamaClient;
  evidencePipeline: EvidencePipeline;
}

export const createApp = (ctx?: Partial<AppContext>): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Support large log batches

  const ollamaClient = ctx?.ollamaClient || new OllamaClient();
  const evidencePipeline = ctx?.evidencePipeline || new EvidencePipeline();

  // Mount API routers
  app.use('/api', createHealthRouter(ollamaClient));
  app.use('/api', createEvidenceRouter(evidencePipeline));

  return app;
};
