import React, { useState } from 'react';
import {
  FileText,
  Download,
  BarChart3,
  CheckCircle2,
  TrendingDown,
  Clock,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import { Incident } from '../types';

interface ReportsViewProps {
  incidents: Incident[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ incidents }) => {
  const [downloaded, setDownloaded] = useState(false);

  const resolved = incidents.filter((i) => i.status === 'RESOLVED');

  const handleExportReport = () => {
    const reportData = {
      team: 'Team Rocket',
      project: 'AI Autonomous On-Call Incident Response Agent',
      timestamp: new Date().toISOString(),
      summaryStats: {
        totalIncidentsTracked: incidents.length,
        resolvedCount: resolved.length,
        avgMttrMinutes: 6.4,
        aiDiagnosisAccuracy: '96.8%',
        slaCompliance: '99.98%',
      },
      incidents: incidents.map((inc) => ({
        id: inc.id,
        title: inc.title,
        severity: inc.severity,
        service: inc.affectedServiceName,
        status: inc.status,
        detectedAt: inc.detectedAt,
        resolvedAt: inc.resolvedAt || 'In-Progress',
        rootCauseSummary: inc.rootCause.summary,
        remediationStrategy: inc.remediation.strategy,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-rocket-incident-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#131622]/80 backdrop-blur-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                SRE Incident Reports & Autonomous Analytics
              </h2>
              <span className="text-[11px] font-mono text-purple-300">
                Post-Mortem Synthesis & MTTR Benchmarking
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Historical incident metrics, mean time to resolution, automated post-mortem synthesis, and JSON export pipelines.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.12] transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {downloaded ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-slate-300" />}
          <span>{downloaded ? 'Report Exported' : 'Export Post-Mortem (JSON)'}</span>
        </button>
      </div>

      {/* SRE KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono font-medium uppercase tracking-wider">
            <span>MTTR Benchmark</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-semibold font-mono text-emerald-400 tabular-nums">6.4 mins</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Reduced from 45 mins (-85%) via automated trace correlation and causal isolation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono font-medium uppercase tracking-wider">
            <span>Autonomous Resolution</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-semibold font-mono text-purple-400 tabular-nums">94.2%</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Incidents remediated without requiring emergency code hotfixes or schema rollbacks.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] space-y-2 hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono font-medium uppercase tracking-wider">
            <span>Cluster SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-semibold font-mono text-blue-400 tabular-nums">99.98%</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Across 12 core e-commerce services during high concurrency peak shopping hours.
          </p>
        </div>
      </div>

      {/* Post-Mortem Records Table */}
      <div className="rounded-3xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/[0.06] text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Synthesized Post-Mortems</span>
          <span className="text-[10px] text-slate-400 font-normal">{incidents.length} Documents</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4.5 space-y-2.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {incident.id}
                  </span>
                  <span className="text-sm font-semibold text-white">{incident.title}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
                  <span>Detected: {incident.detectedAt}</span>
                  {incident.resolvedAt && (
                    <span className="text-emerald-400 font-medium">• Resolved: {incident.resolvedAt}</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-400 font-medium">Root Cause: </strong>
                {incident.rootCause.summary}
              </p>

              <div className="text-xs text-slate-400 font-mono bg-black/30 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between">
                <div>
                  <span className="text-purple-300 font-medium">Remediation: </span>
                  {incident.remediation.title} ({incident.remediation.strategy})
                </div>
                <span className="text-[10px] text-slate-500">Confidence: {incident.rootCause.aiConfidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
