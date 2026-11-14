import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
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
    { id: 'core', label: 'Core / Gateways' },
    { id: 'data', label: 'Data & Search' },
    { id: 'infrastructure', label: 'Infrastructure' },
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/70 border border-emerald-800 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Operational
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/70 border border-amber-800 text-amber-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Degraded
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/90 border border-red-700 text-red-300 shadow-md shadow-red-950">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Critical Outage
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
            Maintenance
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter 12 microservices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>
      </div>

      {/* Grid of 12 Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((svc) => {
          const isSelected = selectedServiceId === svc.id;
          const isCritical = svc.status === 'CRITICAL';
          const isDegraded = svc.status === 'DEGRADED';

          return (
            <div
              key={svc.id}
              onClick={() => onSelectService && onSelectService(svc)}
              className={`group relative rounded-2xl border p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-rose-500/80 ring-2 ring-rose-500/20 shadow-xl'
                  : isCritical
                  ? 'bg-red-950/20 border-red-800/80 hover:border-red-600 shadow-md shadow-red-950/40'
                  : isDegraded
                  ? 'bg-amber-950/20 border-amber-800/70 hover:border-amber-600'
                  : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      {svc.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                      {svc.name}
                    </h4>
                  </div>
                  <div>{getStatusBadge(svc.status)}</div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-3">
                  {svc.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2.5 py-2.5 border-t border-slate-800/80 font-mono text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <Activity className="w-3 h-3 text-slate-400" /> Latency (P99)
                    </div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${
                        svc.latency > 1000
                          ? 'text-red-400'
                          : svc.latency > 250
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {svc.latency}ms
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <Zap className="w-3 h-3 text-slate-400" /> Error Rate
                    </div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${
                        svc.errorRate > 10
                          ? 'text-red-400'
                          : svc.errorRate > 2
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {svc.errorRate.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Resource Bars */}
                <div className="space-y-1.5 mt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-400" /> CPU Load
                    </span>
                    <span className="font-mono text-slate-300">{svc.cpu}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        svc.cpu > 85 ? 'bg-red-500' : svc.cpu > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${svc.cpu}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Server className="w-3 h-3" /> {svc.instances} Pods
                </span>
                <span className="font-mono text-emerald-400 font-medium">
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
