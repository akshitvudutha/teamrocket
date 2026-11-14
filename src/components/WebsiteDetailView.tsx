import React, { useState } from 'react';
import {
  Globe,
  Activity,
  ShieldCheck,
  Clock,
  Server,
  Layers,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Zap,
  Lock,
  Search,
  Filter,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';
import { ServiceHealth, Incident, LogEntry } from '../types';

interface WebsiteDetailViewProps {
  service: ServiceHealth;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onBack: () => void;
}

export type WebsiteTab = 'overview' | 'attributes' | 'incidents' | 'logs';

export const WebsiteDetailView: React.FC<WebsiteDetailViewProps> = ({
  service,
  incidents,
  onSelectIncident,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<WebsiteTab>('overview');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');

  // Find incidents matching this service
  const serviceIncidents = incidents.filter(
    (i) => i.affectedServiceId === service.id || i.affectedServiceName.toLowerCase().includes(service.name.toLowerCase())
  );

  // Generate realistic logs for this service
  const mockServiceLogs: LogEntry[] = [
    {
      id: `log-${service.id}-1`,
      timestamp: '12:29:45.102',
      level: service.status === 'CRITICAL' ? 'FATAL' : 'INFO',
      service: service.name,
      message: service.status === 'CRITICAL'
        ? `[CRITICAL_ALARM] Upstream timeout exceeded 2500ms threshold on /v1/checkout. Connection pool 100% saturated.`
        : `HTTP GET /health 200 OK — latency 14ms — memory headroom 62%`,
      traceId: `tr-${service.id}-9912`,
    },
    {
      id: `log-${service.id}-2`,
      timestamp: '12:28:12.441',
      level: service.status === 'CRITICAL' ? 'ERROR' : service.status === 'DEGRADED' ? 'WARN' : 'INFO',
      service: service.name,
      message: service.status === 'CRITICAL'
        ? `HikariPool-1 - Connection is not available, request timed out after 30000ms.`
        : service.status === 'DEGRADED'
        ? `High memory allocation detected in worker thread pool. GC pause 420ms.`
        : `Ingress proxy route synchronized with Envoy cluster mesh v2.14`,
      traceId: `tr-${service.id}-8821`,
    },
    {
      id: `log-${service.id}-3`,
      timestamp: '12:25:30.820',
      level: 'WARN',
      service: service.name,
      message: `P99 latency variance +18% over 5-minute rolling window. Automatic canary baseline stable.`,
      traceId: `tr-${service.id}-7714`,
    },
    {
      id: `log-${service.id}-4`,
      timestamp: '12:22:15.004',
      level: 'INFO',
      service: service.name,
      message: `TLS Certificate verification succeeded. Cipher suite: TLS_AES_256_GCM_SHA384`,
      traceId: `tr-${service.id}-6601`,
    },
    {
      id: `log-${service.id}-5`,
      timestamp: '12:20:00.129',
      level: 'INFO',
      service: service.name,
      message: `Pod autoscaler health probe passed on port 8080. Ready: ${service.instances}/${service.instances} replicas`,
      traceId: `tr-${service.id}-5510`,
    },
  ];

  const filteredLogs = mockServiceLogs.filter((log) => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.traceId?.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="notch-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[var(--border-medium)]">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="text-xs text-[var(--text-muted)] hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              &larr; Back to Services
            </button>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-medium">
              Website & Service Details
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {service.name}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                service.status === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  : service.status === 'DEGRADED'
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
              }`}
            >
              {service.status}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {service.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-right">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Uptime SLA</div>
            <div className="text-sm font-semibold text-emerald-500 mt-0.5">{service.uptime}%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-mono text-right">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">P99 Latency</div>
            <div
              className={`text-sm font-semibold mt-0.5 ${
                service.latency > 1000 ? 'text-rose-500' : service.latency > 250 ? 'text-amber-500' : 'text-blue-400'
              }`}
            >
              {service.latency}ms
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tabs: Overview, Attributes, Incidents, Logs */}
      <div className="notch-card p-2 flex flex-wrap gap-1 border border-[var(--border-subtle)]">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'attributes', label: 'Attributes & Topology', icon: Layers },
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle, count: serviceIncidents.length },
          { id: 'logs', label: 'Telemetry Logs', icon: Terminal, count: mockServiceLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WebsiteTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--tag-bg)] text-[var(--text-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="notch-card p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                P99 Latency
              </span>
              <div
                className={`text-2xl font-semibold font-mono tabular-nums ${
                  service.latency > 1000 ? 'text-rose-500' : service.latency > 250 ? 'text-amber-500' : 'text-blue-400'
                }`}
              >
                {service.latency}ms
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Global Edge distribution</p>
            </div>

            <div className="notch-card p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Error Rate
              </span>
              <div
                className={`text-2xl font-semibold font-mono tabular-nums ${
                  service.errorRate > 10 ? 'text-rose-500' : service.errorRate > 1 ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {service.errorRate.toFixed(2)}%
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">HTTP 5xx / total requests</p>
            </div>

            <div className="notch-card p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                CPU Utilization
              </span>
              <div className="text-2xl font-semibold font-mono text-[var(--text-primary)] tabular-nums">
                {service.cpu}%
              </div>
              <div className="w-full h-1.5 bg-[var(--tag-bg)] rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${
                    service.cpu > 80 ? 'bg-rose-500' : service.cpu > 60 ? 'bg-amber-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${service.cpu}%` }}
                />
              </div>
            </div>

            <div className="notch-card p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Replica Pods
              </span>
              <div className="text-2xl font-semibold font-mono text-emerald-500 tabular-nums">
                {service.instances} / {service.instances}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Kubernetes auto-scaled</p>
            </div>
          </div>

          {/* Quick Health Status Card */}
          <div className="notch-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Service Operational Assessment
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {service.status === 'CRITICAL'
                ? `Critical anomaly detected: Elevated latency spike caused by connection pool starvation. TARSIER AI has initiated automated diagnostic triage.`
                : service.status === 'DEGRADED'
                ? `Degraded performance detected: Resource utilization is elevated. Traffic is being shed to prevent cascade failure.`
                : `Service ${service.name} is operating within normal SLA thresholds. Zero active error anomalies detected over the past 60 minutes.`}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: ATTRIBUTES */}
      {activeTab === 'attributes' && (
        <div className="notch-card p-6 sm:p-7 space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Service Attributes & Configuration Specification
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Infrastructure topology, DNS configuration, and networking protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Service Identifier</span>
              <div className="text-[var(--text-primary)] font-semibold">{service.id}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Category / Tier</span>
              <div className="text-[var(--text-primary)] font-semibold capitalize">{service.category} Tier-1</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Internal Ingress Host</span>
              <div className="text-blue-400 font-semibold">{service.id}.internal.tarsier.mesh:8080</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">SSL / TLS Protocol</span>
              <div className="text-emerald-500 font-semibold">TLSv1.3 (Strict mTLS via Envoy)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Health Check Endpoint</span>
              <div className="text-[var(--text-primary)] font-semibold">GET /api/health (200 OK)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Cluster Region</span>
              <div className="text-[var(--text-primary)] font-semibold">us-east-1 (Multi-AZ HA)</div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-[var(--text-primary)] font-sans">
              Upstream / Downstream Microservice Dependencies
            </span>
            <div className="flex flex-wrap gap-2">
              {service.dependencies.length > 0 ? (
                service.dependencies.map((dep, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--tag-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  >
                    &rarr; {dep}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  No downstream dependencies (Leaf node in cluster mesh)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {serviceIncidents.length === 0 ? (
            <div className="notch-card p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                No active incidents on {service.name}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                All health checks and latency bounds are meeting verified production SLAs.
              </p>
            </div>
          ) : (
            serviceIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="notch-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[var(--border-medium)] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-rose-500">
                      {inc.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-500 font-semibold border border-rose-500/25">
                      {inc.severity}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      · Status: {inc.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {inc.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                    {inc.rootCause.summary}
                  </p>
                </div>

                <button className="notch-btn-primary text-xs px-3.5 py-1.5 shrink-0 self-end sm:self-center">
                  <span>Investigate Incident</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 notch-card p-2.5">
            <div className="flex gap-1">
              {['ALL', 'FATAL', 'ERROR', 'WARN', 'INFO'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    logFilter === lvl
                      ? 'bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Filter logs by message or trace..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-medium)] w-full sm:w-60 font-sans"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[#07080a] p-4 font-mono text-xs overflow-x-auto max-h-[400px] space-y-2 text-white">
            <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-white/[0.06]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-medium text-slate-300">STREAM // {service.name}</span>
              </div>
              <span>{filteredLogs.length} events</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-slate-400 py-8 text-center font-sans text-xs">
                No logs matching filter criteria.
              </div>
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
                  <span className="text-blue-400 font-medium text-[11px] shrink-0">
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
    </div>
  );
};
