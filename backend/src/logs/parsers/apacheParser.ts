import { LogFormatParser, NormalizedLogEntry, LogLevel } from '../../types/evidence.js';

export class ApacheLogParser implements LogFormatParser {
  readonly id = 'apache';
  readonly name = 'Apache Common & Combined Access Log Parser';

  // Matches Common and Combined access logs
  private readonly apacheRegex =
    /^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d{3})\s+(\S+)(?:\s+"([^"]*)"\s+"([^"]*)")?/;

  canParse(rawLine: string): boolean {
    return this.apacheRegex.test(rawLine.trim());
  }

  parse(rawLine: string, defaultService?: string): NormalizedLogEntry | null {
    const trimmed = rawLine.trim();
    const match = trimmed.match(this.apacheRegex);
    if (!match) return null;

    const [
      ,
      clientIp,
      identd,
      authUser,
      dateStr,
      requestLine,
      statusCodeStr,
      bytesStr,
      referer,
      userAgent,
    ] = match;

    const statusCode = parseInt(statusCodeStr, 10);
    const severity = this.mapStatusToSeverity(statusCode);

    // Parse date: e.g. "14/Nov/2026:12:00:00 +0000"
    let timestamp: string;
    try {
      // Convert "DD/Mon/YYYY:HH:MM:SS TZ" -> "DD Mon YYYY HH:MM:SS TZ"
      const reformattedDate = dateStr.replace(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})\s*(.*)$/, '$1 $2 $3 $4 $5');
      const parsedDate = new Date(reformattedDate);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      } else {
        timestamp = new Date().toISOString();
      }
    } catch {
      timestamp = new Date().toISOString();
    }

    // Split request line: "METHOD /path HTTP/1.1"
    const reqParts = requestLine ? requestLine.split(' ') : [];
    const httpMethod = reqParts[0] || 'UNKNOWN';
    const httpPath = reqParts[1] || '/';
    const httpVersion = reqParts[2] || 'HTTP/1.1';

    const message = `HTTP ${statusCode} ${httpMethod} ${httpPath}${statusCode >= 400 ? ' [Client/Server Error]' : ''}`;
    const service = defaultService || 'http-gateway';

    return {
      id: `log-apache-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp,
      service,
      severity,
      message,
      source: this.id,
      originalMessage: rawLine,
      metadata: {
        clientIp,
        identd: identd !== '-' ? identd : undefined,
        authUser: authUser !== '-' ? authUser : undefined,
        rawTimestamp: dateStr,
        httpMethod,
        httpPath,
        httpVersion,
        statusCode,
        responseBytes: bytesStr !== '-' ? parseInt(bytesStr, 10) : 0,
        referer: referer && referer !== '-' ? referer : undefined,
        userAgent: userAgent && userAgent !== '-' ? userAgent : undefined,
      },
      isSuspicious: false,
    };
  }

  private mapStatusToSeverity(statusCode: number): LogLevel {
    if (statusCode >= 500) return 'ERROR';
    if (statusCode >= 400) return 'WARN';
    return 'INFO';
  }
}
