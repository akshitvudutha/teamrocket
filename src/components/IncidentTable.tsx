import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
  Brain,
  Shield,
  CheckCircle2,
  Filter,
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-blue-500/10 text-blue-300 border border-blue-500/20">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Brain className="w-3 h-3 animate-spin text-purple-400" />
            Investigating
          </span>
        );
      case 'IDENTIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Causal Identified
          </span>
        );
      case 'MITIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3 text-amber-400" />
            Mitigating
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Recovering
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#131622]/80 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-xs transition-colors">
      {/* Table Toolbar Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <h3 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
            Incident Telemetry Stream
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
            {filteredIncidents.length} Records
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/[0.2] w-48 sm:w-56 font-sans"
            />
          </div>

          {/* Severity Select */}
          <div className="flex items-center space-x-1 text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Severity | 'ALL')}
              className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/[0.2]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | 'ALL')}
            className="bg-black/40 border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-white/[0.2]"
          >
            <option value="ALL">All Statuses</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="IDENTIFIED">Identified</option>
            <option value="MITIGATING">Mitigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-black/20 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-medium">Severity</th>
              <th className="py-2.5 px-4 font-medium">Incident Details</th>
              <th className="py-2.5 px-4 font-medium">Affected Service</th>
              <th className="py-2.5 px-4 font-medium">Timeline</th>
              <th className="py-2.5 px-4 font-medium">AI Confidence</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400 font-sans">
                  No incidents matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = selectedIncidentId === incident.id;
                const isCritical = incident.severity === 'CRITICAL' && incident.status !== 'RESOLVED';

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-white/[0.08]'
                        : isCritical
                        ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.06]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(incident.severity)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-white flex items-center space-x-2">
                        <span className="font-mono text-rose-400 text-[11px]">{incident.id}</span>
                        <span className="text-slate-200 line-clamp-1 text-xs">{incident.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {incident.summary}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-200 text-xs">{incident.affectedServiceName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {incident.affectedServiceId}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {incident.detectedAt}
                      </div>
                      {incident.resolvedAt && (
                        <div className="text-emerald-400 text-[10px]">
                          Resolved: {incident.resolvedAt}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-black/40 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${incident.rootCause.aiConfidence}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[10px] text-purple-300 font-medium tabular-nums">
                          {incident.rootCause.aiConfidence}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(incident.status)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-medium transition-all border border-white/[0.08] cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
