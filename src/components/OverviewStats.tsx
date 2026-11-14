import React from 'react';
import { Server, CheckCircle, AlertOctagon, CheckCheck, Clock, ArrowUpRight } from 'lucide-react';
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
      {/* 1. Total Services */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Services
          </span>
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {totalServices}
          </span>
          <span className="text-xs text-slate-400">E-Commerce Stack</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Microservices Mesh
          </span>
          <span className="font-mono text-[11px] text-blue-400">v2.14 Prod</span>
        </div>
      </div>

      {/* 2. Healthy Services */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Healthy Services
          </span>
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {healthyServices}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ {totalServices}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="text-slate-300">
            {degradedServices > 0 && <span className="text-amber-400 font-medium">{degradedServices} Degraded </span>}
            {criticalServices > 0 && <span className="text-red-400 font-medium">({criticalServices} Critical)</span>}
            {degradedServices === 0 && criticalServices === 0 && '100% Operational'}
          </span>
          <span className="font-mono text-[11px] text-emerald-400">{avgUptime}% Uptime</span>
        </div>
      </div>

      {/* 3. Critical Incidents */}
      <div className={`relative overflow-hidden rounded-2xl bg-slate-900/80 border p-5 shadow-lg transition ${
        criticalIncidents > 0
          ? 'border-red-600/70 bg-red-950/20 shadow-red-950/30'
          : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Critical Incidents
          </span>
          <div className={`p-2 rounded-xl border ${
            criticalIncidents > 0
              ? 'bg-red-950 border-red-700 text-red-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <AlertOctagon className={`w-4 h-4 ${criticalIncidents > 0 ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className={`text-3xl font-black font-mono tracking-tight ${
            criticalIncidents > 0 ? 'text-red-400' : 'text-slate-100'
          }`}>
            {criticalIncidents}
          </span>
          <span className="text-xs text-slate-400">
            {criticalIncidents > 0 ? 'Immediate Action Required' : 'Zero Active P1s'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
          <span className={criticalIncidents > 0 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
            {criticalIncidents > 0 ? 'AI Auto-Remediation Ready' : 'SLA Guardrail Met'}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Clock className="w-3 h-3" /> Target MTTR &lt; 15m
          </span>
        </div>
      </div>

      {/* 4. Resolved Incidents */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resolved Incidents
          </span>
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <CheckCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {resolvedIncidents}
          </span>
          <span className="text-xs text-slate-400">Past 24 Hours</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="text-purple-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 94% AI-Mitigated
          </span>
          <span className="font-mono text-[11px] text-slate-300">Avg MTTR: 6.2m</span>
        </div>
      </div>
    </div>
  );
};
