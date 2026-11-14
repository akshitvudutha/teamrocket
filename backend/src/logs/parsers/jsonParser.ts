import { LogFormatParser, NormalizedLogEntry, LogLevel } from '../../types/evidence.js';

export class JsonLogParser implements LogFormatParser {
  readonly id = 'json';
  readonly name = 'JSON Lines Parser';

  canParse(rawLine: string): boolean {
    const trimmed = rawLine.trim();
    return trimmed.startsWith('{') && trimmed.endsWith('}');
  }

  parse(rawLine: string, defaultService?: string): NormalizedLogEntry | null {
    const trimmed = rawLine.trim();
    if (!this.canParse(trimmed)) return null;

    let parsedObj: Record<string, unknown>;
    try {
      parsedObj = JSON.parse(trimmed);
      if (typeof parsedObj !== 'object' || parsedObj === null || Array.isArray(parsedObj)) {
        return null;
      }
    } catch {
      // Malformed JSON is not a valid JSON log
      return null;
    }

    // 1. Resolve Timestamp
    const rawTs =
      parsedObj.timestamp ??
      parsedObj['@timestamp'] ??
      parsedObj.time ??
      parsedObj.datetime ??
      parsedObj.date ??
      parsedObj.ts;

    let normalizedTimestamp: string;
    let rawTimestampSaved: unknown = undefined;

    if (rawTs !== undefined && rawTs !== null) {
      rawTimestampSaved = rawTs;
      const parsedDate = new Date(typeof rawTs === 'number' && rawTs < 1e12 ? rawTs * 1000 : (rawTs as string | number));
      if (!isNaN(parsedDate.getTime())) {
        normalizedTimestamp = parsedDate.toISOString();
      } else {
        // Invalid date string provided: fallback to current time and preserve original in metadata
        normalizedTimestamp = new Date().toISOString();
      }
    } else {
      normalizedTimestamp = new Date().toISOString();
    }

    // 2. Resolve Service
    const rawService =
      parsedObj.service ??
      parsedObj.serviceName ??
      parsedObj.app ??
      parsedObj.application ??
      parsedObj.component ??
      parsedObj.logger;

    const service = typeof rawService === 'string' && rawService.trim() ? rawService.trim() : (defaultService || 'unknown-service');

    // 3. Resolve Severity
    const rawLevel = String(
      parsedObj.level ??
      parsedObj.severity ??
      parsedObj.logLevel ??
      parsedObj.status ??
      ''
    ).toUpperCase();

    let severity: LogLevel = 'INFO';
    if (rawLevel.includes('FATAL') || rawLevel.includes('CRIT') || rawLevel.includes('EMERG') || rawLevel.includes('ALERT')) {
      severity = 'FATAL';
    } else if (rawLevel.includes('ERR') || rawLevel === '500' || rawLevel === '504') {
      severity = 'ERROR';
    } else if (rawLevel.includes('WARN')) {
      severity = 'WARN';
    } else if (rawLevel.includes('DEBUG') || rawLevel.includes('TRACE')) {
      severity = 'DEBUG';
    } else if (rawLevel.includes('INFO')) {
      severity = 'INFO';
    } else if (rawLevel) {
      severity = 'UNKNOWN';
    }

    // 4. Resolve Message
    const rawMsg =
      parsedObj.message ??
      parsedObj.msg ??
      parsedObj.log ??
      parsedObj.event ??
      parsedObj.error ??
      parsedObj.description;

    let message: string;
    if (typeof rawMsg === 'string') {
      message = rawMsg;
    } else if (rawMsg !== undefined && rawMsg !== null) {
      message = JSON.stringify(rawMsg);
    } else {
      // If no message property, serialize the whole object without noisy fields
      const { level: _l, severity: _s, timestamp: _t, ...rest } = parsedObj;
      message = JSON.stringify(rest);
    }

    // 5. Gather metadata
    const metadata: Record<string, unknown> = { ...parsedObj };
    if (rawTimestampSaved !== undefined) {
      metadata.rawTimestamp = rawTimestampSaved;
    }

    return {
      id: `log-json-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: normalizedTimestamp,
      service,
      severity,
      message,
      source: this.id,
      originalMessage: rawLine,
      metadata,
      isSuspicious: false,
    };
  }
}
