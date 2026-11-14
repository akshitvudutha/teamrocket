import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  ShieldAlert,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { VoiceCommandResponse, VoiceState } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (action: VoiceCommandResponse['uiAction']) => void;
  activeIncidentId?: string;
  selectedServiceId?: string;
}

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  timestamp: string;
  safetyProtected?: boolean;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  activeIncidentId,
  selectedServiceId,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastResult, setLastResult] = useState<VoiceCommandResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Voice settings state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState<boolean>(false);

  // Conversation history
  const [history, setHistory] = useState<TranscriptEntry[]>([]);

  const suggestedCommands = [
    'Investigate the current incident',
    'Show the root cause',
    'Check payment service health',
    'Generate a postmortem',
    'Apply remediation (Test Safety Gate)',
  ];

  useEffect(() => {
    if (isOpen) {
      const voices = voiceService.getAvailableVoices();
      setAvailableVoices(voices);
      const current = voiceService.getSelectedVoice();
      if (current) setSelectedVoiceURI(current.voiceURI);
      setSpeechRate(voiceService.getRate());
      setSpeechPitch(voiceService.getPitch());
    } else {
      voiceService.stopListening();
      voiceService.stopSpeech();
      setVoiceState('IDLE');
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    setVoiceState('PROCESSING');

    const userEntry: TranscriptEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: cmdText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory((prev) => [...prev, userEntry]);

    try {
      const result = await voiceService.processCommand(cmdText, {
        activeIncidentId,
        serviceId: selectedServiceId,
      });

      setLastResult(result);

      const asstEntry: TranscriptEntry = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: result.spokenResponse,
        intent: result.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        safetyProtected: result.safetyProtected,
      };
      setHistory((prev) => [...prev, asstEntry]);

      if (!isMuted && voiceService.isSynthesisSupported()) {
        setIsSpeaking(true);
        setVoiceState('SPEAKING');
        voiceService.speakText(result.spokenResponse, () => {
          setIsSpeaking(false);
          setVoiceState('IDLE');
        });
      } else {
        setVoiceState('IDLE');
      }

      if (result.uiAction) {
        onExecuteAction(result.uiAction);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing voice command');
      setVoiceState('IDLE');
    }
  };

  const handleStartListening = async () => {
    setErrorMessage('');
    setTranscript('');
    voiceService.stopSpeech();
    setIsSpeaking(false);

    await voiceService.startListening(
      (text: string, isFinal: boolean) => {
        setTranscript(text);
        if (isFinal) {
          setVoiceState('PROCESSING');
          handleExecuteCommand(text);
        }
      },
      (status: 'LISTENING' | 'IDLE' | 'ERROR', errorMsg?: string) => {
        setVoiceState(status as VoiceState);
        if (errorMsg) setErrorMessage(errorMsg);
      }
    );
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    setVoiceState('IDLE');
    if (transcript.trim()) {
      handleExecuteCommand(transcript);
    }
  };

  const handleSelectSuggested = (cmd: string) => {
    setTranscript(cmd);
    handleExecuteCommand(cmd);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    voiceService.setSelectedVoice(uri);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeechRate(val);
    voiceService.setRate(val);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeechPitch(val);
    voiceService.setPitch(val);
  };

  const handlePreviewVoice = () => {
    setIsPreviewingVoice(true);
    voiceService.previewVoice('TARSIER autonomous on-call agent standing by.', () => {
      setIsPreviewingVoice(false);
    });
  };

  const toggleMute = () => {
    if (isSpeaking) {
      voiceService.stopSpeech();
      setIsSpeaking(false);
      setVoiceState('IDLE');
    }
    setIsMuted(!isMuted);
  };

  const isListening = voiceState === 'LISTENING';
  const isProcessing = voiceState === 'PROCESSING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg notch-card p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--border-medium)]">
        
        {/* Header with Close and Audio Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              TARSIER Voice Copilot
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={toggleMute}
              className="notch-btn-ghost p-1.5 text-[var(--text-muted)]"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="notch-btn-ghost p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Close TARSIER Voice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Animated AI Orb */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* Ambient aura glow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
                isListening
                  ? 'bg-rose-500/25 scale-125'
                  : isProcessing
                  ? 'bg-indigo-500/35 scale-115'
                  : isSpeaking
                  ? 'bg-violet-500/30 scale-120'
                  : 'bg-indigo-500/15 scale-100'
              }`}
            />

            {/* Orb sphere */}
            <div
              className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border border-[var(--border-medium)] ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 ring-4 ring-rose-500/20'
                  : isProcessing
                  ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 animate-orb-rotate'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-500 animate-orb-breathe'
                  : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 animate-orb-breathe'
              }`}
            >
              {isListening ? (
                /* Dynamic Equalizer Waves when listening */
                <div className="flex items-center space-x-1.5 h-12">
                  <span className="w-1 bg-white rounded-full animate-orb-wave-1" />
                  <span className="w-1 bg-white rounded-full animate-orb-wave-2" />
                  <span className="w-1 bg-white rounded-full animate-orb-wave-3" />
                  <span className="w-1 bg-white rounded-full animate-orb-wave-4" />
                  <span className="w-1 bg-white rounded-full animate-orb-wave-5" />
                </div>
              ) : isProcessing ? (
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Mic className="w-8 h-8 text-white/90" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-medium tracking-wide text-[var(--text-primary)]">
              {isListening
                ? 'Listening to speech...'
                : isProcessing
                ? 'Synthesizing causal inference...'
                : isSpeaking
                ? 'Assistant responding aloud'
                : 'Ready for voice query'}
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">
              {isListening ? 'Speak naturally into microphone' : 'Tap microphone or choose command below'}
            </p>
          </div>
        </div>

        {/* Primary Microphone Trigger */}
        <div className="flex justify-center">
          {isListening ? (
            <button
              onClick={handleStopListening}
              className="notch-btn-primary bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 text-xs font-medium shadow-lg"
            >
              <MicOff className="w-4 h-4" />
              <span>Stop Listening</span>
            </button>
          ) : (
            <button
              onClick={handleStartListening}
              className="notch-btn-primary px-7 py-2.5 text-xs font-medium shadow-lg"
            >
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>Tap to Speak</span>
            </button>
          )}
        </div>

        {/* Live Transcript / Response Box */}
        {(transcript || lastResult) && (
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
            {transcript && (
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase shrink-0">You:</span>
                <p className="text-[var(--text-primary)] font-medium">{transcript}</p>
              </div>
            )}
            {lastResult && (
              <div className="flex items-start gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-mono text-[10px] text-indigo-400 uppercase shrink-0">AI:</span>
                <div className="space-y-1 text-[var(--text-secondary)] leading-relaxed">
                  <p>{lastResult.spokenResponse}</p>
                  {lastResult.safetyProtected && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Safety Gate: Destructive actions require manual approval.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* Quick Suggested Commands */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Suggested Queries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggested(cmd)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium notch-btn-ghost text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Device Speech Settings */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Device Voice & Speech Synthesis Settings
            </span>
            <span>{showSettings ? '▲ Hide' : '▼ Expand'}</span>
          </button>

          {showSettings && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--text-muted)]">Select Device Voice</label>
                <select
                  value={selectedVoiceURI}
                  onChange={handleVoiceChange}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-medium)] cursor-pointer"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Speed Rate</span>
                    <span className="font-mono">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.1"
                    value={speechRate}
                    onChange={handleRateChange}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Pitch</span>
                    <span className="font-mono">{speechPitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    value={speechPitch}
                    onChange={handlePitchChange}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handlePreviewVoice}
                disabled={isPreviewingVoice}
                className="notch-btn-ghost text-xs w-full py-1.5 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isPreviewingVoice ? 'Testing Voice...' : 'Test Voice Synthesis'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
