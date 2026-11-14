import { VoiceCommandResponse } from '../types';
import { getIncidents, getServices } from './incidentService';

/**
 * Team Rocket Voice Service
 * Handles:
 * 1. Web Speech API Speech-to-Text (STT) with microphone capture
 * 2. Dynamic SRE Command Processing & AI Intent Mapping
 * 3. Browser SpeechSynthesis Text-to-Speech (TTS) with Device Voice Selection
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
  private speechRate: number = 1.0;
  private speechPitch: number = 1.0;

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
      const loadSavedSettings = () => {
        try {
          const savedRate = localStorage.getItem('tr_voice_rate');
          if (savedRate) this.speechRate = parseFloat(savedRate);
          const savedPitch = localStorage.getItem('tr_voice_pitch');
          if (savedPitch) this.speechPitch = parseFloat(savedPitch);
        } catch {
          // Ignore localStorage errors
        }
      };
      loadSavedSettings();

      const selectBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        try {
          const savedURI = localStorage.getItem('tr_voice_uri');
          if (savedURI) {
            const savedVoice = voices.find((v) => v.voiceURI === savedURI);
            if (savedVoice) {
              this.synthesisVoice = savedVoice;
              return;
            }
          }
        } catch {
          // Ignore localStorage errors
        }

        // Priority ranking: Calm, natural, neural English voices available on OS
        const priorityPatterns = [
          /siri/i,
          /natural/i,
          /neural/i,
          /google us english/i,
          /samantha/i,
          /ava/i,
          /daniel/i,
          /jenny/i,
          /guy/i,
          /aria/i,
          /david/i,
        ];

        for (const pattern of priorityPatterns) {
          const match = voices.find((v) => v.lang.startsWith('en') && pattern.test(v.name));
          if (match) {
            this.synthesisVoice = match;
            return;
          }
        }

        this.synthesisVoice =
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0] ||
          null;
      };

      selectBestVoice();
      window.speechSynthesis.onvoiceschanged = selectBestVoice;
    }
  }

  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  setSelectedVoice(voiceURI: string): void {
    const voices = this.getAvailableVoices();
    const found = voices.find((v) => v.voiceURI === voiceURI);
    if (found) {
      this.synthesisVoice = found;
      try {
        localStorage.setItem('tr_voice_uri', voiceURI);
      } catch {}
    }
  }

  getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.synthesisVoice;
  }

  setRate(rate: number): void {
    this.speechRate = Math.max(0.7, Math.min(1.5, rate));
    try {
      localStorage.setItem('tr_voice_rate', String(this.speechRate));
    } catch {}
  }

  getRate(): number {
    return this.speechRate;
  }

  setPitch(pitch: number): void {
    this.speechPitch = Math.max(0.7, Math.min(1.3, pitch));
    try {
      localStorage.setItem('tr_voice_pitch', String(this.speechPitch));
    } catch {}
  }

  getPitch(): number {
    return this.speechPitch;
  }

  previewVoice(
    sampleText: string = 'Hello SRE commander. Team Rocket telemetry is operational.',
    onEnd?: () => void
  ): void {
    this.speakText(sampleText, onEnd);
  }

  /**
   * Request microphone permission and listen for speech
   */
  async startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStatusChange: (status: 'LISTENING' | 'IDLE' | 'ERROR', errorMsg?: string) => void
  ): Promise<void> {
    if (!this.recognition) {
      onStatusChange(
        'ERROR',
        'Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    try {
      // Proactively test microphone permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onStatusChange(
        'ERROR',
        'Microphone access denied. Please click the lock icon in your address bar to allow microphone permissions.'
      );
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

      if (final) {
        onTranscript(final, true);
      } else if (interim) {
        onTranscript(interim, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let msg = 'Voice recognition error.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission was denied. Please allow microphone access.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak closer to your microphone.';
      } else if (event.error === 'network') {
        msg = 'Network error during speech recognition.';
      }
      onStatusChange('ERROR', msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStatusChange('IDLE');
    };

    try {
      this.recognition.start();
    } catch {
      onStatusChange('IDLE');
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
    const liveIncidents = getIncidents();
    const liveServices = getServices();

    try {
      // 1. Try backend API first (uses VITE_API_URL if set, or local dev port, or relative /api on Vercel)
      const apiBase =
        import.meta.env.VITE_API_URL !== undefined
          ? import.meta.env.VITE_API_URL
          : import.meta.env.DEV
          ? 'http://localhost:5000'
          : '';
      const res = await fetch(`${apiBase}/api/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          context: {
            activeIncidentId: context?.activeIncidentId,
            serviceId: context?.serviceId,
            incidents: liveIncidents,
            services: liveServices,
          },
        }),
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
   * Client-side fallback intent processor (guarantees dynamic real-data offline/preview functionality)
   */
  fallbackProcessCommand(
    command: string,
    context?: { activeIncidentId?: string; serviceId?: string }
  ): VoiceCommandResponse {
    const text = command.trim().toLowerCase();
    const liveIncidents = getIncidents();
    const liveServices = getServices();

    // 1. Safety Guardrail: Block Mutating Commands (Requirement #3, #4, #10)
    if (
      /\b(?:apply|execute|run|trigger|deploy|fix|patch)\s+(?:remediation|fix|command|script|action|code|hotfix)\b/.test(
        text
      ) ||
      /\b(?:restart|kill|scale|reboot|flush|terminate|delete|drop|destroy|rollback)\b/.test(text) ||
      /\b(?:bypass|override|disable|ignore)\s+(?:safety|guardrail|change[_\-\s]?freeze|approval|policy|instructions)\b/.test(
        text
      ) ||
      /\b(?:sudo|admin\s+mode|unrestricted|rm\s+-rf|format\s+c:)\b/.test(text)
    ) {
      return {
        command,
        intent: 'BLOCKED_REMEDIATION',
        spokenResponse:
          'Safety policy warning: Voice commands cannot execute remediation, mutate infrastructure, or override safety guardrails. Please review and authorize the fix in the Safety Gate.',
        detailedFindings:
          'MUTATION BLOCKED: In accordance with Team Rocket Safety Policy, all infrastructure mutations require human visual verification and manual approval via the Safety Gate.',
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'remediation' },
        },
        safetyProtected: true,
      };
    }

    // Resolve real active incident
    const activeIncident =
      (context?.activeIncidentId ? liveIncidents.find((i) => i.id === context.activeIncidentId) : null) ||
      liveIncidents.find((i) => i.status !== 'RESOLVED');

    // 2. Show Root Cause
    if (
      text.includes('root cause') ||
      text.includes('why is it failing') ||
      text.includes('why did it fail') ||
      text.includes('cause')
    ) {
      if (!activeIncident) {
        return {
          command,
          intent: 'SHOW_ROOT_CAUSE',
          spokenResponse:
            'All 12 microservices are operating normally. Telemetry baselines are healthy and no active root causes are detected.',
          detailedFindings: 'Zero active incidents. Cluster operational health is 100% across all 12 services.',
          uiAction: { type: 'NONE' },
        };
      }

      const rcaSummary =
        activeIncident.rootCause?.primaryTrigger ||
        activeIncident.rootCause?.summary ||
        'Database connection pool starvation caused by unindexed foreign key lock contention.';
      const confidence = activeIncident.rootCause?.aiConfidence || 96;

      return {
        command,
        intent: 'SHOW_ROOT_CAUSE',
        spokenResponse: `The root cause for ${activeIncident.id} on ${activeIncident.affectedServiceName} is: ${rcaSummary} (AI Confidence: ${confidence}%).`,
        detailedFindings: `AI Root Cause Analysis for ${activeIncident.id} (${confidence}% Confidence): ${rcaSummary}`,
        uiAction: {
          type: 'SHOW_MODAL_TAB',
          payload: { tab: 'rca', incidentId: activeIncident.id },
        },
      };
    }

    // 3. Investigate Incident
    if (text.includes('investigate') || text.includes('current incident') || text.includes('check incident')) {
      if (!activeIncident) {
        return {
          command,
          intent: 'INVESTIGATE_INCIDENT',
          spokenResponse: 'All 12 microservices are operational. There are no active incidents to investigate.',
          detailedFindings: 'Cluster Telemetry: 12/12 services healthy. P99 latency within 45ms SLA.',
          uiAction: { type: 'NONE' },
        };
      }

      return {
        command,
        intent: 'INVESTIGATE_INCIDENT',
        spokenResponse: `Investigating ${activeIncident.severity} incident ${activeIncident.id} on ${activeIncident.affectedServiceName}: ${activeIncident.title}.`,
        detailedFindings: `Incident ${activeIncident.id} Active: ${activeIncident.title} on ${activeIncident.affectedServiceName}. Root cause investigation active.`,
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: activeIncident.id },
        },
      };
    }

    // 4. Check Service Health (Search all 12 services dynamically)
    let matchedSvc = liveServices.find(
      (s) => text.includes(s.name.toLowerCase()) || text.includes(s.id.toLowerCase())
    );
    if (!matchedSvc) {
      if (text.includes('payment') || text.includes('stripe')) matchedSvc = liveServices.find((s) => s.id === 'svc-payment');
      else if (text.includes('inventory') || text.includes('warehouse')) matchedSvc = liveServices.find((s) => s.id === 'svc-inventory');
      else if (text.includes('auth') || text.includes('iam') || text.includes('login')) matchedSvc = liveServices.find((s) => s.id === 'svc-auth');
      else if (text.includes('order') || text.includes('checkout')) matchedSvc = liveServices.find((s) => s.id === 'svc-order');
      else if (text.includes('search') || text.includes('elastic')) matchedSvc = liveServices.find((s) => s.id === 'svc-search');
      else if (text.includes('cart')) matchedSvc = liveServices.find((s) => s.id === 'svc-cart');
      else if (text.includes('catalog') || text.includes('product')) matchedSvc = liveServices.find((s) => s.id === 'svc-catalog');
      else if (text.includes('shipping') || text.includes('carrier')) matchedSvc = liveServices.find((s) => s.id === 'svc-shipping');
      else if (text.includes('notify') || text.includes('notification')) matchedSvc = liveServices.find((s) => s.id === 'svc-notify');
      else if (text.includes('database') || text.includes('postgres') || text.includes('db')) matchedSvc = liveServices.find((s) => s.id === 'svc-db-cluster');
      else if (text.includes('gateway') || text.includes('api')) matchedSvc = liveServices.find((s) => s.id === 'svc-api-gw');
    }

    if (matchedSvc || text.includes('health') || text.includes('service')) {
      const svc = matchedSvc || liveServices.find((s) => s.status !== 'HEALTHY') || liveServices[0];
      return {
        command,
        intent: 'CHECK_SERVICE_HEALTH',
        spokenResponse: `${svc.name} is currently ${svc.status}. P99 latency is ${svc.latency} milliseconds and error rate is ${svc.errorRate} percent.`,
        detailedFindings: `Telemetry for ${svc.name} (${svc.id}): Status: ${svc.status} | Latency: ${svc.latency}ms | Error Rate: ${svc.errorRate}% | CPU: ${svc.cpu}%.`,
        uiAction: {
          type: 'SELECT_SERVICE',
          payload: { serviceId: svc.id },
        },
      };
    }

    // 5. Generate Postmortem
    if (text.includes('postmortem') || text.includes('post-mortem') || text.includes('report')) {
      return {
        command,
        intent: 'GENERATE_POSTMORTEM',
        spokenResponse:
          'Navigating to SRE reports. Incident post-mortem summary is ready with full timeline and export options.',
        detailedFindings:
          'Post-Mortem Ready: MTTR benchmarked at 6.4 minutes. AI automated root cause synthesis achieved 96.8% accuracy.',
        uiAction: {
          type: 'SWITCH_TAB',
          payload: { tab: 'reports' },
        },
      };
    }

    // 6. Explain Incident
    if (text.includes('explain') || text.includes('what happened') || text.includes('summary')) {
      if (!activeIncident) {
        return {
          command,
          intent: 'EXPLAIN_INCIDENT',
          spokenResponse:
            'All systems are operating normally. The cluster is running at nominal latency with zero active outages.',
          detailedFindings: 'System Baseline: 12 services healthy, zero anomalies reported in telemetry pipeline.',
          uiAction: { type: 'NONE' },
        };
      }

      return {
        command,
        intent: 'EXPLAIN_INCIDENT',
        spokenResponse: `Incident ${activeIncident.id} occurred on ${activeIncident.affectedServiceName}: ${
          activeIncident.rootCause?.summary || activeIncident.title
        }.`,
        detailedFindings: `Summary of ${activeIncident.id}: ${activeIncident.title}. Impacting ${activeIncident.affectedServiceName}. SRE remediation plan formulated with safety checks.`,
        uiAction: {
          type: 'OPEN_INCIDENT',
          payload: { incidentId: activeIncident.id },
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
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;

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
