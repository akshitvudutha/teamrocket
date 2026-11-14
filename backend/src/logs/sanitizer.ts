import { NormalizedLogEntry, PromptInjectionAnalysis } from '../types/evidence.js';

export interface ThreatPatternRule {
  category: 'INSTRUCTION_OVERRIDE' | 'PROMPT_LEAK' | 'SAFETY_BYPASS' | 'SHELL_EXECUTION' | 'SECRET_EXFILTRATION' | 'DELIMITER_BREAKOUT';
  regex: RegExp;
  weight: number;
  description: string;
}

export class PromptInjectionSanitizer {
  private readonly rules: ThreatPatternRule[] = [
    // 1. Instruction Overriding / Jailbreaking
    {
      category: 'INSTRUCTION_OVERRIDE',
      regex: /\b(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system)\s+instructions\b/i,
      weight: 45,
      description: 'Attempt to override or disregard prior system instructions',
    },
    {
      category: 'INSTRUCTION_OVERRIDE',
      regex: /\b(?:you\s+are\s+now|act\s+as)\s+(?:unrestricted|DAN|root|sudo|admin|developer\s+mode|god\s+mode)\b/i,
      weight: 40,
      description: 'Persona adoption or jailbreak attempt',
    },
    {
      category: 'INSTRUCTION_OVERRIDE',
      regex: /\b(?:new\s+system\s+directive|operational\s+override|priority\s+one\s+directive):\s*/i,
      weight: 35,
      description: 'Synthetic system directive injection',
    },

    // 2. Prompt Leaking & Secret Exfiltration
    {
      category: 'PROMPT_LEAK',
      regex: /\b(?:reveal|print|repeat|output|show|echo)\s+(?:the\s+)?(?:system\s+prompt|initial\s+instructions|developer\s+prompt|hidden\s+rules)\b/i,
      weight: 40,
      description: 'Attempt to exfiltrate system instructions or internal prompt',
    },
    {
      category: 'SECRET_EXFILTRATION',
      regex: /\b(?:curl|wget|fetch|nc|ncat)\s+[^\n]*\b(?:webhook|ngrok|pipedream|pastebin|attacker|requestbin|leak)\b/i,
      weight: 50,
      description: 'Outbound network exfiltration command payload',
    },
    {
      category: 'SECRET_EXFILTRATION',
      regex: /\b(?:printenv|env\b|echo\s+\$(?:API_KEY|TOKEN|SECRET|OLLAMA_TOKEN|AWS_SECRET))\b/i,
      weight: 45,
      description: 'Environment secret access attempt',
    },

    // 3. Safety Guardrail & Change-Freeze Bypass
    {
      category: 'SAFETY_BYPASS',
      regex: /\b(?:disable|bypass|skip|ignore|deactivate)\s+(?:all\s+)?(?:safety|guardrail|change[_\-\s]?freeze|approval|verification|checks)\b/i,
      weight: 50,
      description: 'Attempt to deactivate safety guardrails or change-freeze policies',
    },
    {
      category: 'SAFETY_BYPASS',
      regex: /\b(?:change[_\-\s]?freeze\s*=\s*(?:false|0|disabled|off)|emergency_override\s*=\s*true)\b/i,
      weight: 45,
      description: 'Synthetic change freeze variable tampering',
    },
    {
      category: 'SAFETY_BYPASS',
      regex: /\b(?:auto[_\-\s]?approve|force[_\-\s]?remediate|execute[_\-\s]?without[_\-\s]?confirmation)\b/i,
      weight: 40,
      description: 'Attempt to force unapproved automated remediation execution',
    },

    // 4. Shell / Command Execution
    {
      category: 'SHELL_EXECUTION',
      regex: /\b(?:rm\s+-rf\s+[\/\*]|DROP\s+TABLE|mkfs\b|dd\s+if=|\bformat\s+c:)\b/i,
      weight: 60,
      description: 'Destructive system command payload in log',
    },
    {
      category: 'SHELL_EXECUTION',
      regex: /\b(?:execute\s+shell|run\s+(?:bash|sh|cmd|powershell)|exec\s*\()\b/i,
      weight: 45,
      description: 'Arbitrary shell execution directive in log',
    },

    // 5. Delimiter Breakout & Control Characters
    {
      category: 'DELIMITER_BREAKOUT',
      regex: /(?:<\/untrusted_evidence_log>|<\/evidence>|<\/system>|<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>|```(?:system|admin))/i,
      weight: 50,
      description: 'Prompt delimiter breakout or boundary tag tampering',
    },
  ];

  /**
   * Scans a raw or normalized text for prompt injection threats without mutating the original text.
   */
  analyze(text: string): PromptInjectionAnalysis {
    const matchedPatterns: string[] = [];
    const threatCategories = new Set<string>();
    let totalScore = 0;

    for (const rule of this.rules) {
      if (rule.regex.test(text)) {
        matchedPatterns.push(rule.description);
        threatCategories.add(rule.category);
        totalScore += rule.weight;
      }
    }

    const riskScore = Math.min(100, totalScore);
    const isSuspicious = riskScore >= 35;

    // Sanitize for LLM prompt: escape dangerous delimiters so untrusted text cannot break prompt structure
    const sanitizedForLlmPrompt = this.escapeBoundaryDelimiters(text);

    return {
      isSuspicious,
      riskScore,
      threatCategories: Array.from(threatCategories),
      matchedPatterns,
      sanitizedForLlmPrompt,
    };
  }

  /**
   * Inspects a NormalizedLogEntry and mutates its security status flags (preserving originalMessage exactly).
   */
  sanitizeEntry(entry: NormalizedLogEntry): NormalizedLogEntry {
    const analysis = this.analyze(`${entry.message} ${JSON.stringify(entry.metadata || {})}`);
    entry.isSuspicious = analysis.isSuspicious;
    entry.riskScore = analysis.riskScore;
    if (analysis.isSuspicious) {
      entry.suspiciousReasons = analysis.matchedPatterns;
    }
    return entry;
  }

  /**
   * Safely escapes prompt boundary delimiters from untrusted log strings so the text
   * remains readable to humans and LLMs but cannot close the XML context container.
   */
  escapeBoundaryDelimiters(input: string): string {
    return input
      .replace(/<\/untrusted_evidence_log>/gi, '&lt;/untrusted_evidence_log&gt;')
      .replace(/<untrusted_evidence_log/gi, '&lt;untrusted_evidence_log')
      .replace(/<\/system>/gi, '&lt;/system&gt;')
      .replace(/<system>/gi, '&lt;system&gt;')
      .replace(/<\|im_start\|>/gi, '[ESC:IM_START]')
      .replace(/<\|im_end\|>/gi, '[ESC:IM_END]')
      .replace(/<\|endoftext\|>/gi, '[ESC:ENDOFTEXT]');
  }

  /**
   * Wraps an individual normalized log in safe boundary tags for inclusion in LLM reasoning prompts.
   */
  wrapForLlmContext(entry: NormalizedLogEntry): string {
    const safeContent = this.escapeBoundaryDelimiters(entry.message);
    const warningAttr = entry.isSuspicious ? ` suspicious="true" risk="${entry.riskScore}"` : '';
    return `<untrusted_evidence_log id="${entry.id}" service="${entry.service}" severity="${entry.severity}" timestamp="${entry.timestamp}"${warningAttr}>
${safeContent}
</untrusted_evidence_log>`;
  }
}
