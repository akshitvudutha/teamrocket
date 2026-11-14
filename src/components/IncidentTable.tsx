import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Search,
  Brain,
  Shield,
  CheckCircle2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { Incident, IncidentStatus, Severity } from '../types';

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string | null;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
}) => {
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.affectedServiceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/15 text-rose-500 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Brain className="w-3 h-3 animate-spin text-indigo-400" />
            Investigating
          </span>
        );
      case 'IDENTIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Identified
          </span>
        );
      case 'MITIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Shield className="w-3 h-3 text-amber-500" />
            Mitigating
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Recovering
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 notch-card p-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filter incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-medium)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | 'ALL')}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-medium)] cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'ALL')}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-medium)] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="IDENTIFIED">Identified</option>
            <option value="MITIGATING">Mitigating</option>
            <option value="RECOVERING">Recovering</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-2.5">
        {filteredIncidents.length === 0 ? (
          <div className="notch-card p-12 text-center text-xs text-[var(--text-muted)]">
            No incidents found matching current filters.
          </div>
        ) : (
          filteredIncidents.map((inc) => {
            const isSelected = selectedIncidentId === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`notch-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'ring-1 ring-[var(--border-highlight)] border-[var(--border-medium)] bg-[var(--bg-surface-elevated)]'
                    : 'hover:border-[var(--border-medium)]'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                      {inc.id}
                    </span>
                    {getSeverityBadge(inc.severity)}
                    {getStatusBadge(inc.status)}
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      · {inc.affectedServiceName}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    {inc.title}
                  </h4>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
                    {inc.rootCause.summary}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-500 font-mono mt-0.5">
                      {inc.rootCause.aiConfidence}% Conf.
                    </div>
                  </div>

                  <button className="notch-btn-primary text-xs px-3.5 py-1.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
