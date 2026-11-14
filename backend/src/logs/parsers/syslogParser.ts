import { LogFormatParser, NormalizedLogEntry, LogLevel } from '../../types/evidence.js';

export class SyslogParser implements LogFormatParser {
  readonly id = 'syslog';
  readonly name = 'Syslog Parser (RFC 5424 / RFC 3164)';

  // RFC 5424 regex: <PRI>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID [STRUCTURED-DATA] MSG
  private readonly rfc5424Regex =
    /^<(\d{1,3})>1\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(?:\[.*?\]|-)\s*(.*)$/;

  // RFC 3164 regex: <PRI>MMM DD HH:MM:SS HOSTNAME TAG[PID]: MSG or without <PRI>
  private readonly rfc3164Regex =
    /^(?:<(\d{1,3})>)?([A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^:\[\s]+)(?:\[(\d+)\])?:\s*(.*)$/;

  canParse(rawLine: string): boolean {
    const trimmed = rawLine.trim();
    return this.rfc5424Regex.test(trimmed) || this.rfc3164Regex.test(trimmed);
  }

  parse(rawLine: string, defaultService?: string): NormalizedLogEntry | null {
    const trimmed = rawLine.trim();

    // Check RFC 5424
    const match5424 = trimmed.match(this.rfc5424Regex);
    if (match5424) {
      const [, priStr, tsStr, hostname, appName, procId, msgId, message] = match5424;
      const pri = parseInt(priStr, 10);
      const severity = this.mapPriToSeverity(pri);

      let timestamp: string;
      const parsedDate = new Date(tsStr);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      } else {
        timestamp = new Date().toISOString();
      }

      const service = appName !== '-' && appName ? appName : (defaultService || 'syslog-app');

      return {
        id: `log-syslog-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp,
        service,
        severity,
        message: message || '',
        source: this.id,
        originalMessage: rawLine,
        metadata: {
          standard: 'RFC5424',
          pri,
          hostname,
          appName,
          procId: procId !== '-' ? procId : undefined,
          msgId: msgId !== '-' ? msgId : undefined,
        },
        isSuspicious: false,
      };
    }

    // Check RFC 3164
    const match3164 = trimmed.match(this.rfc3164Regex);
    if (match3164) {
      const [, priStr, dateStr, hostname, tag, pidStr, message] = match3164;
      const pri = priStr ? parseInt(priStr, 10) : undefined;
      const severity = pri !== undefined ? this.mapPriToSeverity(pri) : this.inferSeverityFromMessage(message);

      let timestamp: string;
      // BSD syslog dates are "Mmm dd hh:mm:ss" without year; append current year
      const currentYear = new Date().getFullYear();
      const parsedDate = new Date(`${dateStr} ${currentYear}`);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      } else {
        timestamp = new Date().toISOString();
      }

      const service = tag || defaultService || 'syslog-app';

      return {
        id: `log-syslog-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp,
        service,
        severity,
        message: message || '',
        source: this.id,
        originalMessage: rawLine,
        metadata: {
          standard: 'RFC3164',
          pri,
          hostname,
          tag,
          pid: pidStr ? parseInt(pidStr, 10) : undefined,
        },
        isSuspicious: false,
      };
    }

    return null;
  }

  private mapPriToSeverity(pri: number): LogLevel {
    const sev = pri % 8;
    switch (sev) {
      case 0: // Emergency
      case 1: // Alert
      case 2: // Critical
        return 'FATAL';
      case 3: // Error
        return 'ERROR';
      case 4: // Warning
        return 'WARN';
      case 5: // Notice
      case 6: // Informational
        return 'INFO';
      case 7: // Debug
        return 'DEBUG';
      default:
        return 'INFO';
    }
  }

  private inferSeverityFromMessage(msg: string): LogLevel {
    const upper = msg.toUpperCase();
    if (upper.includes('FATAL') || upper.includes('PANIC') || upper.includes('EMERG')) return 'FATAL';
    if (upper.includes('ERROR') || upper.includes('ERR')) return 'ERROR';
    if (upper.includes('WARN')) return 'WARN';
    if (upper.includes('DEBUG')) return 'DEBUG';
    return 'INFO';
  }
}
