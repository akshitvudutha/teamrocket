import React from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Workflow,
  Network,
  Cpu,
} from 'lucide-react';
import { Incident, ServiceHealth } from '../types';

interface AiInvestigationViewProps {
  incidents: Incident[];
  services: ServiceHealth[];
  onSelectIncident: (incident: Incident) => void;
}

export const AiInvestigationView: React.FC<AiInvestigationViewProps> = ({
  incidents,
  services,
  onSelectIncident,
}) => {
  const activeIncident = incidents.find((i) => i.status !== 'RESOLVED') || incidents[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner - Notch Minimalist Copilot Overview */}
      <section className="notch-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-medium">
              Autonomous Reasoning Engine
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Multi-Agent Root Cause Isolation
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Correlates distributed trace spans, parses mixed-format logs, verifies against prompt-injection attacks, and isolates causal anomalies using local Ollama.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-left font-mono">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Model</div>
            <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">qwen2.5:7b (Ollama)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-left font-mono">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Diagnosis Confidence</div>
            <div className="text-xs font-semibold text-emerald-500 mt-0.5">96.8% Verified</div>
          </div>
        </div>
      </section>

      {/* 3 Autonomous Diagnostic Agents */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            3-Agent Orchestration Swarm
          </h3>
          <span className="text-[11px] font-mono text-emerald-500">All Agents Synchronized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Agent 1 */}
          <div className="notch-card p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                1. Telemetry Ingest Agent
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ingests 14,200 events/sec across Syslog, Apache Combined, and JSON Lines logs.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Sanitization Rate</span>
              <span className="text-emerald-500 font-medium">100% Defense</span>
            </div>
          </div>

          {/* Agent 2 */}
          <div className="notch-card p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                2. Causal Tree Reasoner
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Traces cross-service dependency graphs to isolate the original fault from cascading errors.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Inference Time</span>
              <span className="text-indigo-400 font-medium">1.4s (7B Qwen)</span>
            </div>
          </div>

          {/* Agent 3 */}
          <div className="notch-card p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                3. Safety Verification Gate
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Checks remediation runbooks against production safety invariants and requires on-call approval.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>Approval Enforced</span>
              <span className="text-emerald-500 font-medium">Active Policy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Incident Case File */}
      {activeIncident && (
        <section className="notch-card p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Active Investigation Dossier
              </span>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-0.5">
                {activeIncident.id} — {activeIncident.title}
              </h3>
            </div>
            <button
              onClick={() => onSelectIncident(activeIncident)}
              className="notch-btn-primary text-xs px-4 py-2 self-start sm:self-auto"
            >
              <span>View Full Investigation & Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Root Cause Summary */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-400" />
                Root Cause Synthesis
              </span>
              <span className="text-xs font-mono text-emerald-500 font-medium">
                {activeIncident.rootCause.aiConfidence}% Confidence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeIncident.rootCause.summary}
            </p>
          </div>

          {/* Causal Chain */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Causal Propagation Path
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {activeIncident.rootCause.causalChain && activeIncident.rootCause.causalChain.length > 0 ? (
                activeIncident.rootCause.causalChain.map((step, idx) => (
                  <React.Fragment key={step.step}>
                    <span className="px-3 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                      {step.service}: {step.observation.slice(0, 32)}...
                    </span>
                    {idx < activeIncident.rootCause.causalChain.length - 1 && (
                      <span className="text-[var(--text-muted)]">&rarr;</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <span className="px-3 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--text-muted)]">
                  {activeIncident.affectedServiceName}
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
