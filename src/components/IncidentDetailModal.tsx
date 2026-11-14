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
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#121522]/95 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Top Header */}
        <div className="p-5 border-b border-white/[0.08] bg-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase rounded-full border ${getSeverityStyle(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="font-mono text-[10px] text-rose-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.08]">
                {incident.id}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Service: <strong className="text-white font-medium">{incident.affectedServiceName}</strong> ({incident.affectedServiceId})
              </span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight line-clamp-1">{incident.title}</h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1 rounded-full bg-white/[0.04] text-xs text-slate-300 font-mono border border-white/[0.08]">
              Status: <span className="font-medium text-rose-400">{incident.status}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Apple Segmented Tab Switcher */}
        <div className="p-2 border-b border-white/[0.06] bg-black/20 overflow-x-auto">
          <div className="flex space-x-1 p-1 bg-black/40 rounded-xl border border-white/[0.04] w-fit">
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
                  className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                        tab.badge === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : tab.badge === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.08] text-slate-300'
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
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 via-black/40 to-black/40 border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-indigo-300 font-mono">
                      Causal Synthesis Hypothesis
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white text-xs font-mono border border-white/[0.08]">
                    <span>AI Confidence:</span>
                    <strong className="text-emerald-400 font-semibold">{incident.rootCause.aiConfidence}%</strong>
                  </div>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed">
                  {incident.rootCause.summary}
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Engine: <span className="text-indigo-300">{incident.rootCause.modelEngine}</span>
                </div>
              </div>

              {/* Primary Trigger & Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Primary Trigger Event
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {incident.rootCause.primaryTrigger}
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Blast Radius & Impact
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {incident.rootCause.estimatedUserImpact}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/[0.06]">
                    {incident.rootCause.blastRadiusServices.map((svc, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Causal Chain */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Correlated Causal Chain
                </h4>
                <div className="space-y-2">
                  {incident.rootCause.causalChain.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start space-x-3 p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-mono font-medium text-slate-300 shrink-0 text-[10px]">
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <span className="font-medium text-rose-300 text-xs">{step.service}</span>
                        <p className="text-slate-300 leading-relaxed">{step.observation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Contributing Factors & Latent Hazards
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside leading-relaxed">
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
                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 font-sans">P99 Latency Spike</span>
                  <div className="text-xl font-semibold font-mono text-rose-400 mt-1 tabular-nums">
                    {Math.max(...incident.metrics.map((m) => m.latencyMs))}ms
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono">+4,200% Anomaly</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 font-sans">Peak Error Rate</span>
                  <div className="text-xl font-semibold font-mono text-rose-400 mt-1 tabular-nums">
                    {Math.max(...incident.metrics.map((m) => m.errorRatePercent))}%
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono">HTTP 504 Timeouts</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 font-sans">Throughput Pressure</span>
                  <div className="text-xl font-semibold font-mono text-amber-400 mt-1 tabular-nums">
                    1,850 req/s
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Concurrency Surge</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
                  <span className="text-[11px] text-slate-400 font-sans">CPU Saturation</span>
                  <div className="text-xl font-semibold font-mono text-rose-400 mt-1 tabular-nums">
                    96%
                  </div>
                  <span className="text-[10px] text-rose-400 font-mono">Worker Throttling</span>
                </div>
              </div>

              {/* Time Series Table */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 overflow-hidden">
                <div className="p-3 border-b border-white/[0.06] text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Prometheus Telemetry Timeline
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/40 text-slate-400 text-[10px] uppercase border-b border-white/[0.04]">
                      <tr>
                        <th className="py-2.5 px-4">Time Bucket</th>
                        <th className="py-2.5 px-4">Latency P99</th>
                        <th className="py-2.5 px-4">Error Rate</th>
                        <th className="py-2.5 px-4">Req / Sec</th>
                        <th className="py-2.5 px-4">CPU %</th>
                        <th className="py-2.5 px-4">Anomaly State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {incident.metrics.map((m, idx) => (
                        <tr key={idx} className={m.latencyMs > 300 ? 'bg-rose-500/[0.04]' : ''}>
                          <td className="py-2.5 px-4 text-slate-300">{m.time}</td>
                          <td className={`py-2.5 px-4 font-semibold ${m.latencyMs > 500 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {m.latencyMs}ms
                          </td>
                          <td className={`py-2.5 px-4 ${m.errorRatePercent > 1 ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                            {m.errorRatePercent}%
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{m.requestsPerSec}</td>
                          <td className="py-2.5 px-4 text-slate-300">{m.cpuPercent}%</td>
                          <td className="py-2.5 px-4">
                            {m.latencyMs > 500 ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                ANOMALY BREACH
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-400">Normal</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 p-2.5 rounded-2xl border border-white/[0.06]">
                <div className="flex gap-1">
                  {['ALL', 'ERROR', 'FATAL', 'WARN', 'INFO'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        logFilter === lvl
                          ? 'bg-white/[0.12] text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
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
                  className="bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/[0.2] w-full sm:w-64 font-sans"
                />
              </div>

              {/* Terminal Log Console */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/95 p-4 font-mono text-xs overflow-x-auto max-h-[420px] space-y-2">
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
                      <span className="text-slate-400 text-[10px] shrink-0 font-mono">{log.timestamp}</span>
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
                        <span className="text-[9px] text-slate-400 shrink-0 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
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
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {incident.remediation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08] font-mono">
                      Risk Level: {incident.remediation.riskLevel}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                      Automation: Eligible
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {incident.remediation.strategy}
                </p>
              </div>

              {/* Command Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="font-medium text-slate-300 text-[11px]">
                    Non-Destructive Remediation Runbook Script:
                  </span>
                  <button
                    onClick={() => handleCopy(incident.remediation.commandSnippet)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs transition-all cursor-pointer border border-white/[0.08]"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-black/90 border border-white/[0.08] text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {incident.remediation.commandSnippet}
                </pre>
              </div>

              {/* Rollback Safety Plan */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono font-medium text-amber-400 uppercase tracking-wider">
                  Automated Rollback Guardrail
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {incident.remediation.rollbackPlan}
                </p>
              </div>

              {/* Safety Checklist */}
              <div className="space-y-2.5 p-4.5 rounded-2xl bg-black/30 border border-white/[0.06]">
                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Pre-flight Safety Verification Checklist
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {incident.remediation.safetyChecklist.map((chk, i) => (
                    <div key={i} className="flex items-center space-x-2 text-slate-300 bg-white/[0.02] p-2 rounded-xl border border-white/[0.06]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{chk.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Approval Gate (Human-In-The-Loop) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#181b28] to-[#12141e] border border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Human-in-the-loop Safety Gate
                  </div>
                  <p className="text-xs text-slate-400">
                    {incident.remediation.approvalStatus === 'APPROVED' ? (
                      <span className="text-emerald-400 font-medium">
                        Authorized by {incident.remediation.approvedBy} at {incident.remediation.approvedAt}
                      </span>
                    ) : (
                      'Remediation requires manual on-call verification prior to execution on production clusters.'
                    )}
                  </p>
                </div>

                <div>
                  {incident.remediation.approvalStatus === 'APPROVED' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>REMEDIATION AUTHORIZED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onApproveRemediation(incident.id)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
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
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Recovery Phase: <strong className="text-rose-400">{incident.recovery.phase}</strong>
                  </span>
                  <span className="text-sm font-mono font-medium text-emerald-400 tabular-nums">
                    {incident.recovery.progressPercent}% Completed
                  </span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      incident.recovery.progressPercent === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500'
                    }`}
                    style={{ width: `${incident.recovery.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Sequence */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Automated Canary & Pipeline Steps
                </h4>
                <div className="space-y-2">
                  {incident.recovery.steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {st.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : st.status === 'in-progress' ? (
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0"></div>
                        )}
                        <div>
                          <div className="font-medium text-white">{st.name}</div>
                          <div className="text-[11px] text-slate-400">{st.details}</div>
                        </div>
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase ${
                        st.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        st.status === 'in-progress' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse' :
                        'bg-white/[0.04] text-slate-400'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Stabilization Checklist */}
              <div className="p-4.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-3">
                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Telemetry Stabilization Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">P99 Latency &lt; 50ms</span>
                    <span className={incident.recovery.postVerification.latencyNormal ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                      {incident.recovery.postVerification.latencyNormal ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">Error Rate &lt; 0.1%</span>
                    <span className={incident.recovery.postVerification.errorRateUnderThreshold ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                      {incident.recovery.postVerification.errorRateUnderThreshold ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-slate-400">Canary Traffic Passed</span>
                    <span className={incident.recovery.postVerification.canaryTrafficHealthy ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                      {incident.recovery.postVerification.canaryTrafficHealthy ? 'VERIFIED' : 'WAITING'}
                    </span>
                  </div>
                </div>

                {incident.status !== 'RESOLVED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onCompleteRecovery(incident.id)}
                      className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
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
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Detected: {incident.detectedAt}</span>
            {incident.resolvedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Resolved: {incident.resolvedAt}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium transition-all cursor-pointer border border-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
