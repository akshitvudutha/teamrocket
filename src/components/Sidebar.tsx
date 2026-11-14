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
      badge: null,
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incidents',
      icon: AlertOctagon,
      badge: activeIncidentCount > 0 ? activeIncidentCount : null,
      badgeColor: criticalIncidentCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'services' as NavTab,
      label: 'Services',
      icon: Server,
      badge: servicesCount,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'investigation' as NavTab,
      label: 'AI Investigation',
      icon: BrainCircuit,
      badge: 'LIVE',
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-800 animate-pulse',
    },
    {
      id: 'recovery' as NavTab,
      label: 'Recovery',
      icon: ShieldCheck,
      badge: activeIncidentCount > 0 ? 'ACTIVE' : null,
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports',
      icon: FileBarChart,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Navigation Items */}
        <div className="px-3 py-4">
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Navigation Console
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-rose-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md tracking-tight ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Agent Realtime Status */}
        <div className="px-4 mt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-200">Rocket Copilot</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Monitoring telemetry logs, calculating blast radius, & correlating traces in real time.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
              <span>Model: Gemini 2.5 Flash</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Gate Guardrail Status */}
      <div className="p-4 border-t border-slate-900">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3 text-xs">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-300 text-[11px]">Safety Approval Gate</div>
            <div className="text-[10px] text-slate-500">Human-In-The-Loop Enforced</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
