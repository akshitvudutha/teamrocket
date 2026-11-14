export type AppView = 'welcome' | 'auth' | 'dashboard' | 'website-detail' | 'support';

export type DetailTab = 'overview' | 'attributes' | 'incidents' | 'logs' | 'ai-investigation';

export type WebsiteStatus = 'healthy' | 'warning' | 'down';

export type IncidentSeverity = 'critical' | 'warning' | 'resolved';

export interface RegionalLatency {
  region: string;
  name: string;
  latencyMs: number;
  status: WebsiteStatus;
}

export interface LatencyPoint {
  time: string;
  latencyMs: number;
  statusCode: number;
}

export interface MonitoredWebsite {
  id: string;
  name: string;
  url: string;
  category: 'E-Commerce' | 'API Gateway' | 'Security' | 'Billing' | 'Infrastructure' | 'Developer';
  status: WebsiteStatus;
  httpStatus: number;
  uptimePct24h: number;
  uptimePct30d: number;
  latencyMs: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  sslValid: boolean;
  sslExpiryDays: number;
  sslIssuer: string;
  lastCheckSecondsAgo: number;
  checkIntervalSeconds: number;
  regions: RegionalLatency[];
  historicalLatency: LatencyPoint[];
  activeIncidentCount: number;
  tags: string[];
}

export interface RootCauseAnalysis {
  primaryHypothesis: string;
  confidence: number;
  causalChain: string[];
  contributingFactors: string[];
  correlatedEvidence: string[];
  blastRadius: string[];
  suggestedRemediation: string;
  preventionMeasures?: string[];
}

export interface RemediationAction {
  actionId: string;
  command: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedRecoverySeconds: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'VERIFIED' | 'FAILED';
}

export interface WebsiteIncident {
  id: string;
  websiteId: string;
  websiteName: string;
  title: string;
  severity: IncidentSeverity;
  startedAt: string;
  duration: string;
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  aiSummary: string;
  blastRadius: string[];
  suggestedRemediation: string;
  remediationAction: string;
  isRemediated?: boolean;
  rootCauseAnalysis?: RootCauseAnalysis;
  remediationDetails?: RemediationAction;
  timeline: {
    time: string;
    text: string;
    actor: 'TARSIER AI' | 'Synthetic Sentinel' | 'SRE Commander';
  }[];
}

export interface WebsiteLog {
  id: string;
  websiteId: string;
  timestamp: string;
  severity: 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
  format: 'json' | 'syslog' | 'apache' | 'unstructured';
  isSuspicious: boolean;
  riskScore: number;
  clientIp?: string;
  httpMethod?: string;
  statusCode?: number;
  suspiciousReasons?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
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

export interface PostmortemReport {
  incidentId: string;
  title: string;
  websiteName: string;
  impactDuration: string;
  severity: string;
  leadInvestigator: string;
  summary: string;
  rootCause: string;
  detectionTime: string;
  resolutionTime: string;
  timeline: Array<{ time: string; event: string }>;
  remediationSteps: string[];
  actionItems: string[];
}
