export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MITIGATING' | 'RECOVERING' | 'RESOLVED';

export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';

export type ServiceCategory = 'core' | 'commerce' | 'data' | 'infrastructure' | 'communication';

export interface ServiceHealth {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  status: ServiceStatus;
  uptime: number; // e.g. 99.98
  latency: number; // in ms
  errorRate: number; // percentage
  cpu: number; // percentage
  memory: number; // percentage
  instances: number;
  dependencies: string[];
  lastIncident?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  message: string;
  traceId?: string;
}

export interface MetricDataPoint {
  time: string;
  latencyMs: number;
  errorRatePercent: number;
  requestsPerSec: number;
  cpuPercent: number;
}

export interface RootCauseAnalysis {
  summary: string;
  primaryTrigger: string;
  causalChain: { step: number; service: string; observation: string }[];
  contributingFactors: string[];
  blastRadiusServices: string[];
  estimatedUserImpact: string;
  aiConfidence: number; // percentage e.g. 96
  modelEngine: string; // e.g. "Rocket-Reasoner-v3 (Gemini 2.5 Flash)"
  investigationTimeline: { time: string; note: string }[];
}

export interface RemediationAction {
  id: string;
  title: string;
  strategy: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  automationEligible: boolean;
  commandSnippet: string;
  rollbackPlan: string;
  safetyChecklist: { item: string; passed: boolean }[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'EXECUTED';
  approvedBy?: string;
  approvedAt?: string;
}

export interface RecoveryStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details: string;
  duration?: string;
}

export interface RecoveryStatus {
  progressPercent: number;
  phase: 'AWAITING_APPROVAL' | 'DEPLOYING_FIX' | 'VERIFYING_CANARY' | 'MONITORING' | 'STABILIZED';
  steps: RecoveryStep[];
  startedAt?: string;
  completedAt?: string;
  postVerification: {
    latencyNormal: boolean;
    errorRateUnderThreshold: boolean;
    canaryTrafficHealthy: boolean;
  };
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  affectedServiceId: string;
  affectedServiceName: string;
  detectedAt: string;
  resolvedAt?: string;
  summary: string;
  rootCause: RootCauseAnalysis;
  remediation: RemediationAction;
  recovery: RecoveryStatus;
  logs: LogEntry[];
  metrics: MetricDataPoint[];
}

export interface IncidentFilter {
  severity: Severity | 'ALL';
  status: IncidentStatus | 'ALL';
  search: string;
  serviceId?: string;
}
