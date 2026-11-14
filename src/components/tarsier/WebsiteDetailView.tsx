import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Play,
  Pause,
  Flame,
  Sliders,
  Terminal,
  Server,
  Zap,
  Check,
  Search,
  Copy,
  AlertOctagon,
  FileText,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import {
  MonitoredWebsite,
  WebsiteIncident,
  WebsiteLog,
  DetailTab,
} from '../../types/tarsier';
import { HumanApprovalModal } from './HumanApprovalModal';
import { PostmortemModal } from './PostmortemModal';
import { api } from '../../services/api';

interface WebsiteDetailViewProps {
  website: MonitoredWebsite;
  incidents: WebsiteIncident[];
  logs: WebsiteLog[];
  onBack: () => void;
  onRunSyntheticProbe: (websiteId: string) => void;
  onToggleSurveillance: (websiteId: string) => void;
  onRemediateIncident: (incidentId: string) => void;
  onSimulateOutage: (websiteId: string) => void;
  isPaused?: boolean;
}

export function WebsiteDetailView({
  website,
  incidents,
  logs,
  onBack,
  onRunSyntheticProbe,
  onToggleSurveillance,
  onRemediateIncident,
  onSimulateOutage,
  isPaused = false,
}: WebsiteDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{ time: string; latencyMs: number; statusCode: number } | null>(null);
  const [probing, setProbing] = useState(false);
  const [normalizingLogs, setNormalizingLogs] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Modals
  const [selectedIncidentForApproval, setSelectedIncidentForApproval] = useState<WebsiteIncident | null>(null);
  const [isPostmortemOpen, setIsPostmortemOpen] = useState(false);

  // Local logs state to allow live backend normalization
  const [displayedLogs, setDisplayedLogs] = useState<WebsiteLog[]>(logs);

  const isDown = website.status === 'down';
  const isWarning = website.status === 'warning';

  const websiteIncidents = incidents.filter((i) => i.websiteId === website.id);
  const activeIncident = websiteIncidents.find((i) => i.status !== 'RESOLVED');

  const websiteLogs = displayedLogs.filter((l) => l.websiteId === website.id || !l.websiteId);

  // Filter logs
  const filteredLogs = websiteLogs.filter((log) => {
    const matchesSev = logSeverityFilter === 'ALL' || log.severity === logSeverityFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const handleProbeClick = () => {
    setProbing(true);
    onRunSyntheticProbe(website.id);
    setTimeout(() => setProbing(false), 800);
  };

  const copyLogMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  // Run backend log normalizer pipeline (/api/evidence/normalize)
  const handleRunBackendNormalizer = async () => {
    setNormalizingLogs(true);
    try {
      const rawLines = websiteLogs.map((l) => l.message);
      const res = await api.normalizeLogs(rawLines, website.name.toLowerCase().replace(/\s+/g, '-'));
      if (res && res.bundle && res.bundle.normalizedLogs) {
        const mapped: WebsiteLog[] = res.bundle.normalizedLogs.map((n) => ({
          id: n.id,
          websiteId: website.id,
          timestamp: n.timestamp,
          severity: (n.severity as any) || 'INFO',
          service: n.service,
          message: n.message,
          format: (n.source as any) || 'unstructured',
          isSuspicious: n.isSuspicious,
          riskScore: n.isSuspicious ? 98 : 0,
          suspiciousReasons: n.suspiciousReasons,
        }));
        setDisplayedLogs(mapped);
      }
    } catch (err) {
      console.warn('Backend normalizer call fallback:', err);
    } finally {
      setTimeout(() => setNormalizingLogs(false), 500);
    }
  };

  // Response Time Chart Math (SVG Area Chart)
  const chartPoints = website.historicalLatency;
  const maxLatency = Math.max(...chartPoints.map((p) => p.latencyMs), 100);
  const chartHeight = 160;
  const chartWidth = 720;
  const padding = 20;

  const pointsString = chartPoints
    .map((pt, idx) => {
      const x = padding + (idx / (chartPoints.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (pt.latencyMs / maxLatency) * (chartHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `${padding},${chartHeight - padding} ${pointsString} ${
    chartWidth - padding
  },${chartHeight - padding}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Back to Fleet Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs text-neutral-400">
              <span className="cursor-pointer hover:underline" onClick={onBack}>
                Fleet
              </span>
              <span>/</span>
              <span className="text-white font-medium">{website.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              {website.name}
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isDown
                    ? 'bg-red-400 animate-ping'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </h1>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Postmortem Report Export Button */}
          <button
            onClick={() => setIsPostmortemOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            title="Generate SRE Postmortem Document"
          >
            <FileText className="w-3.5 h-3.5 text-[#007AFF]" />
            <span className="hidden sm:inline">Postmortem</span>
          </button>

          {/* Toggle Outage Simulation */}
          <button
            onClick={() => onSimulateOutage(website.id)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            title="Simulate upstream failure or recovery"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isDown ? 'Recover' : 'Simulate Outage'}</span>
          </button>

          {/* Toggle Pause Surveillance */}
          <button
            onClick={() => onToggleSurveillance(website.id)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#15151A] text-neutral-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Checks' : 'Pause'}</span>
          </button>

          {/* Synthetic Probe Button */}
          <button
            onClick={handleProbeClick}
            disabled={probing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,122,255,0.3)] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
            <span>Run Probe</span>
          </button>

          {/* External Target Link */}
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors"
            title="Visit Live Host"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Target Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          isDown
            ? 'bg-red-500/10 border-red-500/30'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-[#15151A] border-white/10'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
              isDown
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : isWarning
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-white">{website.url}</span>
              <span className="text-neutral-500">•</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDown ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                HTTP {website.httpStatus} {isDown ? 'GATEWAY TIMEOUT' : 'OPERATIONAL'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Surveilled across 5 regions. Last synthetic probe check completed {website.lastCheckSecondsAgo}s ago.
            </p>
          </div>
        </div>

        {/* If Active Incident: Remediation Trigger Button */}
        {activeIncident && (
          <button
            onClick={() => setSelectedIncidentForApproval(activeIncident)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs border border-red-500/40 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span>Remediate Incident ({activeIncident.id})</span>
          </button>
        )}
      </div>

      {/* 4-Tab Navigation Strip */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'attributes'
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Attributes & Security
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'incidents'
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Incidents</span>
          {websiteIncidents.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isDown
                  ? 'bg-red-500/30 text-red-300'
                  : 'bg-white/10 text-neutral-300'
              }`}
            >
              {websiteIncidents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'logs'
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Diagnostic Logs</span>
          <span className="text-[10px] text-neutral-400 font-mono">({websiteLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Latency Area Chart */}
          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#007AFF]" />
                  <span>Response Time & Latency Percentiles</span>
                </h3>
                <p className="text-xs text-neutral-400">Historical probe latency over the past 90 minutes</p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div>
                  <span className="text-neutral-500">Current: </span>
                  <span className={`font-bold ${isDown ? 'text-red-400' : 'text-white'}`}>
                    {website.latencyMs}ms
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">p95: </span>
                  <span className="text-neutral-300 font-semibold">{website.latencyP95Ms}ms</span>
                </div>
                <div>
                  <span className="text-neutral-500">p99: </span>
                  <span className="text-neutral-300 font-semibold">{website.latencyP99Ms}ms</span>
                </div>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative w-full overflow-hidden bg-black/40 rounded-xl p-2 border border-white/5">
              {hoveredPoint && (
                <div className="absolute top-3 left-4 z-10 px-2.5 py-1 rounded bg-[#0D0D10] border border-white/20 text-xs font-mono text-white shadow-lg pointer-events-none">
                  {hoveredPoint.time} UTC — {hoveredPoint.latencyMs}ms (HTTP {hoveredPoint.statusCode})
                </div>
              )}

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" />

                {/* Shaded Area */}
                <polygon points={areaString} fill="url(#latencyGradient)" />

                {/* Main Line */}
                <polyline fill="none" stroke="#007AFF" strokeWidth="2.5" points={pointsString} strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {chartPoints.map((pt, idx) => {
                  const x = padding + (idx / (chartPoints.length - 1)) * (chartWidth - padding * 2);
                  const y = chartHeight - padding - (pt.latencyMs / maxLatency) * (chartHeight - padding * 2);
                  const isErr = pt.statusCode >= 500;

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isErr ? 5.5 : 4}
                      fill={isErr ? '#EF4444' : '#007AFF'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-150 transition-transform"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] font-mono text-neutral-500 pt-2 px-4">
                {chartPoints.map((pt, idx) => (
                  <span key={idx}>{pt.time}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Latency Cards */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">Global Multi-Region Response Times</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {website.regions.map((reg) => (
                <div key={reg.region} className="bg-[#15151A] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                    <span className="truncate">{reg.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        reg.status === 'down'
                          ? 'bg-red-400 animate-ping'
                          : reg.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {reg.latencyMs} <span className="text-xs font-normal text-neutral-400">ms</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between">
                    <span>Synthetic Ping</span>
                    <span className="text-neutral-400 font-semibold">{reg.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Timeline & SLA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10">
              <div className="text-xs text-neutral-400 mb-1">24-Hour Availability</div>
              <div className="text-2xl font-bold text-white">{website.uptimePct24h}%</div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, website.uptimePct24h)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10">
              <div className="text-xs text-neutral-400 mb-1">30-Day Availability</div>
              <div className="text-2xl font-bold text-white">{website.uptimePct30d}%</div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, website.uptimePct30d)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10">
              <div className="text-xs text-neutral-400 mb-1">HTTP Status Distribution</div>
              <div className="flex items-center space-x-2 text-xs font-mono mt-1">
                <span className="text-emerald-400 font-bold">2xx: 98.4%</span>
                <span className="text-neutral-600">•</span>
                <span className="text-amber-400 font-bold">4xx: 0.8%</span>
                <span className="text-neutral-600">•</span>
                <span className="text-red-400 font-bold">5xx: 0.8%</span>
              </div>
              <div className="flex w-full h-2 rounded-full overflow-hidden mt-3 gap-0.5">
                <div className="bg-emerald-400 h-full" style={{ width: '98.4%' }} />
                <div className="bg-amber-400 h-full" style={{ width: '0.8%' }} />
                <div className="bg-red-400 h-full" style={{ width: '0.8%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRIBUTES & CONFIGURATION */}
      {activeTab === 'attributes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#007AFF]" />
              <span>Network & Surveillance Attributes</span>
            </h3>

            <div className="divide-y divide-white/5 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">DNS Resolution</span>
                <span className="font-mono text-white">104.21.48.112 (Anycast Edge)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">HTTP Protocol</span>
                <span className="font-mono text-emerald-400 font-semibold">HTTP/2 (Multiplexed)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Target Port</span>
                <span className="font-mono text-white">443 (Encrypted)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Surveillance Cadence</span>
                <span className="font-mono text-white">Every {website.checkIntervalSeconds} seconds</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Compression</span>
                <span className="font-mono text-white">Brotli (br) + Gzip</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Assigned Tags</span>
                <div className="flex gap-1">
                  {website.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>TLS Security & Certificate Attributes</span>
            </h3>

            <div className="divide-y divide-white/5 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">SSL Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid & Trusted</span>
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Certificate Issuer</span>
                <span className="font-mono text-white">{website.sslIssuer}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Days Remaining</span>
                <span className="font-mono text-emerald-400 font-semibold">{website.sslExpiryDays} days</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">TLS Version</span>
                <span className="font-mono text-white font-semibold">TLS 1.3</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Cipher Suite</span>
                <span className="font-mono text-neutral-300 text-[11px]">TLS_AES_256_GCM_SHA384</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">HSTS Policy</span>
                <span className="font-mono text-emerald-400">max-age=31536000 (Preload)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4 md:col-span-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7055FF]" />
              <span>Autonomous SRE Night Guard Configurations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">Causal Telemetry Isolation</div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Traces anomalies across upstream gateways, message brokers, and database pools to pinpoint patient-zero root causes.
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ● ACTIVE (12 Services Linked)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">Prompt-Injection Shield</div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Sanitizes untrusted telemetry, boundary break tags, and adversarial instructions before LLM prompt consumption.
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ● ENFORCED (Zero LLM Bypass)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">Deterministic Human Safety Gate</div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Prohibits autonomous destructive actions during change freezes. Requires on-call operator sign-off.
                </p>
                <div className="mt-3 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ● NON-LLM GATEWAY ARMED
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          {websiteIncidents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#15151A] border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Zero Open Incidents</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Night Guard has detected no service degradations or SLA breaches for this target in the last 30 days.
              </p>
            </div>
          ) : (
            websiteIncidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-[#15151A] rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6"
              >
                {/* Incident Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          inc.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : inc.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs text-neutral-400">{inc.id}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400">Started {inc.startedAt}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{inc.title}</h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPostmortemOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0D0D10] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>Postmortem</span>
                    </button>
                    <div className="flex items-center space-x-1 bg-white/5 px-2.5 py-1.5 rounded-xl">
                      <span className="text-xs text-neutral-400">Duration:</span>
                      <span className="font-mono text-xs font-bold text-white">{inc.duration}</span>
                    </div>
                  </div>
                </div>

                {/* AI Night Guard Root Cause Analysis Box */}
                <div className="p-5 rounded-xl bg-[#0D0D10] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-[#007AFF]">
                      <Sparkles className="w-4 h-4 text-[#007AFF]" />
                      <span>TARSIER Night Guard • Causal Root-Cause Engine (Ollama qwen2.5:7b)</span>
                    </div>
                    {inc.rootCauseAnalysis && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inc.rootCauseAnalysis.confidence}% Confidence
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                    {inc.aiSummary}
                  </p>

                  {/* Causal Chain Breakdown */}
                  {inc.rootCauseAnalysis && inc.rootCauseAnalysis.causalChain && (
                    <div className="p-3.5 rounded-xl bg-[#15151A] border border-white/5 space-y-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-[#007AFF]" />
                        <span>Isolated Causal Propagation Chain:</span>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l border-white/10 ml-2">
                        {inc.rootCauseAnalysis.causalChain.map((step, idx) => (
                          <div key={idx} className="text-xs text-neutral-300 flex items-start space-x-2">
                            <span className="text-[#007AFF] font-mono font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blast Radius Pills */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-neutral-500">Blast Radius Impact:</span>
                    {inc.blastRadius.map((b) => (
                      <span key={b} className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 font-mono text-[11px] border border-red-500/20">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Remediation Action Card */}
                {inc.status !== 'RESOLVED' && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-[#007AFF]/10 via-[#7055FF]/10 to-transparent border border-[#007AFF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#007AFF] mb-1">
                        Recommended Remediation Strategy (Human Approval Required)
                      </div>
                      <p className="text-xs sm:text-sm text-white font-medium">
                        {inc.suggestedRemediation}
                      </p>
                      <div className="mt-2 text-xs font-mono text-neutral-400">
                        $ {inc.remediationAction}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedIncidentForApproval(inc)}
                      className="shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold shadow-[0_0_20px_rgba(0,122,255,0.4)] transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Review & Authorize Remediation</span>
                    </button>
                  </div>
                )}

                {/* Incident Timeline */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                    Incident Chronology & Telemetry Milestones
                  </h4>
                  <div className="space-y-3 border-l-2 border-white/10 ml-2 pl-4">
                    {inc.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                        <div className="flex items-center space-x-2 text-[11px] text-neutral-500 mb-0.5 font-mono">
                          <span>{step.time}</span>
                          <span>•</span>
                          <span className="text-[#007AFF] font-medium">{step.actor}</span>
                        </div>
                        <p className="text-xs text-neutral-300">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DIAGNOSTIC LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-[#0D0D10] rounded-xl border border-white/5">
              {['ALL', 'FATAL', 'ERROR', 'WARN', 'INFO'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setLogSeverityFilter(sev)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    logSeverityFilter === sev
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Trigger Backend Log Normalizer */}
              <button
                onClick={handleRunBackendNormalizer}
                disabled={normalizingLogs}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0D0D10] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer shrink-0"
                title="Send raw logs to Express /api/evidence/normalize pipeline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${normalizingLogs ? 'animate-spin text-[#007AFF]' : ''}`} />
                <span className="hidden sm:inline">Parse with Backend Pipeline</span>
              </button>

              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search raw logs..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0D0D10] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
                />
              </div>
            </div>
          </div>

          {/* Prompt Injection Alert Banner if Suspicious Log Exists */}
          {filteredLogs.some((l) => l.isSuspicious) && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-xs text-red-200 flex items-start space-x-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-400 uppercase tracking-wider">
                  Prompt-Injection Defense Active:
                </span>{' '}
                Hostile telemetry injection pattern neutralized by TARSIER Sanitizer. Neutralized prior to LLM reasoning input.
              </div>
            </div>
          )}

          {/* Streaming Log Terminal */}
          <div className="rounded-xl bg-[#0A0A0D] border border-white/10 p-4 font-mono text-xs space-y-2.5 max-h-[500px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No logs found matching filter criteria.</div>
            ) : (
              filteredLogs.map((log) => {
                const isFatal = log.severity === 'FATAL';
                const isError = log.severity === 'ERROR';
                const isWarn = log.severity === 'WARN';

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      log.isSuspicious
                        ? 'bg-red-950/20 border-red-500/40 text-red-200'
                        : isFatal
                        ? 'bg-red-500/5 border-red-500/20 text-neutral-200'
                        : isError
                        ? 'bg-amber-500/5 border-amber-500/20 text-neutral-200'
                        : 'bg-white/[0.02] border-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-neutral-500 text-[11px]">{log.timestamp.split('T')[1] || log.timestamp}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isFatal
                              ? 'bg-red-500/20 text-red-400'
                              : isError
                              ? 'bg-amber-500/20 text-amber-400'
                              : isWarn
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-white/10 text-neutral-400'
                          }`}
                        >
                          {log.severity}
                        </span>
                        <span className="text-neutral-400 font-semibold">{log.service}</span>
                        <span className="text-neutral-600">[{log.format.toUpperCase()}]</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {log.isSuspicious && (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/40 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            <span>PROMPT INJECTION QUARANTINED (Risk {log.riskScore}/100)</span>
                          </span>
                        )}

                        <button
                          onClick={() => copyLogMessage(log.id, log.message)}
                          className="text-neutral-500 hover:text-white transition-colors p-1 cursor-pointer"
                          title="Copy message"
                        >
                          {copiedLogId === log.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-neutral-200 text-xs break-all leading-relaxed">
                      {log.message}
                    </div>

                    {log.suspiciousReasons && (
                      <div className="mt-2 text-[10px] text-red-400 bg-black/40 p-1.5 rounded border border-red-500/20">
                        Neutralized rules: {log.suspiciousReasons.join('; ')}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Human Approval Safety Gate Modal */}
      {selectedIncidentForApproval && (
        <HumanApprovalModal
          isOpen={Boolean(selectedIncidentForApproval)}
          onClose={() => setSelectedIncidentForApproval(null)}
          incident={selectedIncidentForApproval}
          onConfirmRemediation={(id) => {
            onRemediateIncident(id);
            setSelectedIncidentForApproval(null);
          }}
        />
      )}

      {/* Postmortem Report Modal */}
      <PostmortemModal
        isOpen={isPostmortemOpen}
        onClose={() => setIsPostmortemOpen(false)}
      />
    </div>
  );
}
