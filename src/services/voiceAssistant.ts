export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceSettings {
  voiceURI: string;
  rate: number; // 0.8 to 1.3, recommended 0.95
  pitch: number; // 0.8 to 1.3, recommended 1.0
}

export interface VoiceAssistantListener {
  onStateChange: (state: VoiceState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
  onVoicesLoaded?: (voices: SpeechSynthesisVoice[], selectedVoice: SpeechSynthesisVoice | null) => void;
}

const STORAGE_KEY = 'tarsier_voice_settings';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceURI: '',
  rate: 0.95, // Calm, professional moderate pace
  pitch: 1.0, // Natural female pitch
};

// Known female Indian English voice names across Edge, Chrome, Windows OneCore, macOS, Android
export const FEMALE_INDIAN_NAME_HINTS = [
  'neerja',
  'heera',
  'veena',
  'lekha',
  'sangeeta',
  'isha',
  'ananya',
  'priya',
  'aditi',
  'swara',
];

// Known male Indian English voice names
export const MALE_INDIAN_NAME_HINTS = [
  'prabhat',
  'ravi',
  'rishi',
  'karan',
  'madhav',
];

// Known female English voice names across general English locales
export const FEMALE_GENERAL_NAME_HINTS = [
  'hazel',
  'zira',
  'jenny',
  'aria',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'fiona',
  'catherine',
  'susan',
  'linda',
  'female',
  'woman',
];

/**
 * Intelligent Multi-tier Voice Ranking:
 * Tier 1 (1500 pts): Female Indian English (en-IN + female hint, e.g. Neerja, Heera, Veena)
 * Tier 2 (1200 pts): Indian English unspecified gender (en-IN without explicit male flag)
 * Tier 3 (1000 pts): Male Indian English (en-IN, preferred over other English locales per Req #4)
 * Tier 4 (800 pts):  Natural Female English from other locales (en-GB, en-US, en-AU per Req #3)
 * Tier 5 (500 pts):  Any other English voice (en-*)
 * Tier 6 (100 pts):  Any available voice
 */
export function rankVoice(voice: SpeechSynthesisVoice): number {
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();

  const isIndianEnglish = lang.includes('en-in') || (lang.startsWith('en') && name.includes('india'));
  const isFemaleIndianHint = FEMALE_INDIAN_NAME_HINTS.some((hint) => name.includes(hint));
  const isMaleIndianHint = MALE_INDIAN_NAME_HINTS.some((hint) => name.includes(hint));
  const isFemaleGeneralHint = FEMALE_GENERAL_NAME_HINTS.some((hint) => name.includes(hint));
  const isEnglish = lang.startsWith('en');

  // Tier 1: Female Indian English (Priority 1)
  if (isIndianEnglish && isFemaleIndianHint) {
    return 1500;
  }

  // Tier 2: Indian English (unspecified or natural without male flag)
  if (isIndianEnglish && !isMaleIndianHint) {
    return 1200;
  }

  // Tier 3: Male Indian English (en-IN preferred over other locales)
  if (isIndianEnglish) {
    return 1000;
  }

  // Tier 4: Natural Female English from other locales (en-GB, en-US, etc.)
  if (isEnglish && isFemaleGeneralHint) {
    return 800;
  }

  // Tier 5: Any other English voice
  if (isEnglish) {
    return 500;
  }

  // Tier 6: Any voice
  return 100;
}

export function isVoiceIndianEnglish(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();
  return lang.includes('en-in') || (lang.startsWith('en') && name.includes('india'));
}

export function isVoiceLikelyFemale(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  if (name.includes('female') || name.includes('woman')) return true;
  if (FEMALE_INDIAN_NAME_HINTS.some((h) => name.includes(h))) return true;
  if (FEMALE_GENERAL_NAME_HINTS.some((h) => name.includes(h))) return true;
  if (MALE_INDIAN_NAME_HINTS.some((h) => name.includes(h)) || name.includes('male') || name.includes('david')) return false;
  return false;
}

export class VoiceAssistant {
  private static instance: VoiceAssistant | null = null;

