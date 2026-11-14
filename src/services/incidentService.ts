import { INITIAL_SERVICES, INITIAL_INCIDENTS, SIMULATION_SCENARIOS, SimulationScenario } from '../data/mockData';
import { Incident, ServiceHealth, LogEntry, MetricDataPoint } from '../types';

/**
 * Incident Service Adapter
 * 
 * NOTE FOR HACKATHON EVALUATORS & TEAM ROCKET:
 * This module isolates all mock data handling and state mutations.
 * To integrate with the hackathon organizer's live backend/agent API:
 * Replace these internal memory handlers with fetch/axios or WebSocket calls.
 */

let servicesState: ServiceHealth[] = [...INITIAL_SERVICES];
let incidentsState: Incident[] = [...INITIAL_INCIDENTS];

export const getServices = (): ServiceHealth[] => {
  return [...servicesState];
};

export const getIncidents = (): Incident[] => {
  return [...incidentsState];
};

export const getIncidentById = (id: string): Incident | undefined => {
  return incidentsState.find(inc => inc.id === id);
};

export const approveRemediation = (
  incidentId: string, 
  approver: string = 'Human On-Call SRE (TARSIER)'
): Incident | null => {
  const incidentIndex = incidentsState.findIndex(inc => inc.id === incidentId);
  if (incidentIndex === -1) return null;

  const incident = { ...incidentsState[incidentIndex] };
  incident.remediation = {
    ...incident.remediation,
    approvalStatus: 'APPROVED',
    approvedBy: approver,
    approvedAt: new Date().toLocaleTimeString() + ' UTC',
  };
  incident.status = 'MITIGATING';
  incident.recovery = {
    ...incident.recovery,
    phase: 'DEPLOYING_FIX',
    progressPercent: Math.max(incident.recovery.progressPercent, 75),
    steps: incident.recovery.steps.map(step => 
      step.name.includes('Review') || step.name.includes('Approval') || step.name.includes('Safety')
        ? { ...step, status: 'completed' as const }
        : step
    ),
  };

  incidentsState[incidentIndex] = incident;
  return incident;
};

export const executeRecoveryProgress = (
  incidentId: string
): Incident | null => {
  const incidentIndex = incidentsState.findIndex(inc => inc.id === incidentId);
  if (incidentIndex === -1) return null;

  const incident = { ...incidentsState[incidentIndex] };
  incident.recovery = {
    ...incident.recovery,
    progressPercent: 100,
    phase: 'STABILIZED',
    steps: incident.recovery.steps.map(s => ({ ...s, status: 'completed' as const })),
    postVerification: {
      latencyNormal: true,
      errorRateUnderThreshold: true,
      canaryTrafficHealthy: true,
    },
  };
  incident.status = 'RESOLVED';
  incident.resolvedAt = new Date().toLocaleTimeString() + ' UTC (Just now)';
  
  // Also recover the affected service
  const serviceIndex = servicesState.findIndex(s => s.id === incident.affectedServiceId);
  if (serviceIndex !== -1) {
    servicesState[serviceIndex] = {
      ...servicesState[serviceIndex],
      status: 'HEALTHY',
      latency: Math.floor(Math.random() * 20) + 25,
      errorRate: 0.02,
      cpu: Math.floor(Math.random() * 15) + 30,
      memory: Math.floor(Math.random() * 15) + 45,
    };
  }

  incidentsState[incidentIndex] = incident;
  return incident;
};

