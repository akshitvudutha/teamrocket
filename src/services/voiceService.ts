import { VoiceCommandResponse } from '../types';

/**
 * Team Rocket Voice Service
 * Handles:
 * 1. Web Speech API Speech-to-Text (STT) with microphone capture
 * 2. Backend Command Processing & AI Intent Mapping
 * 3. Browser SpeechSynthesis Text-to-Speech (TTS)
 */

export interface SpeechRecognitionHook {
  startListening: (onTranscript: (text: string, isFinal: boolean) => void, onError: (err: string) => void) => void;
  stopListening: () => void;
  isSupported: boolean;
}

export class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private synthesisVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  private initSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  private initSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural English voices
        this.synthesisVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          null;
      };
    }
  }

  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Request microphone permission and listen for speech
   */
  async startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStatusChange: (status: 'LISTENING' | 'IDLE' | 'ERROR', errorMsg?: string) => void
  ): Promise<void> {
    if (!this.recognition) {
      onStatusChange('ERROR', 'Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      // Proactively test microphone permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permErr: any) {
      onStatusChange('ERROR', 'Microphone access denied. Please click the lock/camera icon in your address bar to allow microphone.');
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      onStatusChange('LISTENING');
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const currentText = final || interim;
      if (currentText) {
        onTranscript(currentText, !!final);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let errorMsg = 'Speech recognition error.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please try speaking again.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error during speech recognition.';
      }
      onStatusChange('ERROR', errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStatusChange('IDLE');
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onStatusChange('ERROR', err.message || 'Failed to start microphone recording.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Dispatch recognized command to backend API or fallback intent processor
   */
  async processCommand(
    command: string,
    context?: { activeIncidentId?: string; serviceId?: string }
  ): Promise<VoiceCommandResponse> {
    try {
      // 1. Try backend API first (uses VITE_API_URL if set, or local dev port, or relative /api on Vercel)
      const apiBase = import.meta.env.VITE_API_URL !== undefined
        ? import.meta.env.VITE_API_URL
        : (import.meta.env.DEV ? 'http://localhost:5000' : '');
      const res = await fetch(`${apiBase}/api/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, context }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          return data.result;
        }
      }
    } catch {
      // Fallback: Client-side Intent Classifier if backend is unavailable
    }

    return this.fallbackProcessCommand(command, context);
  }

  /**
   * Client-side fallback intent processor (guarantees offline/preview functionality)
   */
  fallbackProcessCommand(
    command: string,
    context?: { activeIncidentId?: string; serviceId?: string }
  ): VoiceCommandResponse {
    const text = command.trim().toLowerCase();

    // 1. Safety Guardrail: Block Mutating Commands (Requirement #10)
    if (
      /\b(?:apply|execute|run|trigger|deploy|fix|patch)\s+(?:remediation|fix|command|script|action)\b/.test(text) ||
      /\b(?:restart|kill|scale|reboot|flush)\b/.test(text)
    ) {
      return {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse: 'Safety policy warning: Voice commands cannot execute remediation. Please review and authorize the fix in the Safety Gate.',
        detailedFindings: 'MUTATION BLOCKED: In accordance with Team Rocket Safety Policy, all infrastructure mutations require human visual verification and manual approval via the Safety Gate.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'remediation' },
        },
        safetyProtected: true,
      };
    }

    // 2. Show Root Cause
    if (text.includes('root cause') || text.includes('why is it failing') || text.includes('cause')) {
      return {
        command,
        intent: 'SHOW_ROOT_CAUSE',
        spokenResponse: 'The root cause is HikariCP database connection pool starvation caused by unindexed foreign key lock contention during peak flash checkout concurrency.',
        detailedFindings: 'AI Root Cause Analysis (96% Confidence): Missing index on `order_reference_id` in v2.14.0 caused table lock contention, saturating all 50 connection sockets.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'rca' },
        },
      };
    }

    // 3. Investigate Incident
    if (text.includes('investigate') || text.includes('current incident') || text.includes('check incident')) {
      return {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse: 'Investigating incident INC-8092 on Payment Gateway. Latency is elevated at 1,840 milliseconds and cascading to Order Processing.',
        detailedFindings: 'Incident INC-8092 Active: Payment Gateway experiencing 1,840ms P99 latency and 24.6% error rate. 18 correlated traces show lock wait timeouts.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: context?.activeIncidentId || 'INC-8092' },
        },
      };
    }

    // 4. Check Service Health
    if (text.includes('health') || text.includes('service') || text.includes('payment') || text.includes('auth')) {
      const isPayment = text.includes('payment') || !text.includes('auth');
      const svcName = isPayment ? 'Payment Gateway' : 'Auth & IAM Service';
      const svcStatus = isPayment ? 'CRITICAL' : 'HEALTHY';
      const latency = isPayment ? 1840 : 45;
      const errorRate = isPayment ? 24.6 : 0.12;

      return {
        command,
        intent: 'CHECK_SERVICE_HEALTH',
        spokenResponse: `${svcName} is currently ${svcStatus}. P99 latency is ${latency} milliseconds and error rate is ${errorRate} percent.`,
        detailedFindings: `Telemetry for ${svcName}: Status: ${svcStatus} | Latency: ${latency}ms | Error Rate: ${errorRate}%.`,
        uiAction: {
          type: 'SELECT_SERVICE',
          payload: { serviceId: isPayment ? 'svc-payment' : 'svc-auth' },
        },
      };
    }

    // 5. Generate Postmortem
    if (text.includes('postmortem') || text.includes('post-mortem') || text.includes('report')) {
      return {
        command,
        intent: 'GENERATE_POSTMORTEM',
        spokenResponse: 'Navigating to SRE reports. Incident post-mortem summary is ready with full timeline and export options.',
        detailedFindings: 'Post-Mortem Ready: MTTR benchmarked at 6.4 minutes. AI automated root cause synthesis achieved 96.8% accuracy.',
        uiAction: {
          type: 'SWITCH_TAB',
          payload: { tab: 'reports' },
        },
      };
    }

    // 6. Explain Incident
    if (text.includes('explain') || text.includes('what happened') || text.includes('summary')) {
      return {
        command,
        intent: 'EXPLAIN_INCIDENT',
        spokenResponse: 'At 12:24 UTC, high volume checkout concurrency triggered row-level database locks in Payment Gateway, driving latency to 1,840 milliseconds and impacting approximately 1,420 checkout attempts.',
        detailedFindings: 'Summary of INC-8092: Payment service pool reached 50/50 connection cap with 124 waiting threads. SRE remediation plan formulated with pod scaling and replica offload.',
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: context?.activeIncidentId || 'INC-8092' },
        },
      };
    }

    // Default Unknown
    return {
      command,
      intent: 'UNKNOWN',
      spokenResponse: `Recognized: "${command}". You can ask me to investigate the incident, show the root cause, check service health, or generate a postmortem.`,
      detailedFindings: `Instruction not mapped: "${command}". Supported voice commands: "Investigate the current incident", "Show the root cause", "Check payment service health", "Generate a postmortem", "Explain the latest incident".`,
      uiAction: {
        type: 'NONE',
      },
    };
  }

  /**
   * Browser SpeechSynthesis Text-to-Speech (TTS)
   */
  speakText(text: string, onEnd?: () => void): void {
    if (!this.isSynthesisSupported()) return;

    // Cancel any previous utterances
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.synthesisVoice) {
      utterance.voice = this.synthesisVoice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeech(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();
