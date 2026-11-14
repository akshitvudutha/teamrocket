import React, { useState } from 'react';
import {
  X,
  Brain,
  Activity,
  Terminal,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
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
  onClose: () => void;
  onApproveRemediation: (incidentId: string) => void;
  onCompleteRecovery: (incidentId: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onApproveRemediation,
  onCompleteRecovery,
}) => {
  const [activeTab, setActiveTab] = useState<'rca' | 'metrics' | 'logs' | 'remediation' | 'recovery'>('rca');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

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
        return 'bg-red-950 text-red-300 border-red-700';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'MEDIUM':
        return 'bg-yellow-950 text-yellow-300 border-yellow-700';
      case 'LOW':
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-black uppercase rounded-md border ${getSeverityStyle(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                {incident.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Affected: <strong className="text-slate-200">{incident.affectedServiceName}</strong> ({incident.affectedServiceId})
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 line-clamp-1">{incident.title}</h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1 rounded-xl bg-slate-800 text-xs text-slate-300 font-mono border border-slate-700">
              Status: <span className="font-semibold text-rose-400">{incident.status}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'rca', label: 'AI Root Cause Analysis', icon: Brain },
            { id: 'metrics', label: 'Telemetry & Metrics', icon: Activity },
            { id: 'logs', label: 'Diagnostic Logs', icon: Terminal, badge: incident.logs.length },
            { id: 'remediation', label: 'Remediation & Safety', icon: ShieldCheck, badge: incident.remediation.approvalStatus },
            { id: 'recovery', label: 'Recovery Status', icon: RefreshCw, badge: `${incident.recovery.progressPercent}%` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-rose-500 text-rose-400 bg-rose-950/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    tab.badge === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    tab.badge === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI ROOT-CAUSE ANALYSIS */}
          {activeTab === 'rca' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* AI Reasoning Summary Banner */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Autonomous Root Cause Synthesis
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 text-xs font-mono border border-purple-800">
                    <span>Confidence:</span>
                    <strong className="text-white">{incident.rootCause.aiConfidence}%</strong>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {incident.rootCause.summary}
                </p>
                <div className="text-xs text-slate-400 font-mono">
                  Engine: <span className="text-purple-300">{incident.rootCause.modelEngine}</span>
                </div>
              </div>

              {/* Primary Trigger & Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Primary Trigger
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {incident.rootCause.primaryTrigger}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Estimated Blast Radius & Impact
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {incident.rootCause.estimatedUserImpact}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800/80">
                    {incident.rootCause.blastRadiusServices.map((svc, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Causal Chain */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Correlated Causal Chain
                </h4>
                <div className="space-y-2.5">
                  {incident.rootCause.causalChain.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/90 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-slate-300 shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <span className="font-semibold text-rose-400">{step.service}</span>
                        <p className="text-slate-300">{step.observation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contributing Factors & Latent Hazards
                </h4>
                <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                  {incident.rootCause.contributingFactors.map((factor, i) => (
                    <li key={i} className="text-slate-300">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY & METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">P99 Latency Spike</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {Math.max(...incident.metrics.map(m => m.latencyMs))}ms
                  </div>
                  <span className="text-[10px] text-red-400">+4,200% above baseline</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Peak Error Rate</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {Math.max(...incident.metrics.map(m => m.errorRatePercent))}%
                  </div>
                  <span className="text-[10px] text-slate-400">5xx / Gateway Timeouts</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Throughput Pressure</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    1,850 req/s
                  </div>
                  <span className="text-[10px] text-slate-400">Flash Checkout Load</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400">CPU Saturation</span>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    96%
                  </div>
                  <span className="text-[10px] text-red-400">Pod Throttling Active</span>
                </div>
              </div>

              {/* Time Series Telemetry Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="p-3 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Prometheus Telemetry Timeline (Incident Window)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Time Bucket</th>
                        <th className="py-2.5 px-4">Latency (P99)</th>
                        <th className="py-2.5 px-4">Error Rate (%)</th>
                        <th className="py-2.5 px-4">Requests / Sec</th>
                        <th className="py-2.5 px-4">CPU %</th>
                        <th className="py-2.5 px-4">Anomaly State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {incident.metrics.map((m, idx) => (
                        <tr key={idx} className={m.latencyMs > 300 ? 'bg-red-950/15' : ''}>
                          <td className="py-2 px-4 text-slate-300">{m.time}</td>
                          <td className={`py-2 px-4 font-bold ${m.latencyMs > 500 ? 'text-red-400' : 'text-slate-300'}`}>
                            {m.latencyMs}ms
                          </td>
                          <td className={`py-2 px-4 ${m.errorRatePercent > 1 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            {m.errorRatePercent}%
                          </td>
                          <td className="py-2 px-4 text-slate-300">{m.requestsPerSec}</td>
                          <td className="py-2 px-4 text-slate-300">{m.cpuPercent}%</td>
                          <td className="py-2 px-4">
                            {m.latencyMs > 500 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                                ANOMALY BREACH
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400">Normal</span>
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
              {/* Log filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex gap-1.5">
                  {['ALL', 'ERROR', 'FATAL', 'WARN', 'INFO'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        logFilter === lvl
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
                  className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full sm:w-64"
                />
              </div>

              {/* Terminal Log Console */}
              <div className="rounded-xl border border-slate-800 bg-black/90 p-4 font-mono text-xs overflow-x-auto max-h-[420px] space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800">
                  <span>LOG CONSOLE STREAM // CORRELATION ID: {incident.id}</span>
                  <span>{filteredLogs.length} events</span>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="text-slate-500 py-6 text-center">No logs matching filter.</div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded hover:bg-slate-900/60 transition flex flex-col sm:flex-row sm:items-start gap-2 leading-relaxed"
                    >
                      <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                          log.level === 'FATAL'
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : log.level === 'ERROR'
                            ? 'bg-red-950/80 text-red-400'
                            : log.level === 'WARN'
                            ? 'bg-amber-950/80 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-rose-400 font-semibold text-[11px] shrink-0">
                        [{log.service}]
                      </span>
                      <span className="text-slate-200 flex-1">{log.message}</span>
                      {log.traceId && (
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
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
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Proposal Header */}
              <div className="p-4.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {incident.remediation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      Risk Level: {incident.remediation.riskLevel}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                      Automation: Eligible
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {incident.remediation.strategy}
                </p>
              </div>

              {/* Command Snippet / Runbook Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-semibold text-slate-300">
                    Autonomous Remediation Shell / Manifest Script:
                  </span>
                  <button
                    onClick={() => handleCopy(incident.remediation.commandSnippet)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-black/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {incident.remediation.commandSnippet}
                </pre>
              </div>

              {/* Rollback Safety Plan */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Automated Rollback Guardrail
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {incident.remediation.rollbackPlan}
                </p>
              </div>

              {/* Human-in-the-loop Safety Checklist */}
              <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pre-flight Safety Verification Checklist
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {incident.remediation.safetyChecklist.map((chk, i) => (
                    <div key={i} className="flex items-center space-x-2 text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{chk.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Approval Gate (Human-In-The-Loop) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Human-in-the-loop Safety Gate
                  </div>
                  <p className="text-xs text-slate-400">
                    {incident.remediation.approvalStatus === 'APPROVED' ? (
                      <span className="text-emerald-400 font-semibold">
                        Authorized by {incident.remediation.approvedBy} at {incident.remediation.approvedAt}
                      </span>
                    ) : (
                      'Remediation requires on-call SRE authorization prior to mutating cluster resources.'
                    )}
                  </p>
                </div>

                <div>
                  {incident.remediation.approvalStatus === 'APPROVED' ? (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold font-mono">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>REMEDIATION AUTHORIZED</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onApproveRemediation(incident.id)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Execute Fix</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RECOVERY PIPELINE & STATUS */}
          {activeTab === 'recovery' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Progress Bar & Phase Header */}
              <div className="p-4.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Recovery Pipeline Phase: <strong className="text-rose-400">{incident.recovery.phase}</strong>
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-100">
                    {incident.recovery.progressPercent}% Completed
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
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
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Automated Orchestration Pipeline Steps
                </h4>
                <div className="space-y-2">
                  {incident.recovery.steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {st.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : st.status === 'in-progress' ? (
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"></div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-200">{st.name}</div>
                          <div className="text-[11px] text-slate-400">{st.details}</div>
                        </div>
                      </div>
                      <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                        st.status === 'completed' ? 'bg-emerald-950/80 text-emerald-400' :
                        st.status === 'in-progress' ? 'bg-amber-950/80 text-amber-400 animate-pulse' :
                        'bg-slate-900 text-slate-500'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Verification Checklist & Actions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Telemetry Stabilization Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">P99 Latency &lt; 50ms</span>
                    <span className={incident.recovery.postVerification.latencyNormal ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {incident.recovery.postVerification.latencyNormal ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Error Rate &lt; 0.1%</span>
                    <span className={incident.recovery.postVerification.errorRateUnderThreshold ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {incident.recovery.postVerification.errorRateUnderThreshold ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Canary Traffic Passed</span>
                    <span className={incident.recovery.postVerification.canaryTrafficHealthy ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {incident.recovery.postVerification.canaryTrafficHealthy ? 'VERIFIED' : 'WAITING'}
                    </span>
                  </div>
                </div>

                {/* Complete verification button */}
                {incident.status !== 'RESOLVED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onCompleteRecovery(incident.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-950/60 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Close Incident as RESOLVED</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Detected: {incident.detectedAt}</span>
            {incident.resolvedAt && (
              <>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Resolved: {incident.resolvedAt}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