export const simulateScenario = (scenarioId?: string): { incident: Incident; service: ServiceHealth } => {
  const scenario: SimulationScenario = scenarioId 
    ? SIMULATION_SCENARIOS.find(s => s.id === scenarioId) || SIMULATION_SCENARIOS[0]
    : SIMULATION_SCENARIOS[Math.floor(Math.random() * SIMULATION_SCENARIOS.length)];

  const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowTime = new Date().toLocaleTimeString();

  const newLogs: LogEntry[] = [
    {
      id: `log-${Date.now()}-1`,
      timestamp: `${nowTime}.104`,
      level: 'WARN',
      service: scenario.serviceName,
      message: `Anomalous latency spike detected on endpoint /api/v1/${scenario.serviceId.replace('svc-', '')}`,
      traceId: `tr-${Math.random().toString(36).substring(2, 9)}`,
    },
    {
      id: `log-${Date.now()}-2`,
      timestamp: `${nowTime}.312`,
      level: 'FATAL',
      service: scenario.serviceName,
      message: `Critical runtime alert: ${scenario.description}`,
      traceId: `tr-${Math.random().toString(36).substring(2, 9)}`,
    },
    {
      id: `log-${Date.now()}-3`,
      timestamp: `${nowTime}.550`,
      level: 'INFO',
      service: 'TARSIER Agent',
      message: `Autonomous diagnosis started. Synthesizing telemetry and generating remediation steps.`,
      traceId: 'tarsier-agent',
    },
  ];

  const newMetrics: MetricDataPoint[] = [
    { time: 'T-15m', latencyMs: 35, errorRatePercent: 0.01, requestsPerSec: 1200, cpuPercent: 35 },
    { time: 'T-10m', latencyMs: 50, errorRatePercent: 0.04, requestsPerSec: 1350, cpuPercent: 42 },
    { time: 'T-5m', latencyMs: 420, errorRatePercent: 6.80, requestsPerSec: 1650, cpuPercent: 78 },
    { time: 'Now', latencyMs: 1450, errorRatePercent: 28.5, requestsPerSec: 980, cpuPercent: 94 },
  ];

  const newIncident: Incident = {
    id: incidentId,
    title: scenario.incidentTitle,
    severity: scenario.severity,
    status: 'INVESTIGATING',
    affectedServiceId: scenario.serviceId,
    affectedServiceName: scenario.serviceName,
    detectedAt: `${nowTime} UTC (Just now)`,
    summary: scenario.description,
    rootCause: {
      summary: scenario.mockRca,
      primaryTrigger: `Concurrent traffic anomaly on ${scenario.serviceName} exceeding provisioned cluster resource limits.`,
      causalChain: [
        { step: 1, service: scenario.serviceName, observation: 'Resource exhaustion triggers slow query response.' },
        { step: 2, service: 'Upstream Gateways', observation: 'Connection timeouts cascade to adjacent commerce microservices.' },
        { step: 3, service: 'TARSIER Agent', observation: 'Automated telemetry correlation detected anomalous threshold breaches.' },
      ],
      contributingFactors: [
        'Dynamic auto-scaler cooldown parameter delayed pod creation by 180s',
        'Circuit breaker threshold set too high (50% vs 20% recommended)',
      ],
      blastRadiusServices: [scenario.serviceName, 'API Gateway', 'Shopping Cart Service'],
      estimatedUserImpact: 'Elevated request failures affecting ~850 customer sessions in current region.',
      aiConfidence: 94,
      modelEngine: 'TARSIER Autonomous Commander v3.4',
      investigationTimeline: [
        { time: nowTime, note: 'Incident automatically ingested from telemetry Prometheus alert.' },
        { time: nowTime, note: 'AI agent matched known failure pattern and compiled runbook remediation.' },
      ],
    },
    remediation: {
      id: `rem-${incidentId}`,
      title: `Automated Remediation for ${scenario.serviceName}`,
      strategy: scenario.remediationPlan,
      riskLevel: scenario.severity === 'CRITICAL' ? 'MEDIUM' : 'LOW',
      automationEligible: true,
      commandSnippet: `# Autonomous Runbook Generated by TARSIER:
kubectl scale deployment ${scenario.serviceId.replace('svc-', '')} --replicas=12 -n production
consul kv put limits/${scenario.serviceId.replace('svc-', '')}/circuit_breaker_ratio 0.15
# Trigger safe cache flush and socket reset
curl -X POST http://internal-admin/${scenario.serviceId.replace('svc-', '')}/drain-connections`,
      rollbackPlan: `Rollback deployment scale to default 4 replicas if memory exceeds 90% or unhandled 500 error persists.`,
      safetyChecklist: [
        { item: 'Zero data destruction verified', passed: true },
        { item: 'Database headroom verified', passed: true },
        { item: 'Automated rollback armed', passed: true },
      ],
      approvalStatus: 'PENDING',
    },
    recovery: {
      progressPercent: 20,
      phase: 'AWAITING_APPROVAL',
      steps: [
        { name: 'Telemetry Anomaly Ingestion', status: 'completed', details: 'Prometheus metric alerts correlated' },
        { name: 'AI Root Cause Synthesis', status: 'completed', details: 'Hypothesis validated with 94% confidence' },
        { name: 'Human-in-the-Loop Safety Sign-off', status: 'in-progress', details: 'Awaiting on-call responder approval' },
        { name: 'Runbook Remediation Execution', status: 'pending', details: 'Execute dynamic scaling & connection drain' },
        { name: 'Canary Health Probing', status: 'pending', details: 'Verify telemetry returns to baseline SLA' },
      ],
      postVerification: {
        latencyNormal: false,
        errorRateUnderThreshold: false,
        canaryTrafficHealthy: false,
      },
    },
    logs: newLogs,
    metrics: newMetrics,
  };

  // Update services
  const targetSvcIndex = servicesState.findIndex(s => s.id === scenario.serviceId);
  if (targetSvcIndex !== -1) {
    servicesState[targetSvcIndex] = {
      ...servicesState[targetSvcIndex],
      status: scenario.severity === 'CRITICAL' ? 'CRITICAL' : 'DEGRADED',
      latency: Math.floor(Math.random() * 800) + 1200,
      errorRate: Math.floor(Math.random() * 15) + 18,
      cpu: Math.floor(Math.random() * 10) + 88,
      memory: Math.floor(Math.random() * 10) + 85,
      lastIncident: `${incidentId} Active`,
    };
  }

  // Prepend new incident to state
  incidentsState = [newIncident, ...incidentsState];

  return { incident: newIncident, service: servicesState[targetSvcIndex] };
};

export const resetAllSimulations = (): void => {
  servicesState = INITIAL_SERVICES.map(svc => ({
    ...svc,
    status: 'HEALTHY',
    latency: svc.id === 'svc-db-cluster' ? 12 : Math.floor(Math.random() * 30) + 25,
    errorRate: 0.02,
    cpu: Math.floor(Math.random() * 20) + 30,
    memory: Math.floor(Math.random() * 20) + 40,
    lastIncident: undefined,
  }));

  incidentsState = INITIAL_INCIDENTS.map(inc => ({
    ...inc,
    status: 'RESOLVED',
    resolvedAt: '12:00:00 UTC (Baseline)',
    recovery: {
      ...inc.recovery,
      progressPercent: 100,
      phase: 'STABILIZED',
      steps: inc.recovery.steps.map(s => ({ ...s, status: 'completed' as const })),
      postVerification: {
        latencyNormal: true,
        errorRateUnderThreshold: true,
        canaryTrafficHealthy: true,
      },
    },
  }));
};
