import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { ServiceHealth, ServiceStatus } from '../types';

interface ServiceGridProps {
  services: ServiceHealth[];
  onSelectService?: (service: ServiceHealth) => void;
  selectedServiceId?: string | null;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onSelectService,
  selectedServiceId,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'All Services (12)' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'core', label: 'Core / Edge' },
    { id: 'data', label: 'Data & Search' },
    { id: 'infrastructure', label: 'Cluster' },
  ];

  const filtered = services.filter((s) => {
    const matchesCategory =
      filterCategory === 'ALL' || s.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Operational
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Degraded
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            Critical Outage
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] border border-white/[0.08] text-slate-300">
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Segmented Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141d]/70 backdrop-blur-xl p-2 rounded-2xl border border-white/[0.08]">
        {/* Apple macOS style segmented control */}
        <div className="flex flex-wrap gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.04]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-white/[0.12] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input with sleek glass border */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search 12 services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 bg-black/50 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/[0.2] transition-colors font-sans"
          />
        </div>
      </div>

      {/* Grid of 12 Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filtered.map((svc) => {
          const isSelected = selectedServiceId === svc.id;
          const isCritical = svc.status === 'CRITICAL';
          const isDegraded = svc.status === 'DEGRADED';

          return (
            <div
              key={svc.id}
              onClick={() => onSelectService && onSelectService(svc)}
              className={`group relative rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between backdrop-blur-xl ${
                isSelected
                  ? 'bg-[#151926] border-white/25 ring-1 ring-white/10 shadow-lg'
                  : isCritical
                  ? 'bg-rose-500/[0.04] border-rose-500/40 hover:border-rose-500/60 shadow-sm shadow-rose-950/20'
                  : isDegraded
                  ? 'bg-amber-500/[0.03] border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-[#131622]/80 border-white/[0.08] hover:border-white/[0.14] hover:bg-[#161a29]/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                      {svc.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors">
                      {svc.name}
                    </h4>
                  </div>
                  <div>{getStatusBadge(svc.status)}</div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 line-clamp-2 min-h-[30px] mb-3 leading-relaxed">
                  {svc.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-white/[0.06] font-mono text-xs">
                  <div className="bg-black/30 p-2 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <Activity className="w-3 h-3 text-slate-400" /> Latency P99
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 tabular-nums ${
                        svc.latency > 1000
                          ? 'text-rose-400'
                          : svc.latency > 250
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {svc.latency}ms
                    </div>
                  </div>

                  <div className="bg-black/30 p-2 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <Zap className="w-3 h-3 text-slate-400" /> Error Rate
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 tabular-nums ${
                        svc.errorRate > 10
                          ? 'text-rose-400'
                          : svc.errorRate > 2
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {svc.errorRate.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Resource Bar (CPU) */}
                <div className="space-y-1 mt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-400" /> CPU Load
                    </span>
                    <span className="font-mono text-slate-300 tabular-nums">{svc.cpu}%</span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        svc.cpu > 85 ? 'bg-rose-500' : svc.cpu > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${svc.cpu}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Server className="w-3 h-3 text-slate-400" /> {svc.instances} Pods
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-medium">
                  {svc.uptime}% SLA
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