  private recognition: any = null;
  private state: VoiceState = 'idle';
  private listeners: Set<VoiceAssistantListener> = new Set();
  private isRecognitionSupported: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private settings: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS };

  // Speech Queue & Garbage Collection Defense
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private currentSessionId: number = 0;
  private chunkTimerId: any = null;
  private keepAliveTimerId: any = null;

  public static getInstance(): VoiceAssistant {
    if (!VoiceAssistant.instance) {
      VoiceAssistant.instance = new VoiceAssistant();
    }
    return VoiceAssistant.instance;
  }

  constructor() {
    this.loadSettings();

    if (typeof window !== 'undefined') {
      // 1. Initialize Web Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Indian English recognition

        this.recognition.onstart = () => {
          this.setState('listening');
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.notifyTranscript(finalTranscript.trim(), true);
          } else if (interimTranscript) {
            this.notifyTranscript(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          const errMsg = event.error || 'Speech recognition encountered an issue.';
          this.notifyError(errMsg);
          this.setState('error');
        };

        this.recognition.onend = () => {
          if (this.state === 'listening') {
            this.setState('idle');
          }
        };

        this.isRecognitionSupported = true;
      }

      // 2. Initialize Speech Synthesis Voices with immediate + asynchronous handlers
      this.initVoices();
    }
  }

  public subscribe(listener: VoiceAssistantListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state and voices
    listener.onStateChange(this.state);
    if (this.availableVoices.length > 0 && listener.onVoicesLoaded) {
      listener.onVoicesLoaded(this.availableVoices, this.selectedVoice);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(state: VoiceState) {
    for (const l of this.listeners) {
      try {
        l.onStateChange(state);
      } catch {}
    }
  }

  private notifyTranscript(transcript: string, isFinal: boolean) {
    for (const l of this.listeners) {
      try {
        l.onTranscript(transcript, isFinal);
      } catch {}
    }
  }

  private notifyError(errorMessage: string) {
    for (const l of this.listeners) {
      try {
        l.onError(errorMessage);
      } catch {}
    }
  }

  private notifyVoicesLoaded() {
    for (const l of this.listeners) {
      if (l.onVoicesLoaded) {
        try {
          l.onVoicesLoaded(this.availableVoices, this.selectedVoice);
        } catch {}
      }
    }
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.notifyState(newState);
  }

  private loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.settings = { ...DEFAULT_VOICE_SETTINGS, ...parsed };
        }
      }
    } catch {}
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch {}

    // Update active voice reference if changed
    if (newSettings.voiceURI) {
      this.selectedVoice = this.resolveVoice();
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public resetToRecommended() {
    this.saveSettings({
      rate: DEFAULT_VOICE_SETTINGS.rate,
      pitch: DEFAULT_VOICE_SETTINGS.pitch,
    });
    // Auto-select best available voice
    const best = this.findBestVoice(this.availableVoices);
    if (best) {
      this.selectedVoice = best;
      this.saveSettings({ voiceURI: best.voiceURI || best.name });
    }
    this.notifyVoicesLoaded();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const populate = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.availableVoices = [...voices].sort((a, b) => rankVoice(b) - rankVoice(a));

        // Resolve active voice
        let chosen: SpeechSynthesisVoice | null = null;
        if (this.settings.voiceURI) {
          chosen =
            this.availableVoices.find(
              (v) => v.voiceURI === this.settings.voiceURI || v.name === this.settings.voiceURI
            ) || null;
        }

        if (!chosen) {
          chosen = this.findBestVoice(this.availableVoices);
          if (chosen) {
            this.settings.voiceURI = chosen.voiceURI || chosen.name;
            this.saveSettings({ voiceURI: this.settings.voiceURI });
          }
        }

        this.selectedVoice = chosen;
        this.notifyVoicesLoaded();
      }
    };

    // Immediate attempt
    populate();

    // Attach voiceschanged listeners
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populate;
    }
    window.speechSynthesis.addEventListener('voiceschanged', populate);

    // Backup polling for Chromium engines where onvoiceschanged may be delayed
    const pollIntervals = [50, 150, 300, 800, 1500];
    pollIntervals.forEach((ms) => {
      setTimeout(() => {
        if (this.availableVoices.length === 0) {
          populate();
        }
      }, ms);
    });
  }

  private findBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;
    const sorted = [...voices].sort((a, b) => rankVoice(b) - rankVoice(a));
    return sorted[0] || null;
  }

  public resolveVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (this.settings.voiceURI) {
      const match = voices.find(
        (v) => v.voiceURI === this.settings.voiceURI || v.name === this.settings.voiceURI
      );
      if (match) return match;
    }

    return this.findBestVoice(voices);
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  public getActiveVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice || this.resolveVoice();
  }

  public setSelectedVoice(voiceURI: string) {
    this.saveSettings({ voiceURI });
    this.selectedVoice = this.resolveVoice();
    this.notifyVoicesLoaded();
  }

  get supported(): boolean {
    return this.isRecognitionSupported;
  }

  get currentState(): VoiceState {
    return this.state;
  }

  public startListening(): boolean {
    if (!this.recognition) {
      this.notifyError('Web Speech API is not supported in this browser. You can type commands manually.');
      return false;
    }

    try {
      // Immediately stop any active speech synthesis so it doesn't record itself
      this.stopSpeaking();
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.notifyError(err.message || 'Could not start microphone capture.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setState('idle');
  }

  // Pre-process and sanitize text for natural technical operations engineer speech output
  public prepareSpeechText(rawText: string): string {
    return rawText
      // Status codes
      .replace(/\b504\b/g, 'five zero four')
      .replace(/\b500\b/g, 'five hundred')
      .replace(/\b502\b/g, 'five zero two')
      .replace(/\b503\b/g, 'five zero three')
      .replace(/\b200\b/g, 'two hundred')
      .replace(/\b404\b/g, 'four zero four')
      .replace(/\b403\b/g, 'four zero three')
      // Technical units and metrics
      .replace(/\b(\d+)\s*ms\b/gi, '$1 milliseconds')
      .replace(/\b(\d+)\s*s\b/gi, '$1 seconds')
      .replace(/\b(\d+)\s*m\b/gi, '$1 minutes')
      .replace(/(\d+)?\s*req\/s\b/gi, (_, num) => (num ? `${num} requests per second` : 'requests per second'))
      .replace(/\bp95\b/gi, 'P 95')
      .replace(/\bp99\b/gi, 'P 99')
      .replace(/\bp50\b/gi, 'P 50')
      .replace(/\bMTTR\b/g, 'M T T R')
      .replace(/\bMTTD\b/g, 'M T T D')
      .replace(/\bRCA\b/g, 'Root Cause Analysis')
      .replace(/\bSRE\b/g, 'S R E')
      .replace(/\bSSO\b/g, 'S S O')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bDB\b/g, 'Database')
      // Clean markdown symbols & code blocks
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/[-*]\s+/g, '')
      .replace(/\$/g, '')
      .trim();
  }

  // Split long responses into sentence chunks to prevent Chromium speech buffer timeouts
  public splitIntoSentenceChunks(text: string): string[] {
    const rawChunks = text.split(/(?<=[.?!;])\s+|\n+/);
    const chunks: string[] = [];

    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      if (trimmed.length > 180) {
        // Sub-split by comma or conjunction if too long
        const subParts = trimmed.split(/(?<=[,])\s+/);
        chunks.push(...subParts.map((s) => s.trim()).filter(Boolean));
      } else {
        chunks.push(trimmed);
      }
    }

    return chunks.length > 0 ? chunks : [text];
  }

  public async speak(text: string): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.notifyError('Speech synthesis is not supported on this browser.');
      return;
    }

    // 1. Immediately abort any active speech session and timers
    this.stopSpeaking();

    // 2. Increment session ID so any pending callbacks from previous speeches discard
    const sessionId = ++this.currentSessionId;

    // 3. Allow brief 40ms event loop microtask tick for Chromium audio cancellation to settle
    await new Promise((r) => setTimeout(r, 40));
    if (this.currentSessionId !== sessionId) return;

    const cleanedText = this.prepareSpeechText(text);
    const sentenceChunks = this.splitIntoSentenceChunks(cleanedText);

    if (sentenceChunks.length === 0) {
      this.setState('idle');
      return;
    }

    this.setState('speaking');

    // 4. Start Chromium KeepAlive timer (prevents Chromium 14-second stall bug)
    this.startKeepAlive();

    return new Promise((resolve) => {
      let currentIdx = 0;

      const speakNextChunk = () => {
        // If session was superseded or cancelled, abort
        if (this.currentSessionId !== sessionId) {
          resolve();
          return;
        }

        if (currentIdx >= sentenceChunks.length) {
          this.stopKeepAlive();
          this.setState('idle');
          resolve();
          return;
        }

        const chunk = sentenceChunks[currentIdx];
        currentIdx++;

        const utterance = new SpeechSynthesisUtterance(chunk);

        // KEEP STRONG REFERENCE: Prevents V8 garbage collection of utterance mid-speech!
        this.activeUtterances.add(utterance);

        // Dynamically resolve the best active voice
        const activeVoice = this.resolveVoice();
        if (activeVoice) {
          utterance.voice = activeVoice;
          utterance.lang = activeVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }

        // Apply rate and pitch
        utterance.rate = Math.max(0.8, Math.min(1.3, this.settings.rate || 0.95));
        utterance.pitch = Math.max(0.8, Math.min(1.3, this.settings.pitch || 1.0));

        utterance.onend = () => {
          this.activeUtterances.delete(utterance);
          if (this.currentSessionId === sessionId) {
            // Natural brief pause between sentences (60ms)
            this.chunkTimerId = setTimeout(speakNextChunk, 60);
          }
        };

        utterance.onerror = (e) => {
          this.activeUtterances.delete(utterance);
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('[TARSIER Voice] Chunk error:', e.error);
          }
          if (this.currentSessionId === sessionId) {
            if (currentIdx < sentenceChunks.length) {
              this.chunkTimerId = setTimeout(speakNextChunk, 60);
            } else {
              this.stopKeepAlive();
              this.setState('idle');
              resolve();
            }
          }
        };

        // Resume if browser was paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    });
  }

  public stopSpeaking() {
    this.currentSessionId++; // Invalidate active session immediately
    if (this.chunkTimerId) {
      clearTimeout(this.chunkTimerId);
      this.chunkTimerId = null;
    }
    this.stopKeepAlive();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.activeUtterances.clear();
    this.setState('idle');
  }

  // Chromium keep-alive interval: toggles pause/resume every 9s if speech is playing
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimerId = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 9000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimerId) {
      clearInterval(this.keepAliveTimerId);
      this.keepAliveTimerId = null;
    }
  }
}

// Export shared singleton instance
export const voiceAssistant = VoiceAssistant.getInstance();
