import React from 'react';
import {
  Brain,
  Sparkles,
  GitBranch,
  Layers,
  Network,
  Cpu,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Workflow,
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
    <div className="space-y-6">
      {/* Top Banner - Apple Neural Engine Aesthetic */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/30 via-[#131622]/90 to-[#131622]/90 border border-white/[0.08] backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Autonomous Root Cause Analysis & Reasoning
              </h2>
              <span className="text-[11px] font-mono text-indigo-300">
                Multi-Agent Telemetry Ingestion & Causal Synthesis
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Correlates distributed trace spans, parses mixed-format logs, filters adversarial prompt-injection payloads, and synthesizes root-cause hypotheses with verified runbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Reasoning Engine</div>
            <div className="text-xs font-semibold text-indigo-300">Ollama qwen2.5:7b (Local)</div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Diagnosis SLA</div>
            <div className="text-xs font-semibold text-emerald-400">96.8% Confidence</div>
          </div>
        </div>
      </div>

      {/* Multi-Agent Diagnostic Swarm State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Diagnostic Swarm Pipeline
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">3 Autonomous Agents Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4.5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2.5 hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                1. Telemetry Ingestion Agent
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Scans Prometheus metrics and OpenTelemetry trace spans across all 12 services every 1.5 seconds.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span>Telemetry Ingress</span>
              <span className="text-amber-400">P99 Spike (+4,200%)</span>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2.5 hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                2. Causal Tree Synthesizer
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Builds directed causal graphs of dependency propagation to isolate patient zero from downstream cascades.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span>Topology Depth</span>
              <span className="text-indigo-400">4 Dependency Hops</span>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2.5 hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                3. Safety Verification Agent
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Validates non-destructive remediation procedures and submits proposals directly to the Human Safety Gate.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span>Guardrail Invariant</span>
              <span className="text-emerald-400">4/4 Checks Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Causal Topology Card */}
      {activeIncident && (
        <div className="rounded-3xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {activeIncident.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">Cascading Failure Topology</span>
              </div>
              <h4 className="text-base font-semibold text-white">{activeIncident.title}</h4>
            </div>

            <button
              onClick={() => onSelectIncident(activeIncident)}
              className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/[0.1] transition-all cursor-pointer shadow-xs"
            >
              Open Full RCA Workspace &rarr;
            </button>
          </div>

          {/* Causal Chain Nodes */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Root-Cause Propagation Path
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
              {activeIncident.rootCause.causalChain.map((node, i) => (
                <React.Fragment key={node.step}>
                  <div className="p-3.5 rounded-xl bg-[#161a28] border border-white/[0.08] w-full md:w-56 shrink-0 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-rose-300 font-medium">
                        Node {node.step}
                      </span>
                      <span className="text-[11px] font-medium text-slate-300">
                        {node.service}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{node.observation}</p>
                  </div>
                  {i < activeIncident.rootCause.causalChain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 transform md:rotate-0 rotate-90" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Blast Radius & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2.5">
              <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                Impacted Downstream Dependencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeIncident.rootCause.blastRadiusServices.map((svc, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-500/10 border border-rose-500/20 text-rose-300"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2.5">
              <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                Investigation Timeline
              </span>
              <div className="space-y-2 font-mono text-xs">
                {activeIncident.rootCause.investigationTimeline.map((item, i) => (
                  <div key={i} className="flex items-center space-x-2.5 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-300 text-[11px]">{item.time}:</span>
                    <span className="text-slate-400 text-[11px] truncate">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
