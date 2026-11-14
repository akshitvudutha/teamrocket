export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'UNKNOWN';

export interface NormalizedLogEntry {
  id: string;
  timestamp: string; // Normalized ISO-8601 string
  service: string;
  severity: LogLevel;
  message: string;
  source: string; // 'json' | 'syslog' | 'apache' | 'unstructured' | custom format id
  originalMessage: string; // Verbatim raw log message exactly as ingested
  metadata: Record<string, unknown>;
  isSuspicious: boolean;
  suspiciousReasons?: string[];
  riskScore?: number; // 0 - 100
}

export interface LogFormatParser {
  readonly id: string;
  readonly name: string;
  canParse(rawLine: string): boolean;
  parse(rawLine: string, defaultService?: string): NormalizedLogEntry | null;
}

export interface PromptInjectionAnalysis {
  isSuspicious: boolean;
  riskScore: number; // 0 - 100
  threatCategories: string[];
  matchedPatterns: string[];
  sanitizedForLlmPrompt: string; // Safe representation with delimiter escaping
}

export interface EvidenceBundle {
  bundleId: string;
  collectedAt: string;
  totalEntries: number;
  normalizedLogs: NormalizedLogEntry[];
  suspiciousCount: number;
  detectedFormats: string[];
  adversarialAttemptsDetected: boolean;
  untrustedEvidenceText: string; // Boundary-isolated prompt block for LLM
}
