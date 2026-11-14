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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-red-950/90 text-red-300 border border-red-700/80 shadow-sm shadow-red-950">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-amber-950/80 text-amber-300 border border-amber-700/80">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-yellow-950/70 text-yellow-300 border border-yellow-700/60">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider uppercase bg-blue-950/70 text-blue-300 border border-blue-800/60">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800">
            <Brain className="w-3 h-3 animate-spin text-purple-400" />
            Investigating
          </span>
        );
      case 'IDENTIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800">
            Root Cause Found
          </span>
        );
      case 'MITIGATING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
            <Shield className="w-3 h-3 text-amber-400" />
            Mitigating
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            Recovering
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Incident Monitor Feed
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {filteredIncidents.length} Records
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 w-48 sm:w-56"
            />
          </div>

          {/* Severity Select */}
          <div className="flex items-center space-x-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Severity | 'ALL')}
              className="bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
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
            className="bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
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
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Severity</th>
              <th className="py-3 px-4 font-semibold">Incident Details</th>
              <th className="py-3 px-4 font-semibold">Affected Service</th>
              <th className="py-3 px-4 font-semibold">Detected / Duration</th>
              <th className="py-3 px-4 font-semibold">AI Confidence</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
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
                        ? 'bg-rose-950/20'
                        : isCritical
                        ? 'bg-red-950/10 hover:bg-red-950/20'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityBadge(incident.severity)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 flex items-center space-x-2">
                        <span className="font-mono text-rose-400">{incident.id}</span>
                        <span className="text-slate-300 line-clamp-1">{incident.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {incident.summary}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{incident.affectedServiceName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {incident.affectedServiceId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
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

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${incident.rootCause.aiConfidence}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] text-purple-300 font-semibold">
                          {incident.rootCause.aiConfidence}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(incident.status)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 text-xs font-semibold transition border border-slate-700 cursor-pointer"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
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
