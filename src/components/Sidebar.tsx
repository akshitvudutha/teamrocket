import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  Server,
  BrainCircuit,
  ShieldCheck,
  FileBarChart,
  Bot,
  Lock,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'overview' | 'incidents' | 'services' | 'investigation' | 'recovery' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentCount: number;
  criticalIncidentCount: number;
  servicesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentCount,
  criticalIncidentCount,
  servicesCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      shortcut: '1',
      badge: null,
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incidents',
      icon: AlertOctagon,
      shortcut: '2',
      badge: activeIncidentCount > 0 ? activeIncidentCount : null,
      badgeColor:
        criticalIncidentCount > 0
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'services' as NavTab,
      label: 'Services',
      icon: Server,
      shortcut: '3',
      badge: servicesCount,
      badgeColor: 'bg-white/[0.06] text-slate-300 border border-white/[0.08]',
    },
    {
      id: 'investigation' as NavTab,
      label: 'AI Investigation',
      icon: BrainCircuit,
      shortcut: '4',
      badge: 'Live',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25',
    },
    {
      id: 'recovery' as NavTab,
      label: 'Recovery',
      icon: ShieldCheck,
      shortcut: '5',
      badge: activeIncidentCount > 0 ? 'Active' : null,
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    },
    {
      id: 'reports' as NavTab,
      label: 'Postmortems',
      icon: FileBarChart,
      shortcut: '6',
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0c12]/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none transition-colors">
      <div>
        {/* Navigation Items */}
        <div className="px-3 py-4">
          <div className="px-3 mb-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
            Workspaces
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-mono font-medium rounded-full uppercase tracking-tight ${
                          item.badgeColor || 'bg-white/[0.06] text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span className="hidden group-hover:inline-block text-[10px] font-mono text-slate-400 px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      {item.shortcut}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Copilot Status Card */}
        <div className="px-3.5 mt-2">
          <div className="p-3.5 rounded-2xl bg-[#131620]/80 border border-white/[0.08] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-slate-200">Rocket AI Engine</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizing distributed traces, anomaly root causes, and blast radius in real time.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-slate-400 font-mono">
              <span>Local Ollama</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safety Gate Status */}
      <div className="p-3.5 border-t border-white/[0.06]">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center space-x-2.5 text-xs">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-medium text-slate-200 text-xs">Safety Guardrail</div>
            <div className="text-[11px] text-slate-400">Human Approval Required</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
