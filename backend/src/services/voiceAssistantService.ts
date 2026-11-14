export interface VoiceContext {
  activeIncidentId?: string;
  selectedServiceId?: string;
}

export interface VoiceCommandResult {
  command: string;
  intent: 'INVESTIGATE_INCIDENT' | 'SHOW_ROOT_CAUSE' | 'CHECK_SERVICE_HEALTH' | 'GENERATE_POSTMORTEM' | 'EXPLAIN_INCIDENT' | 'BLOCKED_REMEDIATION' | 'UNKNOWN';
  spokenResponse: string;
  detailedFindings: string;
  uiAction: {
    type: 'OPEN_INCIDENT' | 'SELECT_SERVICE' | 'SWITCH_TAB' | 'SHOW_MODAL_TAB' | 'NONE';
    payload?: Record<string, unknown>;
  };
  safetyProtected?: boolean;
}

export class VoiceAssistantService {
  /**
   * Processes a recognized voice command and matches it against SRE incident response intents.
   * Strictly enforces safety guardrail: voice commands CANNOT mutate infrastructure.
   */
  processCommand(command: string, context?: VoiceContext): VoiceCommandResult {
    const text = command.trim().toLowerCase();

    // 1. Safety Guardrail: Intercept mutating commands (Requirement #10)
    if (
      /\b(?:apply|execute|run|trigger|deploy|fix|patch)\s+(?:remediation|fix|command|script|patch|action)\b/.test(text) ||
      /\b(?:restart|kill|scale|reboot|flush|terminate)\b/.test(text)
    ) {
      return {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse: 'Safety policy warning: Voice commands cannot execute remediation or mutate infrastructure. Please review and authorize the fix in the Human-in-the-Loop Safety Gate.',
        detailedFindings: 'MUTATION BLOCKED: In accordance with Team Rocket Safety Policy, all infrastructure mutations require human visual verification and manual approval via the Safety Gate.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'remediation' },
        },
        safetyProtected: true,
      };
    }

