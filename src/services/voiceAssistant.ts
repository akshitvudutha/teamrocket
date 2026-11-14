export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceAssistantCallbacks {
  onStateChange: (state: VoiceState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
}

export class VoiceAssistant {
  private recognition: any = null;
  private state: VoiceState = 'idle';
  private callbacks: VoiceAssistantCallbacks;
  private isSupported: boolean = false;

  constructor(callbacks: VoiceAssistantCallbacks) {
    this.callbacks = callbacks;

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

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
            this.callbacks.onTranscript(finalTranscript.trim(), true);
          } else if (interimTranscript) {
            this.callbacks.onTranscript(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          const errMsg = event.error || 'Speech recognition encountered an issue.';
          this.callbacks.onError(errMsg);
          this.setState('error');
        };

        this.recognition.onend = () => {
          if (this.state === 'listening') {
            this.setState('idle');
          }
        };

        this.isSupported = true;
      }
    }
  }

  get supported(): boolean {
    return this.isSupported;
  }

  get currentState(): VoiceState {
    return this.state;
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  startListening(): boolean {
    if (!this.recognition) {
      this.callbacks.onError('Web Speech API is not supported in this browser. You can type commands manually.');
      return false;
    }

    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.callbacks.onError(err.message || 'Could not start microphone capture.');
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setState('idle');
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      this.setState('speaking');

      const cleanText = text
        .replace(/\b504\b/g, 'five-zero-four')
        .replace(/\b200\b/g, 'two-hundred')
        .replace(/\bms\b/g, 'milliseconds')
        .replace(/`([^`]+)`/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.setState('idle');
        resolve();
      };

      utterance.onerror = () => {
        this.setState('idle');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.setState('idle');
  }
}
