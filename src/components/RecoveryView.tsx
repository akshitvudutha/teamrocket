import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import { Incident } from '../types';

interface RecoveryViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onApproveRemediation: (incidentId: string) => void;
  onCompleteRecovery: (incidentId: string) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({
  incidents,
  onSelectIncident,
  onApproveRemediation,
  onCompleteRecovery,
}) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-6 rounded-3xl bg-[#131622]/80 backdrop-blur-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Recovery Pipeline & Orchestration Engine
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">
                Automated Verification & Progressive Canary Promotion
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Multi-stage recovery pipeline with automated canary probe verification, database connection pool draining, and human approval safety gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3.5 py-1.5 rounded-full bg-black/40 border border-white/[0.08] font-mono text-slate-300">
            Active Pipelines: <strong className="text-rose-400 font-semibold">{activeIncidents.length}</strong>
          </span>
        </div>
      </div>

      {/* Active Recovery Pipelines */}
      {activeIncidents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#131622]/40 border border-white/[0.06] text-center space-y-3 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">All Recovery Pipelines Cleared</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All 12 microservices are operating within nominal baseline parameters. No remediation gates pending authorization.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="p-5 rounded-3xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {incident.id}
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      {incident.affectedServiceName}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{incident.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  {incident.remediation.approvalStatus !== 'APPROVED' ? (
                    <button
                      onClick={() => onApproveRemediation(incident.id)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Authorize Execution
                    </button>
                  ) : (
                    <button
                      onClick={() => onCompleteRecovery(incident.id)}
                      className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Verify & Finalize Recovery
                    </button>
                  )}
                  <button
                    onClick={() => onSelectIncident(incident)}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Phase: {incident.recovery.phase}</span>
                  <span className="text-emerald-400 font-semibold text-xs tabular-nums">
                    {incident.recovery.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${incident.recovery.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
                {incident.recovery.steps.slice(0, 4).map((step, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-black/30 border border-white/[0.04] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300 truncate text-[11px]">{step.name}</span>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {step.details}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
