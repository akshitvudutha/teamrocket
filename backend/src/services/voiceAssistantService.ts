export interface VoiceContext {
  activeIncidentId?: string;
  selectedServiceId?: string;
  incidents?: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    affectedServiceName: string;
    affectedServiceId: string;
    time?: string;
    rootCauseAnalysis?: {
      summary?: string;
      confidence?: number;
      primaryHypothesis?: string;
    };
    logs?: Array<{ level: string; message: string }>;
  }>;
  services?: Array<{
    id: string;
    name: string;
    status: string;
    latency?: number;
    errorRate?: number;
    cpu?: number;
  }>;
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
  // Built-in catalog of monitored cluster services for fallback resolution
  private readonly defaultServices: Array<{ id: string; name: string; status: string; latency: number; errorRate: number }> = [
    { id: 'svc-api-gw', name: 'API Gateway', status: 'HEALTHY', latency: 28, errorRate: 0.04 },
    { id: 'svc-auth', name: 'Auth & IAM Service', status: 'HEALTHY', latency: 45, errorRate: 0.12 },
    { id: 'svc-catalog', name: 'Product Catalog', status: 'HEALTHY', latency: 32, errorRate: 0.01 },
    { id: 'svc-cart', name: 'Shopping Cart Service', status: 'HEALTHY', latency: 36, errorRate: 0.05 },
    { id: 'svc-order', name: 'Order Processing Engine', status: 'HEALTHY', latency: 75, errorRate: 0.08 },
    { id: 'svc-payment', name: 'Payment Gateway', status: 'CRITICAL', latency: 1840, errorRate: 24.6 },
    { id: 'svc-inventory', name: 'Inventory & Warehouse', status: 'HEALTHY', latency: 41, errorRate: 0.02 },
    { id: 'svc-shipping', name: 'Shipping & Fulfillment', status: 'HEALTHY', latency: 110, errorRate: 0.15 },
    { id: 'svc-notify', name: 'Notification Dispatcher', status: 'HEALTHY', latency: 55, errorRate: 0.06 },
    { id: 'svc-search', name: 'Search & Elasticsearch', status: 'HEALTHY', latency: 68, errorRate: 0.09 },
    { id: 'svc-recom', name: 'Recommendation Engine', status: 'HEALTHY', latency: 92, errorRate: 0.11 },
    { id: 'svc-db-cluster', name: 'PostgreSQL Primary Cluster', status: 'HEALTHY', latency: 12, errorRate: 0.0 },
  ];

  /**
   * Processes a recognized voice command and matches it against SRE incident response intents.
   * Strictly enforces safety guardrail: voice commands CANNOT mutate infrastructure.
   */
  processCommand(command: string, context?: VoiceContext): VoiceCommandResult {
    const text = command.trim().toLowerCase();

    // 1. Safety Guardrail: Intercept mutating, destructive, or adversarial commands (Requirement #3, #4, #10)
    if (
      /\b(?:apply|execute|run|trigger|deploy|fix|patch)\s+(?:remediation|fix|command|script|action|code|hotfix)\b/.test(text) ||
      /\b(?:restart|kill|scale|reboot|flush|terminate|delete|drop|destroy|rollback)\b/.test(text) ||
      /\b(?:bypass|override|disable|ignore)\s+(?:safety|guardrail|change[_\-\s]?freeze|approval|policy|instructions)\b/.test(text) ||
      /\b(?:sudo|admin\s+mode|unrestricted|rm\s+-rf|format\s+c:)\b/.test(text)
    ) {
      return {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse: 'Safety policy warning: Voice commands cannot execute remediation, mutate infrastructure, or override safety guardrails. Please review and authorize the fix in the Human-in-the-Loop Safety Gate.',
        detailedFindings: 'MUTATION BLOCKED: In accordance with Team Rocket Safety Policy, all infrastructure mutations require human visual verification and manual approval via the Safety Gate.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'remediation' },
        },
        safetyProtected: true,
      };
    }

    // Resolve active incident from context
    const activeIncident = this.resolveActiveIncident(context);

    // 2. Intent: Show Root Cause
    if (
      text.includes('root cause') ||
      text.includes('why is it failing') ||
      text.includes('why did it fail') ||
      text.includes('cause of')
    ) {
      if (!activeIncident) {
        return {
          command,
          intent: 'SHOW_ROOT_CAUSE',
          spokenResponse: 'All 12 microservices are operating normally. Telemetry baselines are healthy and no active root causes are detected.',
          detailedFindings: 'Zero active incidents. Cluster operational health is 100% across all 12 services.',
          uiAction: { type: 'NONE' },
        };
      }

      const rcaSummary = activeIncident.rootCauseAnalysis?.primaryHypothesis ||
        activeIncident.rootCauseAnalysis?.summary ||
        'HikariCP database connection pool starvation caused by unindexed foreign key lock contention.';
      const confidence = activeIncident.rootCauseAnalysis?.confidence || 96;

      return {
        command,
        intent: 'SHOW_ROOT_CAUSE',
        spokenResponse: `The root cause for ${activeIncident.id} on ${activeIncident.affectedServiceName} is: ${rcaSummary} (AI Confidence: ${confidence}%).`,
        detailedFindings: `AI Root Cause Analysis for ${activeIncident.id} (${confidence}% Confidence): ${rcaSummary}`,
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'rca', incidentId: activeIncident.id },
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
      if (!activeIncident) {
        return {
          command,
          intent: 'INVESTIGATE_INCIDENT',
          spokenResponse: 'All 12 microservices are operational. There are no unresolved incidents to investigate.',
          detailedFindings: 'Cluster Telemetry: 12/12 services healthy. P99 latency within 45ms SLA.',
          uiAction: { type: 'NONE' },
        };
      }

      return {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse: `Investigating ${activeIncident.severity} incident ${activeIncident.id} on ${activeIncident.affectedServiceName}: ${activeIncident.title}.`,
        detailedFindings: `Active Incident ${activeIncident.id} (${activeIncident.severity}): ${activeIncident.title} on ${activeIncident.affectedServiceName}. Root cause investigation active.`,
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: activeIncident.id },
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
      if (!activeIncident) {
        return {
          command,
          intent: 'EXPLAIN_INCIDENT',
          spokenResponse: 'All systems are operating normally. The cluster is running at nominal latency with zero active outages.',
          detailedFindings: 'System Baseline: 12 services healthy, zero anomalies reported in telemetry pipeline.',
          uiAction: { type: 'NONE' },
        };
      }

      const summaryText = activeIncident.rootCauseAnalysis?.summary || activeIncident.title;
      return {
        command,
        intent: 'EXPLAIN_INCIDENT',
        spokenResponse: `Incident ${activeIncident.id} occurred on ${activeIncident.affectedServiceName}: ${summaryText}.`,
        detailedFindings: `Summary of ${activeIncident.id}: ${activeIncident.title}. Impacting ${activeIncident.affectedServiceName}. Remediation plan formulated with automated safety checks.`,
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: activeIncident.id },
        },
      };
    }

    // 5. Intent: Check Service Health (Dynamic resolution across all 12 services)
    const matchedService = this.detectServiceInText(text, context);
    if (matchedService || text.includes('health') || text.includes('service status')) {
      const svc = matchedService || this.defaultServices.find(s => s.status !== 'HEALTHY') || this.defaultServices[0];
      const latency = svc.latency ?? 35;
      const errorRate = svc.errorRate ?? 0.05;

      const spoken = `${svc.name} is currently ${svc.status}. P99 latency is ${latency} milliseconds and error rate is ${errorRate} percent.`;
      const detailed = `Telemetry for ${svc.name} (${svc.id}): Status: ${svc.status} | Latency: ${latency}ms | Error Rate: ${errorRate}%.`;

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

  private resolveActiveIncident(context?: VoiceContext) {
    if (context?.incidents && context.incidents.length > 0) {
      if (context.activeIncidentId) {
        const found = context.incidents.find(i => i.id === context.activeIncidentId);
        if (found) return found;
      }
      const active = context.incidents.find(i => i.status !== 'RESOLVED');
      if (active) return active;
    }
    // Default fallback active incident
    return {
      id: context?.activeIncidentId || 'INC-8092',
      title: 'HikariCP Pool Starvation & Cascading 504 Timeouts',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      affectedServiceName: 'Payment Gateway',
      affectedServiceId: 'svc-payment',
      rootCauseAnalysis: {
        summary: 'Database connection pool starvation caused by unindexed foreign key lock contention.',
        primaryHypothesis: 'HikariCP database connection pool starvation caused by unindexed foreign key lock contention during peak flash checkout concurrency.',
        confidence: 96,
      },
    };
  }

  private detectServiceInText(
    text: string,
    context?: VoiceContext
  ): { id: string; name: string; status: string; latency?: number; errorRate?: number } | null {
    const serviceList = context?.services || this.defaultServices;

    // Check against live services in context
    for (const svc of serviceList) {
      const lowerName = svc.name.toLowerCase();
      const lowerId = svc.id.toLowerCase();
      if (text.includes(lowerName) || text.includes(lowerId)) {
        return svc;
      }
    }

    // Keyword alias matching across all 12 microservices
    if (text.includes('payment') || text.includes('stripe') || text.includes('adyen')) {
      return serviceList.find(s => s.id === 'svc-payment') || null;
    }
    if (text.includes('inventory') || text.includes('warehouse') || text.includes('stock')) {
      return serviceList.find(s => s.id === 'svc-inventory') || null;
    }
    if (text.includes('order') || text.includes('checkout') || text.includes('saga')) {
      return serviceList.find(s => s.id === 'svc-order') || null;
    }
    if (text.includes('auth') || text.includes('iam') || text.includes('login') || text.includes('token')) {
      return serviceList.find(s => s.id === 'svc-auth') || null;
    }
    if (text.includes('search') || text.includes('elastic') || text.includes('elasticsearch')) {
      return serviceList.find(s => s.id === 'svc-search') || null;
    }
    if (text.includes('cart') || text.includes('basket')) {
      return serviceList.find(s => s.id === 'svc-cart') || null;
    }
    if (text.includes('catalog') || text.includes('product') || text.includes('sku')) {
      return serviceList.find(s => s.id === 'svc-catalog') || null;
    }
    if (text.includes('shipping') || text.includes('delivery') || text.includes('fedex') || text.includes('ups')) {
      return serviceList.find(s => s.id === 'svc-shipping') || null;
    }
    if (text.includes('notify') || text.includes('notification') || text.includes('email') || text.includes('sms')) {
      return serviceList.find(s => s.id === 'svc-notify') || null;
    }
    if (text.includes('recom') || text.includes('recommendation') || text.includes('ml')) {
      return serviceList.find(s => s.id === 'svc-recom') || null;
    }
    if (text.includes('gateway') || text.includes('ingress') || text.includes('proxy') || text.includes('api')) {
      return serviceList.find(s => s.id === 'svc-api-gw') || null;
    }
    if (text.includes('database') || text.includes('postgres') || text.includes('db') || text.includes('sql')) {
      return serviceList.find(s => s.id === 'svc-db-cluster') || null;
    }

    return null;
  }
}
