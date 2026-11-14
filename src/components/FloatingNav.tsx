import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Mic,
  Menu,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { TarsierLogo } from './TarsierLogo';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Incident, ServiceHealth } from '../types';

export type NavTab = 'overview' | 'services' | 'incidents' | 'investigation' | 'recovery' | 'reports';

interface FloatingNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  incidents: Incident[];
  services: ServiceHealth[];
  onOpenVoiceAssistant: () => void;
  onSimulateScenario: (scenarioId?: string) => void;
  onResetAll: () => void;
  user?: { name: string; email: string } | null;
  onSignOut?: () => void;
  onNavigateWelcome?: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  currentTab,
  onSelectTab,
  incidents,
  services,
  onOpenVoiceAssistant,
  onSimulateScenario,
  onResetAll,
  user,
  onSignOut,
  onNavigateWelcome,
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isChaosMenuOpen, setIsChaosMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const isHealthy = activeIncidents.length === 0;

  const navItems: { id: NavTab; label: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'incidents', label: 'Incidents', badge: activeIncidents.length },
    { id: 'investigation', label: 'AI Assistant' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'reports', label: 'Reports' },
  ];

  const scenarios = [
    { id: 'payment-failure', label: 'Payment Gateway Connection Pool Starvation', service: 'payment-service' },
    { id: 'cascade-failure', label: 'Auth Token Cache Collapse', service: 'auth-service' },
    { id: 'cache-stampede', label: 'Redis Key Eviction Spike', service: 'cache-cluster' },
    { id: 'db-lockup', label: 'Deadlock in Inventory Database', service: 'inventory-db' },
  ];

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl transition-all duration-300">
        <div className="notch-pill px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl relative">
          
          {/* Left: Brand Logo & Product Name */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center text-left group cursor-pointer focus:outline-none"
              title="TARSIER Home"
            >
              <TarsierLogo size={28} showWordmark={true} />
              <span className="hidden lg:inline-block ml-2 w-1.5 h-1.5 rounded-full" style={{
                backgroundColor: isHealthy ? '#10b981' : criticalCount > 0 ? '#f43f5e' : '#f59e0b'
              }}></span>
            </button>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[var(--tag-bg)] border border-[var(--border-subtle)]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`relative px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Chaos Trigger, Theme Selector, Voice Assistant Pill, Mobile Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Chaos Scenarios Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsChaosMenuOpen(!isChaosMenuOpen);
                  setIsThemeMenuOpen(false);
                }}
                className="notch-btn-ghost text-xs px-2.5 py-1.5 flex items-center space-x-1 cursor-pointer"
                title="Inject Chaos or Reset State"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-mono text-[11px]">Chaos</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {isChaosMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsChaosMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl notch-card p-2 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 border border-[var(--border-subtle)]">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                      <span>Inject Fault Scenario</span>
                      <span className="text-rose-500 font-semibold">Live Sandbox</span>
                    </div>

                    <div className="space-y-1">
                      {scenarios.map((sc) => (
                        <button
                          key={sc.id}
                          onClick={() => {
                            onSimulateScenario(sc.id);
                            setIsChaosMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[var(--tag-bg)] transition-colors flex flex-col space-y-0.5 cursor-pointer text-[var(--text-primary)]"
                        >
                          <span className="font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                            {sc.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono pl-3">
                            Target: {sc.service}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between px-1">
                      <button
                        onClick={() => {
                          onResetAll();
                          setIsChaosMenuOpen(false);
                        }}
                        className="w-full py-1.5 text-center text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset All 12 Services
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Capsule */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                  setIsChaosMenuOpen(false);
                }}
                className="notch-btn-ghost p-1.5 sm:px-2 sm:py-1.5 flex items-center space-x-1 cursor-pointer"
                title={`Theme: ${themeMode} (${resolvedTheme})`}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="hidden sm:inline text-[11px] capitalize font-medium">
                  {themeMode}
                </span>
              </button>

              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 rounded-2xl notch-card p-1.5 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 border border-[var(--border-subtle)]">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.mode}
                        onClick={() => {
                          setThemeMode(opt.mode);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          themeMode === opt.mode
                            ? 'bg-[var(--tag-bg)] text-[var(--text-primary)] font-semibold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]'
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* User Account / Navigation Control */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="notch-btn-ghost p-1.5 sm:px-2.5 sm:py-1.5 flex items-center space-x-1.5 text-xs"
                  title={`Signed in as ${user.name}`}
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-semibold flex items-center justify-center text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-[11px] font-medium truncate max-w-[80px]">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {isAccountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl notch-card p-2 shadow-2xl z-50 text-left border border-[var(--border-subtle)] animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] mb-1">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          if (onNavigateWelcome) onNavigateWelcome();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs hover:bg-[var(--tag-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        Landing & Welcome
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onNavigateWelcome}
                className="notch-btn-ghost text-xs px-2.5 py-1.5"
                title="Return to Welcome"
              >
                Welcome
              </button>
            )}

            {/* Notch-Style Primary White Action Button: TARSIER Voice */}
            <button
              type="button"
              onClick={onOpenVoiceAssistant}
              className="notch-btn-primary text-xs px-3 sm:px-3.5 py-1.5 shadow-sm"
              title="Launch TARSIER Voice (⌘K)"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">TARSIER Voice</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden notch-btn-ghost p-1.5"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 notch-card p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--tag-bg)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--tag-bg)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-rose-500/15 text-rose-500 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
