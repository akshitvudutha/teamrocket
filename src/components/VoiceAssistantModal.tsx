import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Radio,
  RefreshCw,
  Terminal,
  Settings2,
  Play,
  RotateCcw,
  Sliders,
  Info,
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

  // Suggested commands for quick tap
  const suggestedCommands = [
    'Investigate the current incident',
    'Show the root cause',
    'Check payment service health',
    'Generate a postmortem',
    'Explain the latest incident',
    'Apply remediation and restart (Test Safety Gate)',
  ];

  // Load voices and initialize settings on open
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
      setShowSettings(false);
    }
  }, [isOpen]);

  const handleStartListening = async () => {
    setErrorMessage('');
    setTranscript('');
    voiceService.stopSpeech();
    setIsSpeaking(false);

    await voiceService.startListening(
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          handleExecuteCommand(text);
        }
      },
      (status, errorMsg) => {
        if (status === 'ERROR') {
          setVoiceState('ERROR');
          setErrorMessage(errorMsg || 'Speech recognition failed.');
        } else if (status === 'LISTENING') {
          setVoiceState('LISTENING');
        } else if (status === 'IDLE' && voiceState === 'LISTENING') {
          setVoiceState('IDLE');
        }
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

  const handleExecuteCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;

    setVoiceState('PROCESSING');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message to history
    const userEntry: TranscriptEntry = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: cmdText,
      timestamp: nowTime,
    };
    setHistory((prev) => [...prev, userEntry]);

    try {
      const result = await voiceService.processCommand(cmdText, {
        activeIncidentId,
        serviceId: selectedServiceId,
      });

      setLastResult(result);
      setVoiceState('IDLE');

      // Append assistant message to history
      const asstEntry: TranscriptEntry = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: result.spokenResponse,
        intent: result.intent,
        timestamp: nowTime,
        safetyProtected: result.safetyProtected,
      };
      setHistory((prev) => [...prev, asstEntry]);

      // 1. Text-To-Speech read out (unless user muted)
      if (!isMuted && voiceService.isSynthesisSupported()) {
        setIsSpeaking(true);
        voiceService.speakText(result.spokenResponse, () => {
          setIsSpeaking(false);
        });
      }

      // 2. Dispatch UI action to dashboard
      if (result.uiAction && result.uiAction.type !== 'NONE') {
        onExecuteAction(result.uiAction);
      }
    } catch (err: any) {
      setVoiceState('ERROR');
      setErrorMessage(err.message || 'Failed to process voice command.');
    }
  };

  const toggleSpeechPlayback = () => {
    if (isSpeaking) {
      voiceService.stopSpeech();
      setIsSpeaking(false);
    } else if (lastResult?.spokenResponse) {
      setIsSpeaking(true);
      voiceService.speakText(lastResult.spokenResponse, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    voiceService.setSelectedVoice(uri);
  };

  const handleRateChange = (rateVal: number) => {
    setSpeechRate(rateVal);
    voiceService.setRate(rateVal);
  };

  const handlePitchChange = (pitchVal: number) => {
    setSpeechPitch(pitchVal);
    voiceService.setPitch(pitchVal);
  };

  const handlePreviewVoice = () => {
    setIsPreviewingVoice(true);
    voiceService.previewVoice(
      'Team Rocket SRE Commander. System metrics are nominal.',
      () => setIsPreviewingVoice(false)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#11131c]/95 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl">
        {/* Top Header Bar */}
        <div className="p-4.5 border-b border-white/[0.08] bg-black/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-md shadow-indigo-950/60 ring-1 ring-white/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white font-sans">Voice AI Commander</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-indigo-300 border border-white/[0.08]">
                  Hands-Free SRE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Speak incident queries, diagnose root causes, and query service metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Voice & Speech Settings"
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                showSettings
                  ? 'bg-white/[0.15] border-white/20 text-white'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Drawer (Collapsible) */}
        {showSettings && (
          <div className="p-4 border-b border-white/[0.08] bg-black/40 space-y-3.5 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Device Speech Synthesis Settings
              </span>
              <button
                onClick={handlePreviewVoice}
                disabled={isPreviewingVoice}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPreviewingVoice ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            {/* Device Voice Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Available Natural Voice on Device</label>
              <select
                value={selectedVoiceURI}
                onChange={handleVoiceChange}
                className="w-full bg-[#161925] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20"
              >
                {availableVoices.length === 0 ? (
                  <option value="">Default System Voice</option>
                ) : (
                  availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? '— [System Default]' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                Voices are dynamically provided by your browser & OS (Apple Siri, Microsoft Neural, Google TTS).
              </p>
            </div>

            {/* Sliders for Speed and Pitch */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Speech Speed</span>
                  <span className="font-mono text-indigo-300">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Voice Pitch</span>
                  <span className="font-mono text-indigo-300">{speechPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Luminous Apple/Siri-Style AI Orb Stage */}
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-black/30 border border-white/[0.06] text-center space-y-5 relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-purple-500/[0.05] pointer-events-none"></div>

            {/* The Animated AI Orb Container */}
            <div className="relative flex items-center justify-center">
              {/* Outer Soundwave Rings during LISTENING */}
              {voiceState === 'LISTENING' && (
                <>
                  <div className="absolute w-36 h-36 rounded-full border border-rose-500/20 animate-ping duration-1000"></div>
                  <div className="absolute w-44 h-44 rounded-full border border-purple-500/20 animate-pulse"></div>
                </>
              )}

              {/* Shimmering Orbital Ring during PROCESSING */}
              {voiceState === 'PROCESSING' && (
                <div className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-amber-400 border-r-purple-400 animate-spin"></div>
              )}

              {/* Core Interactive AI Orb Button */}
              <button
                type="button"
                onClick={voiceState === 'LISTENING' ? handleStopListening : handleStartListening}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer select-none active:scale-95 group ${
                  voiceState === 'LISTENING'
                    ? 'bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 ring-4 ring-rose-500/30 scale-105 animate-pulse'
                    : voiceState === 'PROCESSING'
                    ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-600 animate-pulse'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-teal-500 ring-4 ring-indigo-500/30 animate-orb-breathe'
                    : 'bg-gradient-to-tr from-[#1b1e2c] via-[#24283c] to-[#1a1c29] hover:from-indigo-600 hover:to-rose-600 border border-white/[0.12] hover:border-white/30'
                }`}
              >
                {voiceState === 'LISTENING' ? (
                  <Mic className="w-9 h-9 text-white animate-bounce" />
                ) : voiceState === 'PROCESSING' ? (
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="w-8 h-8 text-white animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors" />
                )}
              </button>
            </div>

            {/* Dynamic Status Bar & Waveform */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono font-medium">
                {voiceState === 'LISTENING' ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      Listening to speech... (Click orb to finish)
                    </span>
                    {/* Pulsing Audio Waveform Bars */}
                    <div className="flex items-center gap-1 h-8">
                      <span className="w-1 bg-rose-400 rounded-full animate-orb-wave-1"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-orb-wave-2"></span>
                      <span className="w-1 bg-indigo-400 rounded-full animate-orb-wave-3"></span>
                      <span className="w-1 bg-rose-400 rounded-full animate-orb-wave-4"></span>
                      <span className="w-1 bg-amber-400 rounded-full animate-orb-wave-5"></span>
                    </div>
                  </div>
                ) : voiceState === 'PROCESSING' ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing SRE intent & telemetry...
                  </span>
                ) : isSpeaking ? (
                  <span className="text-indigo-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    Speaking response aloud...
                  </span>
                ) : (
                  <span className="text-slate-400">Click the orb to speak a command</span>
                )}
              </div>

              {/* Live Interim Transcript */}
              {transcript && (
                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] max-w-lg mx-auto">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">Live Transcript:</span>
                  <p className="text-xs text-white font-medium italic">"{transcript}"</p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assistant Findings & Safety Notification */}
          {lastResult && (
            <div className="p-5 rounded-3xl bg-[#141724]/90 border border-white/[0.08] space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-indigo-300 border border-white/[0.08]">
                    Intent: {lastResult.intent}
                  </span>
                  {lastResult.safetyProtected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Safety Protected
                    </span>
                  )}
                </div>

                <button
                  onClick={toggleSpeechPlayback}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Replay Voice'}</span>
                </button>
              </div>

              {/* Spoken Response text */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <p className="text-xs text-white leading-relaxed font-sans">{lastResult.spokenResponse}</p>
              </div>

              {/* Detailed Findings */}
              <div className="p-3.5 rounded-2xl bg-black/20 border border-white/[0.04] text-xs text-slate-300 leading-relaxed font-mono">
                {lastResult.detailedFindings}
              </div>

              {/* Safety Warning Callout if mutation was blocked */}
              {lastResult.safetyProtected && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200 leading-relaxed">
                    <strong>Zero-Mutation Guardrail Enforced:</strong> Remediations cannot be executed via audio. Please inspect and approve via the Human-in-the-Loop Safety Gate.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Command Suggestions */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Suggested SRE Voice Queries (Click to test)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedCommands.map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExecuteCommand(cmd)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">{cmd}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[10px]">
            Engine: Web Speech STT + Browser Natural TTS
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium transition-all cursor-pointer border border-white/[0.08]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
