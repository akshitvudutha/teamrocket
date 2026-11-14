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
  ChevronRight,
  ChevronDown,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ServiceHealth, ServiceStatus } from '../types';

interface ServiceGridProps {
  services: ServiceHealth[];
  onSelectService?: (service: ServiceHealth) => void;
  selectedServiceId?: string | null;
  onInspectWebsite?: (service: ServiceHealth) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  onSelectService,
  selectedServiceId,
  onInspectWebsite,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(selectedServiceId || null);

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Degraded
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-500 border border-rose-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            Critical Outage
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            Maintenance
          </span>
        );
    }
  };

  const handleToggleExpand = (svc: ServiceHealth) => {
    if (expandedServiceId === svc.id) {
      setExpandedServiceId(null);
    } else {
      setExpandedServiceId(svc.id);
      if (onSelectService) onSelectService(svc);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 notch-card p-2">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-medium)] transition-colors"
          />
        </div>
      </div>

      {/* Services Minimalist List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((svc) => {
          const isExpanded = expandedServiceId === svc.id;
          const isCritical = svc.status === 'CRITICAL';
          const isDegraded = svc.status === 'DEGRADED';

          return (
            <div
              key={svc.id}
              className={`notch-card p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                isExpanded
                  ? 'ring-1 ring-[var(--border-highlight)] border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] shadow-lg'
                  : isCritical
                  ? 'border-rose-500/40 bg-rose-500/[0.03]'
                  : isDegraded
                  ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : 'hover:border-[var(--border-medium)]'
              }`}
              onClick={() => handleToggleExpand(svc)}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
                      {svc.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                      {svc.name}
                    </h4>
                  </div>
                  <div>{getStatusBadge(svc.status)}</div>
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-2 min-h-[32px] leading-relaxed">
                  {svc.description}
                </p>

                {/* Base Simple Telemetry (Minimal) */}
                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>{svc.instances} Pods</span>
                  <span className="text-emerald-500 font-medium">{svc.uptime}% Uptime</span>
                  <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 font-sans">
                    {isExpanded ? (
                      <span className="text-indigo-400 font-medium">Hide Details ▲</span>
                    ) : (
                      <span>View Metrics ▼</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Reveal Detailed Telemetry only when selected/expanded */}
              {isExpanded && (
                <div
                  className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3.5 animate-in fade-in duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Detailed Diagnostics & Resources
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] text-[var(--text-muted)] font-sans">Latency (P99)</div>
                      <div
                        className={`text-base font-semibold mt-0.5 tabular-nums ${
                          svc.latency > 1000
                            ? 'text-rose-500'
                            : svc.latency > 250
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {svc.latency}ms
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] text-[var(--text-muted)] font-sans">Error Rate</div>
                      <div
                        className={`text-base font-semibold mt-0.5 tabular-nums ${
                          svc.errorRate > 10
                            ? 'text-rose-500'
                            : svc.errorRate > 2
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {svc.errorRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* CPU Load Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 font-sans">
                        <Cpu className="w-3.5 h-3.5" /> CPU Utilization
                      </span>
                      <span className="font-mono text-[var(--text-primary)] font-medium">
                        {svc.cpu}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--tag-bg)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          svc.cpu > 85
                            ? 'bg-rose-500'
                            : svc.cpu > 70
                            ? 'bg-amber-400'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${svc.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* Upstream / Downstream Dependencies */}
                  <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                    <div className="font-mono text-[10px]">Service Port: 8080 · Cluster Mesh: Envoy</div>
                  </div>

                  {/* 1-Click to Website Deep Details (Overview, Attributes, Incidents, Logs) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onInspectWebsite && onInspectWebsite(svc)}
                      className="w-full notch-btn-primary py-2 text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <span>Website Details (Overview, Attributes, Incidents, Logs)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
