import { Router, Request, Response } from 'express';
import { EvidencePipeline } from '../logs/pipeline.js';

export const createEvidenceRouter = (pipeline: EvidencePipeline): Router => {
  const router = Router();

  // Normalize batch of raw logs into an EvidenceBundle
  router.post('/evidence/normalize', (req: Request, res: Response) => {
    const { logs, defaultService } = req.body;
    if (!logs) {
      res.status(400).json({ error: 'Missing required field: logs' });
      return;
    }

    try {
      const bundle = pipeline.processLogs(logs, { defaultService });
      res.json({
        success: true,
        bundle,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // Check registered parsers
  router.get('/evidence/parsers', (_req: Request, res: Response) => {
    res.json({
      success: true,
      registeredParsers: [
        { id: 'json', name: 'JSON Lines Parser' },
        { id: 'syslog', name: 'Syslog Parser (RFC 5424 / RFC 3164)' },
        { id: 'apache', name: 'Apache Common & Combined Access Log Parser' },
        { id: 'unstructured', name: 'Unstructured & Plain-Text Fallback Parser' },
      ],
    });
  });

  return router;
};
