import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Play,
  Globe,
  Settings2,
  RotateCw,
} from 'lucide-react';
import {
  voiceAssistant,
  VoiceState,
  VoiceSettings,
  isVoiceIndianEnglish,
  isVoiceLikelyFemale,
  DEFAULT_VOICE_SETTINGS,
} from '../../services/voiceAssistant';
import { api } from '../../services/api';
import { VoiceCommandResult } from '../../types/tarsier';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteUiAction?: (action: VoiceCommandResult['uiAction']) => void;
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  onExecuteUiAction,
}: VoiceAssistantModalProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAssistant.currentState);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [latestResult, setLatestResult] = useState<VoiceCommandResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voice Settings & State
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(voiceAssistant.getSettings());

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to singleton voice assistant
    const unsubscribe = voiceAssistant.subscribe({
      onStateChange: (state) => {
        setVoiceState(state);
      },
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim().length > 0) {
          handleProcessCommand(text.trim());
        }
      },
      onError: (err) => {
        setErrorMsg(err);
      },
      onVoicesLoaded: (voices, active) => {
        setAvailableVoices(voices);
        setSelectedVoice(active);
      },
    });

    setAvailableVoices(voiceAssistant.getVoices());
    setSelectedVoice(voiceAssistant.getActiveVoice());
    setVoiceSettings(voiceAssistant.getSettings());

    return () => {
      // Ensure speech and listening stop when modal closes or unmounts
      voiceAssistant.stopListening();
      voiceAssistant.stopSpeaking();
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setErrorMsg(null);
    setTranscript('');
    voiceAssistant.startListening();
  };

  const handleStopListening = () => {
    voiceAssistant.stopListening();
  };

  const handleProcessCommand = async (commandText: string) => {
    // 1. Immediately stop any active speech before processing
    voiceAssistant.stopSpeaking();

    try {
      const result = await api.sendVoiceCommand(commandText);
      setLatestResult(result);

      // 2. Speak the response aloud using the active voice
      if (result.spokenResponse) {
        voiceAssistant.speak(result.spokenResponse);
      }

      if (onExecuteUiAction && result.uiAction && result.uiAction.type !== 'NONE') {
        onExecuteUiAction(result.uiAction);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process voice command.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    setTranscript(typedInput.trim());
    handleProcessCommand(typedInput.trim());
    setTypedInput('');
  };

  const handleQuickCommand = (cmd: string) => {
    setTranscript(cmd);
    handleProcessCommand(cmd);
  };

  // Replay latest spoken response
  const handleReplayResponse = () => {
    if (latestResult?.spokenResponse) {
      voiceAssistant.speak(latestResult.spokenResponse);
    }
  };

  // Voice Settings Handlers
  const handleVoiceChange = (voiceURI: string) => {
    voiceAssistant.setSelectedVoice(voiceURI);
    setSelectedVoice(voiceAssistant.getActiveVoice());
    setVoiceSettings(voiceAssistant.getSettings());
  };

  const handleRateChange = (newRate: number) => {
    const updated = { ...voiceSettings, rate: newRate };
    setVoiceSettings(updated);
    voiceAssistant.saveSettings({ rate: newRate });
  };

  const handlePitchChange = (newPitch: number) => {
    const updated = { ...voiceSettings, pitch: newPitch };
    setVoiceSettings(updated);
    voiceAssistant.saveSettings({ pitch: newPitch });
  };

  const handleTestVoice = () => {
    const isIndian = isVoiceIndianEnglish(selectedVoice);
    const testPhrase = isIndian
      ? 'Hello SRE Commander. I am TARSIER, your Night Guard voice assistant. Multi-region health surveillance is active and all clusters are protected.'
      : `Hello SRE Commander. I am TARSIER, speaking with ${selectedVoice?.name || 'system fallback voice'}. Multi-region health probes are operational.`;
    voiceAssistant.speak(testPhrase);
  };

  const handleResetToRecommended = () => {
    voiceAssistant.resetToRecommended();
    setSelectedVoice(voiceAssistant.getActiveVoice());
    setVoiceSettings(voiceAssistant.getSettings());
  };

  const quickCommands = [
    'Investigate the current incident',
    'Show the root cause',
    'Check payment service health',
    'Generate a postmortem',
    'Explain the latest incident',
    'Remediate payment gateway', // Verifies safety invariant
  ];

  const isCurrentIndian = isVoiceIndianEnglish(selectedVoice);
  const isCurrentFemale = isVoiceLikelyFemale(selectedVoice);
  const isSpeaking = voiceState === 'speaking';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D0D10] border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            voiceAssistant.stopListening();
            voiceAssistant.stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#7055FF] p-[1px]">
              <div className="w-full h-full bg-[#0D0D10] rounded-[11px] flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#007AFF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">TARSIER Voice Commander</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20">
                  Deterministic SRE
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Natural speech output with intelligent female Indian-English voice matching.
              </p>
            </div>
          </div>

          {/* Voice Settings Toggle Pill */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showSettings
                ? 'bg-[#007AFF]/20 text-[#007AFF] border-[#007AFF]/40'
                : 'bg-[#15151A] text-neutral-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Configure Natural Voice, Speed & Pitch"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Active Voice Status Banner */}
        <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[#15151A] border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <Globe className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
            <span className="text-neutral-400">Voice Profile:</span>
            <span className="font-semibold text-white truncate">
              {selectedVoice ? selectedVoice.name : 'Detecting system voices...'}
            </span>
          </div>

          <span
            className={`shrink-0 ml-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isCurrentIndian
                ? isCurrentFemale
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isCurrentIndian
              ? isCurrentFemale
                ? 'en-IN • Female'
                : 'en-IN'
              : `${selectedVoice?.lang || 'en'} • Fallback`}
          </span>
        </div>

        {/* VOICE SETTINGS PANEL (Collapsible) */}
        {showSettings ? (
          <div className="my-2 p-5 rounded-2xl bg-[#15151A] border border-white/10 space-y-4 animate-in fade-in duration-200 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#007AFF]" />
                <span>Voice & Speech Synthesis Preferences</span>
              </h3>
              <button
                onClick={handleResetToRecommended}
                className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-[#007AFF] transition-colors cursor-pointer"
                title="Reset to recommended Female Indian-English defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Voice Dropdown */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Installed Voice Selector
              </label>
              <select
                value={selectedVoice?.voiceURI || selectedVoice?.name || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D0D10] border border-white/10 text-xs text-white focus:outline-none focus:border-[#007AFF] font-mono cursor-pointer"
              >
                {availableVoices.map((v) => {
                  const isIndian = isVoiceIndianEnglish(v);
                  const isFemale = isVoiceLikelyFemale(v);
                  const tag = isIndian ? (isFemale ? ' [Recommended: en-IN Female]' : ' [en-IN]') : '';
                  return (
                    <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                      {v.name} ({v.lang}){tag}
                    </option>
                  );
                })}
              </select>

              {!isCurrentIndian && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-normal flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-semibold text-white">System Fallback Notice:</span> No native <code className="text-white">en-IN</code> voice is installed in your current browser profile. TARSIER has automatically selected the closest available natural female English voice (<span className="text-white font-medium">{selectedVoice?.name}</span>). You can install Indian English voice packs via Windows Settings or Chrome/Edge language settings.
                  </div>
                </div>
              )}
            </div>

            {/* Speed Rate Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-neutral-300">Speaking Pace (Speed)</span>
                <span className="font-mono text-[#007AFF] font-bold">
                  {voiceSettings.rate.toFixed(2)}x {voiceSettings.rate === 0.95 ? '(Recommended)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.30"
                step="0.05"
                value={voiceSettings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-[#007AFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>0.80x (Deliberate)</span>
                <span>0.95x (Calm Ops Engineer)</span>
                <span>1.30x (Brisk)</span>
              </div>
            </div>

            {/* Pitch Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-neutral-300">Vocal Pitch</span>
                <span className="font-mono text-[#007AFF] font-bold">
                  {voiceSettings.pitch.toFixed(2)} {voiceSettings.pitch === 1.0 ? '(Natural Female)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.30"
                step="0.05"
                value={voiceSettings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-[#007AFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>0.80 (Lower Tone)</span>
                <span>1.00 (Natural Female)</span>
                <span>1.30 (Higher Tone)</span>
              </div>
            </div>

            {/* Test Voice Button */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={handleTestVoice}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,122,255,0.3)]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Voice Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl bg-[#0D0D10] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Main Interactive Mic Sphere */}
            <div className="my-2 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#15151A] border border-white/5 relative overflow-hidden">
              <div
                className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                  voiceState === 'listening'
                    ? 'bg-gradient-to-t from-[#007AFF]/20 via-transparent to-transparent opacity-100'
                    : isSpeaking
                    ? 'bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-100'
                    : 'opacity-0'
                }`}
              />

              <button
                onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  voiceState === 'listening'
                    ? 'bg-[#007AFF] text-white shadow-[0_0_35px_rgba(0,122,255,0.6)] animate-pulse'
                    : isSpeaking
                    ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                    : 'bg-[#202028] text-neutral-300 hover:text-white hover:bg-[#282834] border border-white/10'
                }`}
              >
                {voiceState === 'listening' ? (
                  <Radio className="w-8 h-8 animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="w-8 h-8 animate-bounce" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              <div className="mt-4 text-center z-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center justify-center gap-1.5">
                  {voiceState === 'listening' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
                      <span className="text-[#007AFF]">Listening for command...</span>
                    </>
                  )}
                  {voiceState === 'processing' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-amber-400">Processing with TARSIER AI...</span>
                    </>
                  )}
                  {isSpeaking && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-emerald-400">Speaking Findings Aloud...</span>
                    </>
                  )}
                  {voiceState === 'idle' && (
                    <span className="text-neutral-400">Click microphone or choose a quick prompt</span>
                  )}
                  {voiceState === 'error' && (
                    <span className="text-red-400">Microphone issue detected</span>
                  )}
                </div>

                {transcript && (
                  <p className="mt-2 text-sm font-medium text-white italic bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 max-w-md">
                    "{transcript}"
                  </p>
                )}
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="line-clamp-2">{errorMsg}</span>
              </div>
            )}

            {/* Results Card */}
            {latestResult && (
              <div
                className={`mb-3 p-4 rounded-xl border text-left overflow-y-auto max-h-44 transition-all ${
                  latestResult.safetyProtected
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#15151A] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {latestResult.safetyProtected ? (
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        latestResult.safetyProtected ? 'text-amber-400' : 'text-[#007AFF]'
                      }`}
                    >
                      {latestResult.intent}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isSpeaking ? (
                      <button
                        onClick={() => voiceAssistant.stopSpeaking()}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center space-x-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Speaking</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleReplayResponse}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center space-x-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded"
                        title="Replay speech audio"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-[#007AFF]" />
                        <span>Replay</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white leading-relaxed mb-2 font-medium">
                  {latestResult.spokenResponse}
                </p>
                {latestResult.detailedFindings && (
                  <p className="text-[11px] text-neutral-400 font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                    {latestResult.detailedFindings}
                  </p>
                )}
              </div>
            )}

            {/* Quick Sample Voice Prompts */}
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Recommended Voice Commands:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickCommands.map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleQuickCommand(cmd)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      cmd.includes('Remediate')
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-[#15151A] hover:bg-white/10 text-neutral-300 hover:text-white border-white/10'
                    }`}
                  >
                    {cmd.includes('Remediate') ? '🚨 ' : '🎙️ '}
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback Text Input */}
            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Or type a command: 'Investigate incident', 'Show root cause'..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#15151A] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="px-3 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
