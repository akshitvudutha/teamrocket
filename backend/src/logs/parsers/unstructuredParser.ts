import { LogFormatParser, NormalizedLogEntry, LogLevel } from '../../types/evidence.js';

export class UnstructuredLogParser implements LogFormatParser {
  readonly id = 'unstructured';
  readonly name = 'Unstructured & Plain-Text Log Parser';

  // Always returns true as the universal fallback parser
  canParse(_rawLine: string): boolean {
    return true;
  }

  parse(rawLine: string, defaultService?: string): NormalizedLogEntry {
    const trimmed = rawLine.trim();

    // 1. Try to extract timestamp if present in standard formats
    let timestamp = new Date().toISOString();
    let extractedTimestampStr: string | undefined;

    // Matches ISO-8601 or YYYY-MM-DD HH:MM:SS
    const isoMatch = trimmed.match(/\b(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\b/);
    if (isoMatch) {
      const parsed = new Date(isoMatch[1]);
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed.toISOString();
        extractedTimestampStr = isoMatch[1];
      }
    } else {
      // Matches HH:MM:SS(.mmm)
      const timeMatch = trimmed.match(/\b(\d{2}:\d{2}:\d{2}(?:\.\d+)?)\b/);
      if (timeMatch) {
        const today = new Date().toISOString().split('T')[0];
        const parsed = new Date(`${today}T${timeMatch[1]}Z`);
        if (!isNaN(parsed.getTime())) {
          timestamp = parsed.toISOString();
          extractedTimestampStr = timeMatch[1];
        }
      }
    }

    // 2. Try to extract service name if bracketed e.g. [payment-service] or service: order
    let service = defaultService || 'unstructured-app';
    const serviceMatch = trimmed.match(/\[([a-zA-Z0-9_\-.]+Service|[a-zA-Z0-9_\-.]+(?:-[a-z0-9]+)+)\]/i) ||
                         trimmed.match(/\b(?:service|svc|app)=([a-zA-Z0-9_\-]+)\b/i);
    if (serviceMatch && serviceMatch[1]) {
      service = serviceMatch[1];
    }

    // 3. Try to extract log level
    let severity: LogLevel = 'UNKNOWN';
    const upper = trimmed.toUpperCase();
    if (/\b(FATAL|PANIC|EMERGENCY|CRITICAL)\b/.test(upper)) {
      severity = 'FATAL';
    } else if (/\b(ERROR|ERR|EXCEPTION|FAILED|FAIL)\b/.test(upper)) {
      severity = 'ERROR';
    } else if (/\b(WARN|WARNING)\b/.test(upper)) {
      severity = 'WARN';
    } else if (/\b(INFO|NOTICE)\b/.test(upper)) {
      severity = 'INFO';
    } else if (/\b(DEBUG|TRACE)\b/.test(upper)) {
      severity = 'DEBUG';
    }

    return {
      id: `log-unstruct-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp,
      service,
      severity,
      message: trimmed || '(empty log message)',
      source: this.id,
      originalMessage: rawLine,
      metadata: {
        extractedTimestamp: extractedTimestampStr,
        isPureWhitespace: rawLine.length > 0 && trimmed.length === 0,
        length: rawLine.length,
      },
      isSuspicious: false,
    };
  }
}
