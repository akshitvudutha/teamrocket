import { Router, Request, Response } from 'express';
import { VoiceAssistantService } from '../services/voiceAssistantService.js';

export const createVoiceRouter = (voiceService: VoiceAssistantService): Router => {
  const router = Router();

  // Execute recognized voice command
  router.post('/voice/command', (req: Request, res: Response) => {
    const { command, context } = req.body;
    if (!command || typeof command !== 'string') {
      res.status(400).json({ error: 'Missing required field: command (string)' });
      return;
    }

    try {
      const result = voiceService.processCommand(command, context);
      res.json({
        success: true,
        result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

  // Transcription endpoint (Whisper bridge or provider check)
  router.post('/voice/transcribe', async (req: Request, res: Response) => {
    const { audioBase64, mimeType } = req.body;
    const whisperApiKey = process.env.OPENAI_API_KEY;

    if (!audioBase64) {
      res.status(400).json({
        error: 'Missing audioBase64 data.',
      });
      return;
    }

    // If an external Whisper API key is provided, proxy securely without leaking key to client
    if (whisperApiKey) {
      try {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
        formData.append('file', blob, 'audio.webm');
        formData.append('model', 'whisper-1');

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whisperApiKey}`,
          },
          body: formData,
        });

        if (whisperRes.ok) {
          const data: any = await whisperRes.json();
          res.json({
            success: true,
            provider: 'Whisper Cloud API',
            transcript: data.text,
          });
          return;
        }
      } catch (err: any) {
        console.warn('[Voice Assistant] Whisper API proxy failed:', err.message);
      }
    }

    // Fallback info when cloud Whisper is unconfigured
    res.json({
      success: true,
      provider: 'Web Speech API Fallback',
      message: 'Browser SpeechRecognition handles transcription natively with zero cloud fees.',
    });
  });

  return router;
};
