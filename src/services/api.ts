import { VoiceCommandResult } from '../types/tarsier';

const getBaseUrl = (): string => {
  // If running locally on localhost/127.0.0.1, Express backend is on port 5000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  // On deployed production (Vercel), endpoints are served under /api
  return '';
};

export interface HealthResponse {
  status: string;
  platform: string;
  timestamp: string;
  service: string;
  ollama: {
    connected: boolean;
    mode?: string;
    model?: string;
    note?: string;
  };
}

export interface NormalizeLogResponse {
  success: boolean;
  bundle: {
    bundleId: string;
    collectedAt: string;
    totalEntries: number;
    normalizedLogs: Array<{
      id: string;
      timestamp: string;
      service: string;
      severity: string;
      message: string;
      source: string;
      originalMessage: string;
      isSuspicious: boolean;
      suspiciousReasons?: string[];
    }>;
    suspiciousCount: number;
    detectedFormats: string[];
    adversarialAttemptsDetected: boolean;
  };
}

export class TarsierApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      // Fallback for offline demo mode
      return {
        status: 'UP',
        platform: 'TARSIER Local Client (Demo Fallback)',
        timestamp: new Date().toISOString(),
        service: 'team-rocket-incident-agent',
        ollama: { connected: false, note: 'Backend unreachable. Running client-side simulation.' },
      };
    }
  }

  async normalizeLogs(logs: string[], defaultService: string = 'ingress-gateway'): Promise<NormalizeLogResponse> {
    const endpoints = [
      `${this.baseUrl}/api/evidence/normalize`,
      `${this.baseUrl}/api/evidence`,
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs, defaultService }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // try next endpoint
      }
    }

    // Client-side fallback normalizer with prompt injection defense
    const injectionPatterns = [
      /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+instructions\b/i,
      /\b(?:you\s+are\s+now|act\s+as)\s+(?:unrestricted|DAN|root|sudo|admin|developer\s+mode)\b/i,
      /\b(?:disable|bypass|skip|ignore)\s+(?:all\s+)?(?:safety|guardrail|approval)\b/i,
      /\b(?:rm\s+-rf|DROP\s+TABLE|format\s+c:)\b/i,
    ];

    const normalizedLogs = logs.map((raw, idx) => {
      let isSuspicious = false;
      const suspiciousReasons: string[] = [];
      for (const pat of injectionPatterns) {
        if (pat.test(raw)) {
          isSuspicious = true;
          suspiciousReasons.push('Hostile instruction pattern neutralized');
          break;
        }
      }

      let source = 'unstructured';
      let severity = 'INFO';
      if (raw.trim().startsWith('{')) source = 'json';
      else if (/<\d+>1/.test(raw)) source = 'syslog';
      else if (/\[\d{2}\/[A-Za-z]{3}\/\d{4}/.test(raw)) source = 'apache';

      if (raw.includes('504') || raw.includes('timeout') || raw.includes('error') || raw.includes('FATAL')) {
        severity = 'ERROR';
      }

      return {
        id: `norm-client-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
        service: defaultService,
        severity,
        message: raw,
        source,
        originalMessage: raw,
        isSuspicious,
        suspiciousReasons: isSuspicious ? suspiciousReasons : undefined,
      };
    });

    const suspiciousCount = normalizedLogs.filter((l) => l.isSuspicious).length;

    return {
      success: true,
      bundle: {
        bundleId: `evb-client-${Date.now()}`,
        collectedAt: new Date().toISOString(),
        totalEntries: normalizedLogs.length,
        normalizedLogs,
        suspiciousCount,
        detectedFormats: ['json', 'syslog', 'apache', 'unstructured'],
        adversarialAttemptsDetected: suspiciousCount > 0,
      },
    };
  }

  async sendVoiceCommand(command: string, context?: any): Promise<VoiceCommandResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, context }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.result || data;
      }
    } catch (err) {
      console.warn('[TarsierApiClient] Backend voice endpoint unreachable, using client rule engine:', err);
    }

    // Client-side rule engine (matches backend rules for reliability)
    const lower = command.toLowerCase();

    // SAFETY RULE: Block remediation
    const remediationKeywords = ['remediate', 'restart', 'reboot', 'scale', 'kill', 'flush', 'fix', 'rollback', 'deploy'];
    const isRemediation = remediationKeywords.some((kw) => lower.includes(kw));

    if (isRemediation) {
      return {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse:
          'Remediation actions cannot be executed via voice commands alone. Safety policy requires an authorized human approval gate in the dashboard.',
        detailedFindings:
          'SAFETY INVARIANT ENFORCED: Dual-layer security policy blocked direct mutation. SRE Commander must explicitly approve remediation.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'approval_gate' },
        },
        safetyProtected: true,
      };
    }

    if (lower.includes('investigate') || lower.includes('what happened')) {
      return {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse:
          'Investigating critical incident INC-2026-891 on Core Ingress API Gateway. Root cause identified as PostgreSQL pool exhaustion caused by unindexed cart query lock contention under surge traffic.',
        detailedFindings:
          'Causal chain: 14.2k req/s traffic spike -> cart query pool saturation -> 100/100 connections held -> Envoy 15s timeout -> HTTP 504 cascade.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: 'INC-2026-891', websiteId: 'site-2' },
        },
      };
    }

    if (lower.includes('root cause') || lower.includes('why')) {
      return {
        command,
        intent: 'SHOW_ROOT_CAUSE',
        spokenResponse:
          'The primary root cause is database connection pool exhaustion with 94% AI confidence. Envoy proxy reached its 15 second timeout deadline.',
        detailedFindings:
          'Unindexed composite query on cart_items(user_id, status) led to sequential scans and connection queue lock contention.',
        uiAction: {
          type: 'SWITCH_TAB',
          payload: { tab: 'ai-investigation' },
        },
      };
    }

    if (lower.includes('payment') || lower.includes('health') || lower.includes('status')) {
      return {
        command,
        intent: 'CHECK_SERVICE_HEALTH',
        spokenResponse:
          'Global Payments & Stripe Bridge is currently at Warning status. Latency is 320 milliseconds with webhooks queued due to upstream gateway pressure.',
        detailedFindings:
          '0% payment transaction drop. Webhook queue accumulating at 48 items/min.',
        uiAction: {
          type: 'SELECT_SERVICE',
          payload: { websiteId: 'site-4' },
        },
      };
    }

    if (lower.includes('postmortem') || lower.includes('report')) {
      return {
        command,
        intent: 'GENERATE_POSTMORTEM',
        spokenResponse:
          'Generated postmortem report for incident INC-2026-891. MTTD was 12 seconds. Remediation awaiting Human Approval Gate.',
        detailedFindings:
          'Comprehensive incident report ready with timeline, blast radius, causal chain, and preventative action items.',
        uiAction: {
          type: 'SWITCH_TAB',
          payload: { tab: 'postmortem' },
        },
      };
    }

    return {
      command,
      intent: 'EXPLAIN_INCIDENT',
      spokenResponse:
        'TARSIER Night Guard is surveilling 12 targets. One critical incident is active on Core Ingress API Gateway with 504 timeouts.',
      detailedFindings:
        'Automated SRE surveillance is running across 5 global regions with deterministic safety guardrails active.',
      uiAction: {
        type: 'OPEN_INCIDENT',
        payload: { incidentId: 'INC-2026-891', websiteId: 'site-2' },
      },
    };
  }
}

export const api = new TarsierApiClient();
