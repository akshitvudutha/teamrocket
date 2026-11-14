import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Check,
  ArrowRight,
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Recovery Engine Banner */}
      <section className="notch-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-medium">
              Zero-Downtime Safe Rollout
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Recovery & Verification Engine
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Multi-stage recovery pipeline with automated canary probes, connection pool rebalancing, and mandatory human safety authorization gates.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-left font-mono shrink-0">
          <div className="text-[10px] uppercase text-[var(--text-muted)]">Active Recovery Pipelines</div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
            {activeIncidents.length} Pending Execution
          </div>
        </div>
      </section>

      {/* Recovery Pipeline Cards */}
      {activeIncidents.length === 0 ? (
        <section className="notch-card p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            No recovery workflows pending
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            All microservices have passed automated canary verification and are running with stable telemetry.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {activeIncidents.map((inc) => {
            const isApproved = inc.remediation.approvalStatus === 'APPROVED';
            const isRecovering = inc.status === 'RECOVERING';

            return (
              <div key={inc.id} className="notch-card p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                        {inc.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-500 font-medium">
                        {inc.affectedServiceName}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {inc.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isApproved ? (
                      <button
                        onClick={() => onApproveRemediation(inc.id)}
                        className="notch-btn-primary text-xs px-4 py-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authorize Remediation</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteRecovery(inc.id)}
                        className="notch-btn-primary text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Canary & Resolve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Pipeline Stages */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Stage 1 */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">1. Triage</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">Telemetry Correlated</p>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">2. Safety Gate</span>
                      {isApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isApproved ? 'Human Approved' : 'Awaiting Authorization'}
                    </p>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">3. Canary Rollout</span>
                      {isApproved ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[var(--border-subtle)]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isApproved ? '50% Traffic Routing' : 'Queued'}
                    </p>
                  </div>

                  {/* Stage 4 */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--text-primary)]">4. SLA Attestation</span>
                      <span className="w-2 h-2 rounded-full bg-[var(--border-subtle)]" />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">Latency Probe P99</p>
                  </div>
                </div>

                <div className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--tag-bg)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  Remediation Runbook: {inc.remediation.strategy}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
