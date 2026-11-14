import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle,
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
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Recovery Pipeline & Orchestration Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous runbook execution, progressive canary traffic verification, and automated rollback controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300">
            Active Pipelines: <strong className="text-rose-400">{activeIncidents.length}</strong>
          </span>
        </div>
      </div>

      {/* Active Recovery Pipelines */}
      {activeIncidents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">All Recovery Pipelines Cleared</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All 12 microservices are operating normally within their baseline latency and SLA tolerances.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                      {incident.id}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {incident.affectedServiceName}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{incident.title}</h4>
                </div>

                <div className="flex items-center space-x-2">
                  {incident.remediation.approvalStatus !== 'APPROVED' ? (
                    <button
                      onClick={() => onApproveRemediation(incident.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition cursor-pointer"
                    >
                      Authorize Execution
                    </button>
                  ) : (
                    <button
                      onClick={() => onCompleteRecovery(incident.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-950 transition cursor-pointer"
                    >
                      Verify & Finalize Recovery
                    </button>
                  )}
                  <button
                    onClick={() => onSelectIncident(incident)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Phase: {incident.recovery.phase}</span>
                  <span className="text-emerald-400 font-bold">{incident.recovery.progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${incident.recovery.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                {incident.recovery.steps.slice(0, 4).map((step, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300 truncate">{step.name}</span>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
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
