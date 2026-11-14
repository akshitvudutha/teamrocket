import React, { useState, useEffect } from 'react';
import { Rocket, ShieldAlert, CheckCircle2, AlertTriangle, Zap, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { Incident, ServiceHealth } from '../types';
import { SIMULATION_SCENARIOS } from '../data/mockData';

interface HeaderProps {
  incidents: Incident[];
  services: ServiceHealth[];
  onSimulateScenario: (scenarioId?: string) => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidents,
  services,
  onSimulateScenario,
  onResetAll,
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

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH' && i.status !== 'RESOLVED').length;
  const degradedServices = services.filter(s => s.status !== 'HEALTHY').length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 ring-1 ring-white/20">
            <Rocket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
                Team Rocket
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Commander
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              On-Call Autonomous Incident Response & SRE Platform
            </p>
          </div>
        </div>

        {/* System Status Banner & Live Meta */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          {criticalCount > 0 ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-800/80 text-red-200 text-xs shadow-inner shadow-red-950">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="font-semibold tracking-wide">
                CRITICAL ALERT: {criticalCount} Active P1 Incident{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          ) : highCount > 0 || degradedServices > 0 ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800/80 text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-semibold">
                DEGRADED: {degradedServices} Service{degradedServices > 1 ? 's' : ''} Impacted
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">ALL 12 SERVICES OPERATIONAL</span>
            </div>
          )}

          {/* Time & On-Call Responder */}
          <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr || '12:42:00 UTC'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">On-Call:</span>
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Rocket-Agent-01 + You
            </span>
          </div>

          {/* Simulation Trigger Controls */}
          <div className="relative">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => onSimulateScenario()}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-950/50 transition-all border border-rose-500/30 cursor-pointer active:scale-95"
                title="Instantly trigger a chaos engineering incident scenario"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Incident</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSimMenu(!showSimMenu)}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition cursor-pointer"
                title="Select specific scenario"
              >
                ▼
              </button>

              <button
                type="button"
                onClick={onResetAll}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition cursor-pointer"
                title="Reset all services and incidents to normal healthy state"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>

            {/* Dropdown Scenarios */}
            {showSimMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Chaos Scenario
                </div>
                <div className="mt-1 space-y-1">
                  {SIMULATION_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        onSimulateScenario(sc.id);
                        setShowSimMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition text-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-rose-400">
                          {sc.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          sc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                          sc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
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
