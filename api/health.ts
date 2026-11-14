export default async function handler(_req: any, res: any) {
  const ollamaHost = process.env.OLLAMA_HOST;
  let ollamaStatus: any = {
    connected: false,
    mode: 'LOCAL_WORKSTATION',
    note: 'Ollama runs on local engineer workstation. Set OLLAMA_HOST env var to connect a secure tunnel or cloud GPU.',
  };

  if (ollamaHost) {
    try {
      const probeRes = await fetch(`${ollamaHost}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (probeRes.ok) {
        const data: any = await probeRes.json();
        ollamaStatus = {
          connected: true,
          mode: 'REMOTE_TUNNEL_OR_CLOUD',
          host: ollamaHost,
          availableModels: (data.models || []).map((m: any) => m.name),
        };
      }
    } catch (err: any) {
      ollamaStatus.error = err.message;
    }
  }

  res.status(200).json({
    status: 'UP',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
    service: 'team-rocket-incident-agent',
    ollama: ollamaStatus,
  });
}
