import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Search,
  AlertTriangle,
  RotateCcw,
  Lock,
  ChevronRight,
  TrendingUp,
  Radio,
  Flame,
  Shield,
} from 'lucide-react';
import { MonitoredWebsite, WebsiteIncident, WebsiteStatus } from '../../types/tarsier';

interface DashboardViewProps {
  websites: MonitoredWebsite[];
  incidents: WebsiteIncident[];
  onSelectWebsite: (websiteId: string) => void;
  onOpenAddModal: () => void;
  onTriggerChaos: () => void;
  onRestoreAll: () => void;
  chaosActive: boolean;
}

export function DashboardView({
  websites,
  incidents,
  onSelectWebsite,
  onOpenAddModal,
  onTriggerChaos,
  onRestoreAll,
  chaosActive,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WebsiteStatus>('all');

  // Filtered websites
  const filteredWebsites = websites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate fleet stats
  const totalCount = websites.length;
  const downCount = websites.filter((w) => w.status === 'down').length;
  const warningCount = websites.filter((w) => w.status === 'warning').length;
  const healthyCount = websites.filter((w) => w.status === 'healthy').length;

  const avgLatency = Math.round(
    websites.reduce((acc, w) => acc + (w.status === 'down' ? 500 : w.latencyMs), 0) / (totalCount || 1)
  );

  const avgUptime = (
    websites.reduce((acc, w) => acc + w.uptimePct24h, 0) / (totalCount || 1)
  ).toFixed(2);

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Fleet Overview & Quick Chaos Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#007AFF] mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#007AFF]" />
            <span>Night Guard Autonomous Surveillance</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Fleet Overview
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-neutral-300 font-mono font-medium">
              {totalCount} Websites Protected
            </span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time multi-region health probes, anomaly isolation, and automated incident containment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onTriggerChaos}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              chaosActive
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-[#15151A] text-neutral-300 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Simulate flash sale traffic surge & carrier 504 timeouts"
          >
            <Flame className={`w-4 h-4 ${chaosActive ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
            <span>{chaosActive ? 'Chaos Injection Active' : 'Inject Chaos Outage'}</span>
          </button>

          <button
            onClick={onRestoreAll}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            title="Restore all monitored sites to healthy baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore All</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,122,255,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Fleet Uptime */}
        <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="text-xs font-medium text-neutral-400 mb-1">Fleet Uptime (24h)</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
            {avgUptime}%
            <span className="text-xs font-semibold text-emerald-400">99.9% Target</span>
          </div>
          <div className="mt-3 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-neutral-400">All edge nodes operational</span>
          </div>
        </div>

        {/* Card 2: Monitored Websites */}
        <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="text-xs font-medium text-neutral-400 mb-1">Surveilled Targets</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
            {totalCount}
            <span className="text-xs font-semibold text-neutral-400">Websites</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-400 flex items-center justify-between">
            <span className="text-emerald-400">{healthyCount} Healthy</span>
            <span className="text-amber-400">{warningCount} Warning</span>
            <span className="text-red-400">{downCount} Down</span>
          </div>
        </div>

        {/* Card 3: Avg Global Latency */}
        <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="text-xs font-medium text-neutral-400 mb-1">Average Latency</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
            {avgLatency} <span className="text-sm font-normal text-neutral-400">ms</span>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-neutral-400">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
            <span>Measured from 5 global regions</span>
          </div>
        </div>

        {/* Card 4: Active Incidents */}
        <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="text-xs font-medium text-neutral-400 mb-1">Active Incidents</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
            <span className={activeIncidents.length > 0 ? 'text-red-400' : 'text-emerald-400'}>
              {activeIncidents.length}
            </span>
            <span className="text-xs font-semibold text-neutral-400">
              {activeIncidents.length === 1 ? 'Incident' : 'Incidents'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-400">
            {activeIncidents.length > 0 ? (
              <span className="text-red-400 font-medium">Night Guard actively mitigating</span>
            ) : (
              <span className="text-emerald-400 font-medium">Zero open incidents</span>
            )}
          </div>
        </div>

        {/* Card 5: Synthetic Surveillance */}
        <div className="bg-[#15151A] rounded-2xl p-5 border border-white/10 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="text-xs font-medium text-neutral-400 mb-1">Night Guard Probes</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#007AFF] flex items-baseline gap-2">
            1,420
            <span className="text-xs font-semibold text-neutral-400">/ min</span>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-[11px] text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Deterministic Safety Active</span>
          </div>
        </div>
      </div>

      {/* Active Incident Alert Banner (If Any Active Incidents) */}
      {activeIncidents.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/30 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  CRITICAL INCIDENT ACTIVE: {activeIncidents[0].id}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-xs font-medium text-white">{activeIncidents[0].websiteName}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-0.5 line-clamp-1">
                {activeIncidents[0].title}
              </p>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1 font-mono">
                {activeIncidents[0].aiSummary}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectWebsite(activeIncidents[0].websiteId)}
            className="shrink-0 flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs border border-red-500/30 transition-all cursor-pointer"
          >
            <span>Inspect Incident & Remediate</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Category & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#15151A] border border-white/5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Targets ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('down')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              statusFilter === 'down'
                ? 'bg-red-500/80 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Down ({downCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              statusFilter === 'warning'
                ? 'bg-amber-500/80 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Warning ({warningCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('healthy')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
              statusFilter === 'healthy'
                ? 'bg-emerald-500/80 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Healthy ({healthyCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search websites, URLs, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#15151A] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] transition-colors"
          />
        </div>
      </div>

      {/* Monitored Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWebsites.map((site) => {
          const isDown = site.status === 'down';
          const isWarning = site.status === 'warning';

          return (
            <div
              key={site.id}
              onClick={() => onSelectWebsite(site.id)}
              className="glass-card-interactive rounded-2xl p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header: Name, Category, Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-neutral-400">{site.category}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-500">Checked {site.lastCheckSecondsAgo}s ago</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#007AFF] transition-colors line-clamp-1 mt-0.5">
                      {site.name}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 border ${
                      isDown
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDown ? 'bg-red-400 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{site.status}</span>
                  </div>
                </div>

                {/* URL and HTTP Status */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center space-x-1.5 text-neutral-400 hover:text-white transition-colors truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                    <span className="truncate">{site.url.replace('https://', '')}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                      site.httpStatus >= 500
                        ? 'bg-red-500/20 text-red-400'
                        : site.httpStatus >= 400
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/5 text-neutral-300'
                    }`}
                  >
                    HTTP {site.httpStatus}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0D0D10] border border-white/5 mb-4 text-left">
                  <div>
                    <div className="text-[11px] text-neutral-400">Response Latency</div>
                    <div
                      className={`text-base font-bold font-mono mt-0.5 ${
                        isDown ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {site.latencyMs} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400">24h Uptime</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {site.uptimePct24h}%
                    </div>
                  </div>
                </div>

                {/* Regional Latency Dots */}
                <div className="space-y-1 mb-4">
                  <div className="text-[10px] uppercase font-semibold text-neutral-500">
                    Global Ingress Points
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {site.regions.map((reg) => (
                      <div
                        key={reg.region}
                        title={`${reg.name}: ${reg.latencyMs}ms (${reg.status})`}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          reg.status === 'down'
                            ? 'bg-red-500'
                            : reg.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: SSL & Inspect Link */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center space-x-1 text-[11px]">
                  <Lock className="w-3 h-3 text-neutral-500" />
                  <span>SSL {site.sslExpiryDays}d left</span>
                </div>
                <div className="flex items-center space-x-1 text-[#007AFF] font-medium group-hover:translate-x-0.5 transition-transform">
                  <span>Website Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWebsites.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#15151A] border border-white/10">
          <Globe className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No websites found</h3>
          <p className="text-xs text-neutral-400 mb-4">
            No monitored websites matched your search filter "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs font-semibold text-[#007AFF] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
