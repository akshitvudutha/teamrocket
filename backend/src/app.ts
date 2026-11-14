import express, { Express } from 'express';
import cors from 'cors';
import { OllamaClient } from './ollama/client.js';
import { EvidencePipeline } from './logs/pipeline.js';
import { VoiceAssistantService } from './services/voiceAssistantService.js';
import { createHealthRouter } from './routes/health.js';
import { createEvidenceRouter } from './routes/evidenceRoutes.js';
import { createVoiceRouter } from './routes/voiceRoutes.js';

export interface AppContext {
  ollamaClient: OllamaClient;
  evidencePipeline: EvidencePipeline;
  voiceService: VoiceAssistantService;
}

export const createApp = (ctx?: Partial<AppContext>): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // Support large log batches & audio blobs

  const ollamaClient = ctx?.ollamaClient || new OllamaClient();
  const evidencePipeline = ctx?.evidencePipeline || new EvidencePipeline();
  const voiceService = ctx?.voiceService || new VoiceAssistantService();

  // Mount API routers
  app.use('/api', createHealthRouter(ollamaClient));
  app.use('/api', createEvidenceRouter(evidencePipeline));
  app.use('/api', createVoiceRouter(voiceService));

  return app;
};
