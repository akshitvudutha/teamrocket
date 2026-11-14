import React, { useState, useEffect } from 'react';
import {
  X,
  Brain,
  Activity,
  Terminal,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Incident, Severity } from '../types';

interface IncidentDetailModalProps {
  incident: Incident | null;
  initialTab?: 'rca' | 'metrics' | 'logs' | 'remediation' | 'recovery';
  onClose: () => void;
  onApproveRemediation: (incidentId: string) => void;
  onCompleteRecovery: (incidentId: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  initialTab,
  onClose,
  onApproveRemediation,
  onCompleteRecovery,
}) => {
  const [activeTab, setActiveTab] = useState<'rca' | 'metrics' | 'logs' | 'remediation' | 'recovery'>(
    initialTab || 'rca'
  );
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!incident) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const filteredLogs = incident.logs.filter((log) => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.service.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'LOW':
        return 'bg-[var(--tag-bg)] text-[var(--text-muted)] border-[var(--border-subtle)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col notch-card shadow-2xl overflow-hidden border border-[var(--border-medium)]">
        {/* Top Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase rounded-full border ${getSeverityStyle(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="font-mono text-[10px] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                {incident.id}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">
                Service: <strong className="text-[var(--text-primary)] font-medium">{incident.affectedServiceName}</strong>
              </span>
            </div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight line-clamp-1">{incident.title}</h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1 rounded-full bg-[var(--tag-bg)] text-xs text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
              Status: <span className="font-medium text-rose-500">{incident.status}</span>
            </div>
            <button
              onClick={onClose}
              className="notch-btn-ghost p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto">
          <div className="flex space-x-1 p-1 bg-[var(--tag-bg)] rounded-xl border border-[var(--border-subtle)] w-fit">
            {[
              { id: 'rca', label: 'Root Cause (RCA)', icon: Brain },
              { id: 'metrics', label: 'Telemetry & Spikes', icon: Activity },
              { id: 'logs', label: 'Diagnostic Logs', icon: Terminal, badge: incident.logs.length },
              { id: 'remediation', label: 'Remediation & Gate', icon: ShieldCheck, badge: incident.remediation.approvalStatus },
              { id: 'recovery', label: 'Canary Recovery', icon: RefreshCw, badge: `${incident.recovery.progressPercent}%` },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                        tab.badge === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : tab.badge === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          : 'bg-[var(--tag-bg)] text-[var(--text-muted)]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI ROOT-CAUSE ANALYSIS */}
          {activeTab === 'rca' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Reasoning Summary Banner */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-indigo-400 font-mono">
                      Causal Synthesis Hypothesis
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-xs font-mono border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">AI Confidence:</span>
                    <strong className="text-emerald-500 font-semibold">{incident.rootCause.aiConfidence}%</strong>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                  {incident.rootCause.summary}
                </p>
                <div className="text-[11px] text-[var(--text-muted)] font-mono">
                  Engine: <span className="text-indigo-400">{incident.rootCause.modelEngine}</span>
                </div>
              </div>

              {/* Primary Trigger & Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-medium text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Primary Trigger Event
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {incident.rootCause.primaryTrigger}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-medium text-amber-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Blast Radius & Impact
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {incident.rootCause.estimatedUserImpact}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    {incident.rootCause.blastRadiusServices.map((svc, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--tag-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Causal Chain */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Correlated Causal Chain
                </h4>
                <div className="space-y-2">
                  {incident.rootCause.causalChain.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start space-x-3 p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-[var(--tag-bg)] border border-[var(--border-medium)] flex items-center justify-center font-mono font-medium text-[var(--text-primary)] shrink-0 text-[10px]">
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <span className="font-medium text-rose-500 text-xs">{step.service}</span>
                        <p className="text-[var(--text-secondary)] leading-relaxed">{step.observation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                  Contributing Factors & Latent Hazards
                </h4>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside leading-relaxed">
                  {incident.rootCause.contributingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">P99 Latency Spike</span>
                  <div className="text-xl font-semibold font-mono text-rose-500 mt-1 tabular-nums">
                    {Math.max(...incident.metrics.map((m) => m.latencyMs))}ms
                  </div>
                  <span className="text-[10px] text-rose-500 font-mono">+4,200% Anomaly</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Peak Error Rate</span>
                  <div className="text-xl font-semibold font-mono text-rose-500 mt-1 tabular-nums">
                    {Math.max(...incident.metrics.map((m) => m.errorRatePercent))}%
                  </div>
                  <span className="text-[10px] text-rose-500 font-mono">HTTP 504 Timeouts</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">Throughput Pressure</span>
                  <div className="text-xl font-semibold font-mono text-amber-500 mt-1 tabular-nums">
                    1,850 req/s
                  </div>
                  <span className="text-[10px] text-amber-500 font-mono">Concurrency Surge</span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">CPU Saturation</span>
                  <div className="text-xl font-semibold font-mono text-rose-500 mt-1 tabular-nums">
                    96%
                  </div>
                  <span className="text-[10px] text-rose-500 font-mono">Worker Throttling</span>
                </div>
              </div>

              {/* Time Series Table */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] overflow-hidden">
                <div className="p-3 border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                  Prometheus Telemetry Timeline
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[var(--tag-bg)] text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border-subtle)]">
                      <tr>
                        <th className="py-2.5 px-4">Time Bucket</th>
                        <th className="py-2.5 px-4">Latency P99</th>
                        <th className="py-2.5 px-4">Error Rate</th>
                        <th className="py-2.5 px-4">Req / Sec</th>
                        <th className="py-2.5 px-4">CPU %</th>
                        <th className="py-2.5 px-4">Anomaly State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {incident.metrics.map((m, idx) => (
                        <tr key={idx} className={m.latencyMs > 300 ? 'bg-rose-500/[0.04]' : ''}>
                          <td className="py-2.5 px-4 text-[var(--text-secondary)]">{m.time}</td>
                          <td className={`py-2.5 px-4 font-semibold ${m.latencyMs > 500 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                            {m.latencyMs}ms
                          </td>
                          <td className={`py-2.5 px-4 ${m.errorRatePercent > 1 ? 'text-rose-500 font-semibold' : 'text-[var(--text-muted)]'}`}>
                            {m.errorRatePercent}%
                          </td>
                          <td className="py-2.5 px-4 text-[var(--text-secondary)]">{m.requestsPerSec}</td>
                          <td className="py-2.5 px-4 text-[var(--text-secondary)]">{m.cpuPercent}%</td>
                          <td className="py-2.5 px-4">
                            {m.latencyMs > 500 ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                ANOMALY BREACH
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-500">Normal</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTIC LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface-elevated)] p-2.5 rounded-2xl border border-[var(--border-subtle)]">
                <div className="flex gap-1">
                  {['ALL', 'ERROR', 'FATAL', 'WARN', 'INFO'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        logFilter === lvl
                          ? 'bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Filter log stream..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-medium)] w-full sm:w-64 font-sans"
                />
              </div>

              {/* Terminal Log Console */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#07080a] p-4 font-mono text-xs overflow-x-auto max-h-[420px] space-y-2 text-white">
                <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2">LOG STREAM // {incident.id}</span>
                  </div>
                  <span>{filteredLogs.length} events</span>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="text-slate-400 py-8 text-center font-sans text-xs">No logs matching filter criteria.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg hover:bg-white/[0.04] transition flex flex-col sm:flex-row sm:items-start gap-2 leading-relaxed"
                    >
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">{log.timestamp}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium uppercase shrink-0 ${
                          log.level === 'FATAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.level === 'ERROR'
                            ? 'bg-rose-500/15 text-rose-400'
                            : log.level === 'WARN'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-white/[0.06] text-slate-300'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-indigo-300 font-medium text-[11px] shrink-0">
                        [{log.service}]
                      </span>
                      <span className="text-slate-200 flex-1 font-mono text-[11px]">{log.message}</span>
                      {log.traceId && (
                        <span className="text-[9px] text-slate-500 shrink-0 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                          {log.traceId}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDED REMEDIATION & SAFETY APPROVAL */}
          {activeTab === 'remediation' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {incident.remediation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono">
                      Risk Level: {incident.remediation.riskLevel}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono">
                      Automation: Eligible
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {incident.remediation.strategy}
                </p>
              </div>

              {/* Command Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                  <span className="font-medium text-[var(--text-secondary)] text-[11px]">
                    Non-Destructive Remediation Runbook Script:
                  </span>
                  <button
                    onClick={() => handleCopy(incident.remediation.commandSnippet)}
                    className="notch-btn-ghost px-2.5 py-1 text-xs"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-[var(--text-muted)]" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-[#07080a] border border-[var(--border-subtle)] text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {incident.remediation.commandSnippet}
                </pre>
              </div>

              {/* Rollback Safety Plan */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] font-mono font-medium text-amber-500 uppercase tracking-wider">
                  Automated Rollback Guardrail
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {incident.remediation.rollbackPlan}
                </p>
              </div>

              {/* Safety Checklist */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Pre-flight Safety Verification Checklist
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {incident.remediation.safetyChecklist.map((chk, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[var(--text-secondary)] bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{chk.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Approval Gate (Human-In-The-Loop) */}
              <div className="p-5 rounded-2xl notch-card border-[var(--border-medium)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Human-in-the-loop Safety Gate
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {incident.remediation.approvalStatus === 'APPROVED' ? (
                      <span className="text-emerald-500 font-medium">
                        Authorized by {incident.remediation.approvedBy} at {incident.remediation.approvedAt}
                      </span>
                    ) : (
                      'Remediation requires manual on-call verification prior to execution on production clusters.'
                    )}
                  </p>
                </div>

                <div>
                  {incident.remediation.approvalStatus === 'APPROVED' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>REMEDIATION AUTHORIZED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onApproveRemediation(incident.id)}
                      className="notch-btn-primary px-4 py-2 text-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize & Execute Fix</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RECOVERY PIPELINE & STATUS */}
          {activeTab === 'recovery' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                    Recovery Phase: <strong className="text-rose-500">{incident.recovery.phase}</strong>
                  </span>
                  <span className="text-sm font-mono font-medium text-emerald-500 tabular-nums">
                    {incident.recovery.progressPercent}% Completed
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--tag-bg)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      incident.recovery.progressPercent === 100
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${incident.recovery.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Sequence */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                  Automated Canary & Pipeline Steps
                </h4>
                <div className="space-y-2">
                  {incident.recovery.steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {st.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : st.status === 'in-progress' ? (
                          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--border-medium)] shrink-0"></div>
                        )}
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{st.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{st.details}</div>
                        </div>
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase ${
                        st.status === 'completed' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' :
                        st.status === 'in-progress' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse' :
                        'bg-[var(--tag-bg)] text-[var(--text-muted)]'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Stabilization Checklist */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
                <span className="text-[10px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Telemetry Stabilization Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">P99 Latency &lt; 50ms</span>
                    <span className={incident.recovery.postVerification.latencyNormal ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
                      {incident.recovery.postVerification.latencyNormal ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Error Rate &lt; 0.1%</span>
                    <span className={incident.recovery.postVerification.errorRateUnderThreshold ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
                      {incident.recovery.postVerification.errorRateUnderThreshold ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Canary Traffic Passed</span>
                    <span className={incident.recovery.postVerification.canaryTrafficHealthy ? 'text-emerald-500 font-medium' : 'text-[var(--text-muted)]'}>
                      {incident.recovery.postVerification.canaryTrafficHealthy ? 'VERIFIED' : 'WAITING'}
                    </span>
                  </div>
                </div>

                {incident.status !== 'RESOLVED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onCompleteRecovery(incident.id)}
                      className="notch-btn-primary px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Close Incident as RESOLVED</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Detected: {incident.detectedAt}</span>
            {incident.resolvedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-500 font-medium">Resolved: {incident.resolvedAt}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="notch-btn-ghost px-4 py-1.5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