    // 2. Intent: Show Root Cause
    if (
      text.includes('root cause') ||
      text.includes('why is it failing') ||
      text.includes('why did it fail') ||
      text.includes('cause of')
    ) {
      return {
        command,
        intent: 'SHOW_ROOT_CAUSE',
        spokenResponse: 'The root cause is HikariCP database connection pool starvation caused by unindexed foreign key lock contention during peak flash checkout concurrency.',
        detailedFindings: 'AI Root Cause Analysis (96% Confidence): Deployment v2.14.0 introduced synchronous foreign key audit locks on table `payment_transactions` without an index on `order_reference_id`, causing row-level lock queues that exhausted all 50 connection sockets.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'rca' },
        },
      };
    }

    // 3. Intent: Investigate Current Incident
    if (
      text.includes('investigate') ||
      text.includes('start investigation') ||
      text.includes('analyze incident') ||
      text.includes('check incident')
    ) {
      return {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse: 'Investigating critical incident INC-8092 on the Payment Gateway. 504 Gateway Timeouts are cascading to the Order Processing Engine.',
        detailedFindings: 'Incident INC-8092 Active: Payment Gateway experiencing 1,840ms P99 latency and 24.6% error rate. 18 correlated traces show HikariCP lock wait timeouts cascading upstream to reverse proxy gateways.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: context?.activeIncidentId || 'INC-8092' },
        },
      };
    }

    // 4. Intent: Explain Latest Incident
    if (
      text.includes('explain') ||
      text.includes('what happened') ||
      text.includes('summary of incident') ||
      text.includes('overview of incident')
    ) {
      return {
        command,
        intent: 'EXPLAIN_INCIDENT',
        spokenResponse: 'At 12:24 UTC, high volume checkout concurrency triggered row-level database locks in Payment Gateway, driving latency to 1,840 milliseconds and impacting approximately 1,420 checkout attempts.',
        detailedFindings: 'Summary of INC-8092: Payment service pool reached 50/50 connection cap with 124 waiting threads. Downstream services dropped client connections with HTTP 504. SRE remediation plan formulated with pod scaling and replica offload.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: context?.activeIncidentId || 'INC-8092' },
        },
      };
    }

    // 5. Intent: Check Service Health (Payment or any specific service)
    const serviceMatch = this.detectServiceInText(text);
    if (serviceMatch || text.includes('health') || text.includes('service status')) {
      const svc = serviceMatch || {
        id: 'svc-payment',
        name: 'Payment Gateway',
        status: 'CRITICAL',
        latency: 1840,
        errorRate: 24.6,
      };

      const spoken = `${svc.name} is currently ${svc.status}. P99 latency is ${svc.latency} milliseconds and error rate is ${svc.errorRate} percent.`;
      const detailed = `Telemetry for ${svc.name} (${svc.id}): Status: ${svc.status} | Latency: ${svc.latency}ms | Error Rate: ${svc.errorRate}% | Pods: 8 active.`;

      return {
        command,
        intent: 'CHECK_SERVICE_HEALTH',
        spokenResponse: spoken,
        detailedFindings: detailed,
        uiAction: {
          type: 'SELECT_SERVICE',
          payload: { serviceId: svc.id },
        },
      };
    }

    // 6. Intent: Generate Postmortem
    if (
      text.includes('postmortem') ||
      text.includes('post-mortem') ||
      text.includes('incident report') ||
      text.includes('generate report')
    ) {
      return {
        command,
        intent: 'GENERATE_POSTMORTEM',
        spokenResponse: 'Navigating to SRE reports. Incident post-mortem is ready with timeline, telemetry deltas, and automated JSON export.',
        detailedFindings: 'Post-Mortem Ready: Mean Time To Resolution benchmarked at 6.4 minutes. AI automated root cause synthesis achieved 96.8% accuracy with 0 manual code rollbacks needed.',
        uiAction: {
          type: 'SWITCH_TAB',
          payload: { tab: 'reports' },
        },
      };
    }

    // 7. Fallback / Unknown
    return {
      command,
      intent: 'UNKNOWN',
      spokenResponse: `Command received: "${command}". Try asking me to investigate the incident, show the root cause, check payment health, or generate a postmortem.`,
      detailedFindings: `Unrecognized voice instruction: "${command}". Supported voice queries include: "Investigate the current incident", "Show the root cause", "Check payment service health", "Generate a postmortem", or "Explain the latest incident".`,
      uiAction: {
        type: 'NONE',
      },
    };
  }

  private detectServiceInText(text: string): { id: string; name: string; status: string; latency: number; errorRate: number } | null {
    if (text.includes('payment')) {
      return { id: 'svc-payment', name: 'Payment Gateway', status: 'CRITICAL', latency: 1840, errorRate: 24.6 };
    }
    if (text.includes('auth') || text.includes('iam') || text.includes('login')) {
      return { id: 'svc-auth', name: 'Auth & IAM Service', status: 'HEALTHY', latency: 45, errorRate: 0.12 };
    }
    if (text.includes('search') || text.includes('elastic')) {
      return { id: 'svc-search', name: 'Search & Elasticsearch', status: 'DEGRADED', latency: 380, errorRate: 4.8 };
    }
    if (text.includes('catalog') || text.includes('product')) {
      return { id: 'svc-catalog', name: 'Product Catalog', status: 'HEALTHY', latency: 32, errorRate: 0.01 };
    }
    if (text.includes('cart')) {
      return { id: 'svc-cart', name: 'Shopping Cart Service', status: 'HEALTHY', latency: 36, errorRate: 0.05 };
    }
    if (text.includes('order')) {
      return { id: 'svc-order', name: 'Order Processing Engine', status: 'HEALTHY', latency: 75, errorRate: 0.08 };
    }
    if (text.includes('database') || text.includes('postgres') || text.includes('db')) {
      return { id: 'svc-db-cluster', name: 'PostgreSQL Primary Cluster', status: 'HEALTHY', latency: 12, errorRate: 0.0 };
    }
    return null;
  }
}
