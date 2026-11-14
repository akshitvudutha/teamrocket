export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { logs, defaultService } = req.body || {};
  if (!logs) {
    return res.status(400).json({ error: 'Missing logs array or string in request body.' });
  }

  const lines = Array.isArray(logs) ? logs : String(logs).split(/\r?\n/);
  const normalizedEntries: any[] = [];
  let suspiciousCount = 0;
  const detectedFormats = new Set<string>();

  const injectionRegexes = [
    /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+instructions\b/i,
    /\b(?:you\s+are\s+now|act\s+as)\s+(?:unrestricted|DAN|root|sudo|admin|developer\s+mode)\b/i,
    /\b(?:reveal|print|repeat|output|show|echo)\s+(?:the\s+)?(?:system\s+prompt|initial\s+instructions)\b/i,
    /\b(?:disable|bypass|skip|ignore)\s+(?:all\s+)?(?:safety|guardrail|change[_\-\s]?freeze|approval)\b/i,
    /\b(?:rm\s+-rf\s+[\/\*]|DROP\s+TABLE|format\s+c:)\b/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine.trim().length === 0 && (i === lines.length - 1 || lines.length > 500)) continue;

    let format = 'unstructured';
    let severity = 'INFO';
    let service = defaultService || 'application';
    let message = rawLine.trim();
    let timestamp = new Date().toISOString();
    let metadata: any = {};

    // JSON detection
    if (rawLine.trim().startsWith('{') && rawLine.trim().endsWith('}')) {
      try {
        const obj = JSON.parse(rawLine.trim());
        format = 'json';
        service = obj.service || obj.app || service;
        message = obj.message || obj.msg || JSON.stringify(obj);
        severity = (obj.level || obj.severity || 'INFO').toUpperCase();
        timestamp = obj.timestamp ? new Date(obj.timestamp).toISOString() : timestamp;
        metadata = obj;
      } catch {
        format = 'unstructured';
      }
    } else if (/^<\d+>1\s+/.test(rawLine.trim())) {
      format = 'syslog';
      severity = 'ERROR';
    } else if (/\[\d{2}\/[A-Za-z]{3}\/\d{4}/.test(rawLine.trim())) {
      format = 'apache';
    }

    detectedFormats.add(format);

    // Prompt injection check
    let isSuspicious = false;
    const reasons: string[] = [];
    for (const rule of injectionRegexes) {
      if (rule.test(message)) {
        isSuspicious = true;
        reasons.push('Hostile instruction or injection pattern detected');
        suspiciousCount++;
        break;
      }
    }

    normalizedEntries.push({
      id: `ev-${Date.now()}-${i}`,
      timestamp,
      service,
      severity,
      message,
      source: format,
      originalMessage: rawLine,
      metadata,
      isSuspicious,
      suspiciousReasons: isSuspicious ? reasons : undefined,
    });
  }

  res.status(200).json({
    success: true,
    bundle: {
      bundleId: `evb-${Date.now()}`,
      collectedAt: new Date().toISOString(),
      totalEntries: normalizedEntries.length,
      normalizedLogs: normalizedEntries,
      suspiciousCount,
      detectedFormats: Array.from(detectedFormats),
      adversarialAttemptsDetected: suspiciousCount > 0,
    },
  });
}
