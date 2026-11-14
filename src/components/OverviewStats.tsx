import React from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Incident, ServiceHealth } from '../types';

interface OverviewStatsProps {
  services: ServiceHealth[];
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onSimulateScenario: (scenarioId?: string) => void;
  onOpenVoiceAssistant: () => void;
  onNavigateTab: (tab: 'services' | 'incidents' | 'investigation') => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  services,
  incidents,
  onSelectIncident,
  onSimulateScenario,
  onOpenVoiceAssistant,
  onNavigateTab,
}) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL');
  const primaryIncident = activeIncidents[0] || null;

  const totalServices = services.length;
  const healthyServices = services.filter((s) => s.status === 'HEALTHY').length;
  const isAllHealthy = activeIncidents.length === 0;

  // Average cluster uptime
  const avgUptime = (
    services.reduce((acc, curr) => acc + curr.uptime, 0) / (totalServices || 1)
  ).toFixed(2);

  return (
    <div className="space-y-12 sm:space-y-16 max-w-4xl mx-auto">
      {/* 1. HERO SECTION - NOTCH MINIMALIST CENTERING */}
      <section className="text-center space-y-5 pt-8 sm:pt-12">
        {/* Status Indicator Pill */}
        <div className="inline-flex items-center">
          {primaryIncident ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-rose-500/10 border border-rose-500/25 text-rose-500 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>
                Active Incident: {primaryIncident.id} · {primaryIncident.affectedServiceName}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All 12 Microservices Nominal · {avgUptime}% Cluster SLA</span>
            </div>
          )}
        </div>

        {/* Confident Notch Typography */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--text-primary)] max-w-2xl mx-auto leading-[1.08]">
          Your systems.
          <br />
          <span className="text-[var(--text-muted)]">Under control.</span>
        </h1>

        {/* Short, Understated Subtitle */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
          Autonomous SRE copilot powered by TARSIER AI. Ingests distributed telemetry, synthesizes root cause hypotheses with Ollama, and executes verified runbooks.
        </p>

        {/* Primary Action Button Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryIncident ? (
            <button
              onClick={() => onSelectIncident(primaryIncident)}
              className="notch-btn-primary px-6 py-2.5 text-xs sm:text-sm font-medium shadow-md"
            >
              <Brain className="w-4 h-4" />
              <span>Investigate Incident</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => onSimulateScenario('payment-failure')}
              className="notch-btn-primary px-6 py-2.5 text-xs sm:text-sm font-medium shadow-md"
            >
              <Zap className="w-4 h-4 text-rose-500" />
              <span>Simulate Chaos Incident</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}

          <button
            onClick={onOpenVoiceAssistant}
            className="notch-btn-ghost px-5 py-2.5 text-xs sm:text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>TARSIER Voice (⌘K)</span>
          </button>
        </div>
      </section>

      {/* 2. COMPACT SYSTEM HEALTH SUMMARY - 3 MINIMAL PILLARS */}
      <section className="notch-card p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
          
          {/* Pillar 1: Cluster Health */}
          <div className="space-y-1.5 sm:px-4 first:pl-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Cluster Status
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                {healthyServices} / {totalServices}
              </span>
              <span className="text-xs text-[var(--text-muted)]">Services Online</span>
            </div>
            {/* 12 microservice visual status dots */}
            <div className="flex items-center gap-1.5 pt-1.5">
              {services.map((s) => (
                <span
                  key={s.id}
                  title={`${s.name} (${s.status})`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s.status === 'CRITICAL'
                      ? 'bg-rose-500 animate-ping'
                      : s.status === 'DEGRADED'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pillar 2: MTTR Benchmark */}
          <div className="space-y-1.5 sm:px-4 pt-4 sm:pt-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Autonomous MTTR
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums">
                6.4 min
              </span>
              <span className="text-xs text-emerald-500 font-medium">82% faster</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Ollama qwen2.5:7b multi-agent hypothesis isolation
            </p>
          </div>

          {/* Pillar 3: Human Safety Gate */}
          <div className="space-y-1.5 sm:px-4 pt-4 sm:pt-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Remediation Gate
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-semibold tracking-tight text-indigo-400 tabular-nums">
                Guarded
              </span>
              <span className="text-xs text-[var(--text-muted)]">Zero Auto-Destruct</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              Mandatory on-call cryptographic authorization
            </p>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE INCIDENT SPOTLIGHT (OR CALM STATE) */}
      {primaryIncident ? (
        <section className="notch-card p-6 border-rose-500/30 bg-rose-500/[0.02] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/25">
                  {primaryIncident.severity}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {primaryIncident.id}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {primaryIncident.title}
              </h3>
            </div>

            <button
              onClick={() => onSelectIncident(primaryIncident)}
              className="notch-btn-primary text-xs px-3.5 py-1.5 shrink-0"
            >
              Analyze & Remediate &rarr;
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                Root Cause Hypothesis (AI Confidence: {primaryIncident.rootCause.aiConfidence}%)
              </span>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Target: {primaryIncident.affectedServiceName}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {primaryIncident.rootCause.summary}
            </p>
          </div>
        </section>
      ) : (
        <section className="notch-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-left">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                All production telemetry is stable
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                Continuous log normalizer and TARSIER anomaly watchers active across all 12 services.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSimulateScenario('payment-failure')}
            className="notch-btn-ghost text-xs px-3.5 py-1.5 shrink-0"
          >
            Simulate Chaos Scenario &rarr;
          </button>
        </section>
      )}

      {/* 4. MINIMAL SERVICE OVERVIEW (COMPACT HEALTH CAPSULES) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Microservices At A Glance
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Core platform cluster topology.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Detailed Metrics &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => onNavigateTab('services')}
              className="notch-card p-3 text-left hover:border-[var(--border-medium)] transition-all flex flex-col justify-between space-y-2 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors truncate">
                  {svc.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    svc.status === 'CRITICAL'
                      ? 'bg-rose-500 animate-pulse'
                      : svc.status === 'DEGRADED'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                <span className="capitalize text-[10px]">{svc.category}</span>
                <span
                  className={
                    svc.latency > 1000
                      ? 'text-rose-500 font-semibold'
                      : svc.latency > 250
                      ? 'text-amber-500 font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }
                >
                  {svc.latency}ms
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
