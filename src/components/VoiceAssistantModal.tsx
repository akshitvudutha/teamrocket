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

  // Suggested commands for quick tap or voice reference
  const suggestedCommands = [
    'Investigate the current incident',
    'Show the root cause',
    'Check payment service health',
    'Generate a postmortem',
    'Explain the latest incident',
    'Apply remediation and restart (Test Safety Block)',
  ];

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      voiceService.stopListening();
      voiceService.stopSpeech();
      setVoiceState('IDLE');
      setIsSpeaking(false);
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
    try {
      const result = await voiceService.processCommand(cmdText, {
        activeIncidentId,
        serviceId: selectedServiceId,
      });

      setLastResult(result);
      setVoiceState('IDLE');

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-950/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">Team Rocket Voice Commander</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80">
                  AI SRE Assistant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speak commands to query metrics, investigate root causes, and audit health.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isMuted
                  ? 'bg-red-950/60 border-red-800 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Microphone Activation Stage */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800/90 text-center space-y-4">
            <div className="relative">
              {voiceState === 'LISTENING' && (
                <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping"></div>
              )}
              <button
                type="button"
                onClick={voiceState === 'LISTENING' ? handleStopListening : handleStartListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
                  voiceState === 'LISTENING'
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-110 shadow-rose-950/80 ring-4 ring-rose-500/30'
                    : voiceState === 'PROCESSING'
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500'
                }`}
              >
                {voiceState === 'LISTENING' ? (
                  <Mic className="w-8 h-8 animate-bounce" />
                ) : voiceState === 'PROCESSING' ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status indicator */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono font-semibold">
                {voiceState === 'LISTENING' ? (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Listening to microphone... (Click button when done)
                  </span>
                ) : voiceState === 'PROCESSING' ? (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Transcribing & classifying SRE intent...
                  </span>
                ) : (
                  <span className="text-slate-400">Click the microphone to start speaking</span>
                )}
              </div>

              {/* Audio waveform visualization when recording */}
              {voiceState === 'LISTENING' && (
                <div className="flex items-center justify-center space-x-1 pt-2 h-6">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-150 animate-pulse"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Transcript Display (Requirement #4: Display recognized text before execution) */}
            {transcript && (
              <div className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-left font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Recognized Speech:
                </span>
                <p className="text-sm font-semibold text-rose-300 mt-0.5">"{transcript}"</p>
              </div>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div className="w-full p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs text-left flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Microphone Error</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}
          </div>

          {/* Assistant Response Card */}
          {lastResult && (
            <div className="p-4.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      lastResult.safetyProtected
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    Intent: {lastResult.intent}
                  </span>
                  {lastResult.safetyProtected && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
                      <ShieldAlert className="w-3 h-3" /> Safety Protected
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleSpeechPlayback}
                  className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono cursor-pointer"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              </div>

              {/* Spoken Response text */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200 leading-relaxed font-sans font-medium">
                "{lastResult.spokenResponse}"
              </div>

              {/* Detailed Findings */}
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 leading-relaxed font-mono">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
                  Investigation Details:
                </span>
                {lastResult.detailedFindings}
              </div>

              {/* Action Button */}
              {lastResult.uiAction && lastResult.uiAction.type !== 'NONE' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onExecuteAction(lastResult.uiAction);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition cursor-pointer"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Command Suggestions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Quick Voice Command Prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedCommands.map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTranscript(cmd);
                    handleExecuteCommand(cmd);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Voice Engine: Web Speech API (STT) + SpeechSynthesis (TTS)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
