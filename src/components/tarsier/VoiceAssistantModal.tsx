import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VoiceAssistant, VoiceState } from '../../services/voiceAssistant';
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
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [latestResult, setLatestResult] = useState<VoiceCommandResult | null>(null);
  const [voiceService, setVoiceService] = useState<VoiceAssistant | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const assistant = new VoiceAssistant({
      onStateChange: (state) => {
        setVoiceState(state);
        setIsSpeaking(state === 'speaking');
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
    });

    setVoiceService(assistant);

    return () => {
      assistant.stopListening();
      assistant.stopSpeaking();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setErrorMsg(null);
    setTranscript('');
    if (voiceService) {
      voiceService.startListening();
    }
  };

  const handleStopListening = () => {
    if (voiceService) {
      voiceService.stopListening();
    }
  };

  const handleProcessCommand = async (commandText: string) => {
    setVoiceState('processing');
    try {
      const result = await api.sendVoiceCommand(commandText);
      setLatestResult(result);
      setVoiceState('idle');

      // Speak response aloud
      if (voiceService && result.spokenResponse) {
        voiceService.speak(result.spokenResponse);
      }

      if (onExecuteUiAction && result.uiAction && result.uiAction.type !== 'NONE') {
        onExecuteUiAction(result.uiAction);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process voice command.');
      setVoiceState('error');
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

  const quickCommands = [
    'Investigate the current incident',
    'Show the root cause',
    'Check payment service health',
    'Generate a postmortem',
    'Explain the latest incident',
    'Remediate payment gateway', // Tests safety invariant
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D0D10] border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            if (voiceService) {
              voiceService.stopListening();
              voiceService.stopSpeaking();
            }
            onClose();
          }}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
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
              Speak naturally to query telemetry, run RCA, or check fleet health.
            </p>
          </div>
        </div>

        {/* Main Mic Interactive Sphere */}
        <div className="my-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#15151A] border border-white/5 relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              voiceState === 'listening'
                ? 'bg-gradient-to-t from-[#007AFF]/20 via-transparent to-transparent opacity-100'
                : voiceState === 'speaking'
                ? 'bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-100'
                : 'opacity-0'
            }`}
          />

          {/* Animated Central Button */}
          <button
            onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              voiceState === 'listening'
                ? 'bg-[#007AFF] text-white shadow-[0_0_35px_rgba(0,122,255,0.6)] animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                : 'bg-[#202028] text-neutral-300 hover:text-white hover:bg-[#282834] border border-white/10'
            }`}
          >
            {voiceState === 'listening' ? (
              <Radio className="w-8 h-8 animate-spin" />
            ) : voiceState === 'speaking' ? (
              <Volume2 className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          {/* Status Label */}
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
              {voiceState === 'speaking' && (
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
            className={`mb-4 p-4 rounded-xl border text-left overflow-y-auto max-h-48 transition-all ${
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
              {isSpeaking && (
                <button
                  onClick={() => voiceService?.stopSpeaking()}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center space-x-1"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Mute</span>
                </button>
              )}
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
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
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
      </div>
    </div>
  );
}
