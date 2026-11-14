import React, { useState, useEffect } from 'react';
import {
  Rocket,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCcw,
  Clock,
  Sparkles,
  Mic,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { Incident, ServiceHealth } from '../types';
import { SIMULATION_SCENARIOS } from '../data/mockData';

interface HeaderProps {
  incidents: Incident[];
  services: ServiceHealth[];
  onSimulateScenario: (scenarioId?: string) => void;
  onResetAll: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidents,
  services,
  onSimulateScenario,
  onResetAll,
  onOpenVoiceAssistant,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showSimMenu, setShowSimMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED').length;
  const degradedServices = services.filter((s) => s.status !== 'HEALTHY').length;

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e14]/85 backdrop-blur-2xl border-b border-white/[0.08] px-5 py-3 transition-colors">
      <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Left: Brand Identity with Apple Window Traffic Dot Aesthetic */}
        <div className="flex items-center space-x-4">
          {/* Subtle macOS Traffic Dots */}
          <div className="hidden sm:flex items-center space-x-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]/40 shadow-xs"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]/40 shadow-xs"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]/40 shadow-xs"></span>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block"></div>

          {/* Logo & Product Meta */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-950/40 ring-1 ring-white/20">
              <Rocket className="w-4 h-4 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold tracking-tight text-white font-sans">
                  Team Rocket
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> SRE Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight">
                Autonomous On-Call Incident Response & Observability
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Live System Capsule & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live System Status Pill */}
          {criticalCount > 0 ? (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium tracking-tight">
                Critical Alert: {criticalCount} Active P1 Incident{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          ) : highCount > 0 || degradedServices > 0 ? (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium tracking-tight">
                Degraded: {degradedServices} Service{degradedServices > 1 ? 's' : ''} Impacted
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium tracking-tight">All 12 Services Operational</span>
            </div>
          )}

          {/* Time & On-Call Badge */}
          <div className="hidden md:flex items-center space-x-2.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="tabular-nums">{timeStr || '12:00:00 UTC'}</span>
            <span className="text-white/10">|</span>
            <span className="text-slate-400 font-sans text-[11px]">On-Call:</span>
            <span className="text-slate-200 font-sans text-[11px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Rocket-01 + You
            </span>
          </div>

          {/* Voice Assistant Pill Button (Apple Intelligence Aura) */}
          {onOpenVoiceAssistant && (
            <button
              type="button"
              onClick={onOpenVoiceAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-rose-500/20 hover:from-indigo-500/30 hover:to-rose-500/30 text-white text-xs font-medium border border-indigo-400/30 shadow-xs hover:border-indigo-400/50 transition-all cursor-pointer active:scale-95 group"
              title="Open Voice Assistant (Microphone commands with speech output)"
            >
              <div className="relative">
                <Mic className="w-3.5 h-3.5 text-indigo-300 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              </div>
              <span>Voice Assistant</span>
              <span className="text-[10px] font-mono px-1 rounded bg-white/[0.08] text-indigo-200 border border-white/[0.1]">
                AI
              </span>
            </button>
          )}

          {/* Chaos Engineering Dropdown Trigger */}
          <div className="relative">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onSimulateScenario()}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-medium shadow-xs shadow-rose-950/50 transition-all cursor-pointer active:scale-95 border border-rose-500/30"
                title="Inject Chaos Scenario"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-white/90" />
                <span>Simulate</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSimMenu(!showSimMenu)}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all cursor-pointer"
                title="Select specific scenario"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onResetAll}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs border border-white/[0.08] transition-all cursor-pointer"
                title="Reset all services to healthy baseline"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline text-[11px]">Reset</span>
              </button>
            </div>

            {/* Frosted Dropdown Menu */}
            {showSimMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[#12151e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                  <span>Chaos Engineering Scenarios</span>
                  <span className="font-mono text-[9px] text-slate-500">5 Available</span>
                </div>
                <div className="mt-1 space-y-1">
                  {SIMULATION_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        onSimulateScenario(sc.id);
                        setShowSimMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.06] transition text-xs group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200 group-hover:text-white">
                          {sc.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase ${
                            sc.severity === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : sc.severity === 'HIGH'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {sc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        Target: {sc.serviceName}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
