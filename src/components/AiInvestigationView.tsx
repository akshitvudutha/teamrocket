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
  CheckCircle,
  Clock,
  ArrowRight,
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
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Autonomous AI Investigation & Root Cause Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Team Rocket Multi-Agent Reasoning Architecture: Telemetry ingestion, distributed trace correlation, causal tree synthesis, and verified runbook generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Reasoning Model</div>
            <div className="text-xs font-bold text-purple-300">Gemini 2.5 Flash + SRE Reasoning</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Diagnosis Accuracy</div>
            <div className="text-xs font-bold text-emerald-400">96.8% Confidence</div>
          </div>
        </div>
      </div>

      {/* Multi-Agent Orchestration Pipeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Agent Diagnostic Swarm State
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                1. Telemetry Ingestion Agent
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Scans Prometheus metrics and OpenTelemetry trace spans across all 12 services every 1.5 seconds.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
              Last Anomaly: Latency Spike (+4,200%)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                2. Causal Graph Synthesizer
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Builds directed causal graphs of dependency propagation to isolate patient zero from downstream cascades.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
              Causal Depth: 4 hops isolated
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                3. Safety Guardrail & Runbook Agent
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthesizes non-destructive kubectl/redis remediation scripts and submits them to the human approval gate.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
              Safety Verification: 4/4 Checks Passed
            </div>
          </div>
        </div>
      </div>

      {/* Active Causal Graph Card */}
      {activeIncident && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">
                Correlated Incident: {activeIncident.id}
              </span>
              <h4 className="text-base font-bold text-slate-100">{activeIncident.title}</h4>
            </div>
            <button
              onClick={() => onSelectIncident(activeIncident)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950 transition cursor-pointer"
            >
              Open Full RCA Panel
            </button>
          </div>

          {/* Causal Chain Nodes */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              Cascading Failure Topology
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
              {activeIncident.rootCause.causalChain.map((node, i) => (
                <React.Fragment key={node.step}>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 w-full md:w-56 shrink-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-rose-400 font-bold">
                        Step {node.step}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {node.service}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{node.observation}</p>
                  </div>
                  {i < activeIncident.rootCause.causalChain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 transform md:rotate-0 rotate-90" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Blast Radius Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Impacted Downstream Dependencies
              </span>
              <div className="flex flex-wrap gap-2">
                {activeIncident.rootCause.blastRadiusServices.map((svc, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-950/40 border border-rose-800/40 text-rose-300"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Investigation Timeline
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {activeIncident.rootCause.investigationTimeline.map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{item.time}:</span>
                    <span className="text-slate-400">{item.note}</span>
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
