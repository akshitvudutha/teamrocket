import { LogFormatParser, NormalizedLogEntry } from '../types/evidence.js';
import { JsonLogParser } from './parsers/jsonParser.js';
import { SyslogParser } from './parsers/syslogParser.js';
import { ApacheLogParser } from './parsers/apacheParser.js';
import { UnstructuredLogParser } from './parsers/unstructuredParser.js';

export class LogNormalizer {
  private parsers: LogFormatParser[] = [];
  private fallbackParser: LogFormatParser;

  constructor() {
    this.fallbackParser = new UnstructuredLogParser();

    // Default registered parser stack
    // Checked in priority order: JSON -> Syslog -> Apache -> Fallback Unstructured
    this.parsers = [
      new JsonLogParser(),
      new SyslogParser(),
      new ApacheLogParser(),
    ];
  }

  /**
   * Hour-3 Rule Change Adaptability:
   * Dynamically register new parsers at runtime without rewriting the pipeline.
   */
  registerParser(parser: LogFormatParser, priority: 'prepend' | 'append' = 'prepend'): void {
    // Remove if already registered
    this.parsers = this.parsers.filter((p) => p.id !== parser.id);
    if (priority === 'prepend') {
      this.parsers.unshift(parser);
    } else {
      this.parsers.push(parser);
    }
  }

  /**
   * Get list of currently registered format parsers
   */
  getRegisteredParsers(): { id: string; name: string }[] {
    return [...this.parsers, this.fallbackParser].map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }

  /**
   * Normalizes a single raw log string into a standard NormalizedLogEntry.
   * Never throws or drops useful data; falls back to UnstructuredLogParser.
   */
  normalizeLine(rawLine: string, defaultService?: string): NormalizedLogEntry {
    const trimmed = rawLine.trim();

    // Handle empty or whitespace lines safely
    if (trimmed.length === 0) {
      return {
        id: `log-empty-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp: new Date().toISOString(),
        service: defaultService || 'system',
        severity: 'UNKNOWN',
        message: '(empty log entry)',
        source: 'empty',
        originalMessage: rawLine,
        metadata: { isEmpty: true, originalLength: rawLine.length },
        isSuspicious: false,
      };
    }

    // Try specialized registered parsers in order
    for (const parser of this.parsers) {
      if (parser.canParse(trimmed)) {
        const result = parser.parse(rawLine, defaultService);
        if (result) {
          return result;
        }
      }
    }

    // Fallback: universal unstructured parser (guarantees NO SILENT DISCARD of evidence)
    return this.fallbackParser.parse(rawLine, defaultService)!;
  }

  /**
   * Normalizes a batch of logs. Can accept an array of strings, or a multi-line string.
   * Handles mixed formats, malformed lines, and large batches smoothly.
   */
  normalizeBatch(
    rawLogs: string | string[],
    defaultService?: string
  ): NormalizedLogEntry[] {
    let lines: string[];

    if (Array.isArray(rawLogs)) {
      lines = rawLogs;
    } else if (typeof rawLogs === 'string') {
      lines = rawLogs.split(/\r?\n/);
    } else {
      return [];
    }

    const results: NormalizedLogEntry[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip empty lines only if they are the trailing newline of a file,
      // but retain any internal lines as evidence entries.
      if (line.trim().length === 0 && (i === lines.length - 1 || lines.length > 500)) {
        continue;
      }
      results.push(this.normalizeLine(line, defaultService));
    }

    return results;
  }
}
