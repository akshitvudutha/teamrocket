export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { command, context } = req.body || {};
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Missing required field: command (string)' });
  }

  const lower = command.toLowerCase();

  // SAFETY INVARIANT: Strictly block voice commands requesting remediation actions
  const remediationKeywords = [
    'remediate',
    'restart',
    'reboot',
    'scale',
    'kill',
    'terminate',
    'flush',
    'fix',
    'rollback',
    'deploy',
    'execute',
    'wipe',
    'delete',
    'drop',
  ];

  const attemptsRemediation = remediationKeywords.some((kw) => lower.includes(kw));

  if (attemptsRemediation) {
    return res.status(200).json({
      success: true,
      result: {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse:
          'Remediation actions cannot be executed via voice commands alone. Safety policy requires an authorized human approval gate in the dashboard.',
        detailedFindings:
          'SAFETY INVARIANT ENFORCED: Dual-layer security policy blocked direct mutation. SRE Commander must explicitly authorize cluster actions.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'approval_gate' },
        },
        safetyProtected: true,
      },
    });
  }

  // Investigation intent
  if (lower.includes('investigate') || lower.includes('what happened') || lower.includes('issue')) {
    return res.status(200).json({
      success: true,
      result: {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse:
          'Investigating critical incident INC-2026-891 on Core Ingress API Gateway. Root cause identified as PostgreSQL pool exhaustion caused by unindexed cart query lock contention.',
        detailedFindings:
          'Traffic spike of 14,200 req/s saturated connection limit (100). Envoy timed out after 15 seconds, returning HTTP 504 Gateway Timeout cascade.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: 'INC-2026-891', websiteId: 'site-2' },
        },
      },
    });
  }

  // Root Cause intent
  if (lower.includes('root cause') || lower.includes('why')) {
    return res.status(200).json({
      success: true,
      result: {
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
      },
    });
  }

  // Check service health intent
  if (lower.includes('payment') || lower.includes('health') || lower.includes('status')) {
    return res.status(200).json({
      success: true,
      result: {
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
      },
    });
  }

  // Generate postmortem intent
  if (lower.includes('postmortem') || lower.includes('report')) {
    return res.status(200).json({
      success: true,
      result: {
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
      },
    });
  }

  // Default narrative
  return res.status(200).json({
    success: true,
    result: {
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
    },
  });
}
