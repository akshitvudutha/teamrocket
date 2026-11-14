import React from 'react';
import { Server, CheckCircle2, AlertOctagon, CheckCheck, TrendingUp, ShieldCheck } from 'lucide-react';
import { Incident, ServiceHealth } from '../types';

interface OverviewStatsProps {
  services: ServiceHealth[];
  incidents: Incident[];
  onSelectFilter?: (type: string) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  services,
  incidents,
}) => {
  const totalServices = services.length;
  const healthyServices = services.filter((s) => s.status === 'HEALTHY').length;
  const degradedServices = services.filter((s) => s.status === 'DEGRADED').length;
  const criticalServices = services.filter((s) => s.status === 'CRITICAL').length;

  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED'
  ).length;

  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED').length;

  // Average uptime across all 12 services
  const avgUptime = (
    services.reduce((acc, curr) => acc + curr.uptime, 0) / (totalServices || 1)
  ).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Monitored Services */}
      <div className="rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xs hover:border-white/[0.14] transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
            Monitored Services
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-semibold text-white tracking-tight tabular-nums font-mono">
            {totalServices}
          </span>
          <span className="text-xs text-slate-400">Microservices</span>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
          <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            E-Commerce Cluster
          </span>
          <span className="font-mono text-[10px] text-slate-400">Mesh v2.14</span>
        </div>
      </div>

      {/* 2. Healthy Services & Cluster Uptime */}
      <div className="rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xs hover:border-white/[0.14] transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
            Cluster Health
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-semibold text-emerald-400 tracking-tight tabular-nums font-mono">
            {healthyServices}
          </span>
          <span className="text-xs text-slate-400">/ {totalServices} Healthy</span>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
          <span className="text-slate-300 text-[11px] truncate">
            {degradedServices > 0 && <span className="text-amber-400 font-medium">{degradedServices} Degraded </span>}
            {criticalServices > 0 && <span className="text-rose-400 font-medium">({criticalServices} Critical)</span>}
            {degradedServices === 0 && criticalServices === 0 && '100% Operational'}
          </span>
          <span className="font-mono text-[10px] text-emerald-400 font-medium">{avgUptime}% SLA</span>
        </div>
      </div>

      {/* 3. Active Critical Incidents */}
      <div
        className={`rounded-2xl bg-[#131622]/80 backdrop-blur-xl border p-5 shadow-xs transition-all group ${
          criticalIncidents > 0
            ? 'border-rose-500/40 bg-rose-500/[0.03] shadow-rose-950/20'
            : 'border-white/[0.08] hover:border-white/[0.14]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
            Critical Alerts (P1)
          </span>
          <div
            className={`p-2 rounded-xl border group-hover:scale-105 transition-transform ${
              criticalIncidents > 0
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
            }`}
          >
            <AlertOctagon className={`w-4 h-4 ${criticalIncidents > 0 ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span
            className={`text-3xl font-semibold tracking-tight tabular-nums font-mono ${
              criticalIncidents > 0 ? 'text-rose-400' : 'text-slate-200'
            }`}
          >
            {criticalIncidents}
          </span>
          <span className="text-xs text-slate-400">Unresolved</span>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
          <span className="text-slate-300 text-[11px]">
            {criticalIncidents > 0 ? 'Immediate Action Required' : 'Zero Active Outages'}
          </span>
          <span className="font-mono text-[10px] text-slate-400">P99 Impact &lt; 2.4s</span>
        </div>
      </div>

      {/* 4. Resolved Incidents & Remediation Rate */}
      <div className="rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xs hover:border-white/[0.14] transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
            Recovered Incidents
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
            <CheckCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-semibold text-white tracking-tight tabular-nums font-mono">
            {resolvedIncidents}
          </span>
          <span className="text-xs text-slate-400">Postmortems Ready</span>
        </div>
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-3">
          <span className="flex items-center gap-1 text-slate-300 text-[11px]">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            Canary Verified
          </span>
          <span className="font-mono text-[10px] text-purple-300">MTTR: 6.4m</span>
        </div>
      </div>
    </div>
  );
};
