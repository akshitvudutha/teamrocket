import React from 'react';
import {
  Shield,
  Radio,
  User,
  LifeBuoy,
  LogOut,
  LayoutDashboard,
  Mic,
  Sun,
  Moon,
} from 'lucide-react';
import { AppView, UserProfile } from '../../types/tarsier';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (initialTab: 'signin' | 'register') => void;
  user: UserProfile | null;
  onLogout: () => void;
  activeIncidentsCount: number;
  onOpenVoice: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  onOpenAuth,
  user,
  onLogout,
  activeIncidentsCount,
  onOpenVoice,
  isDarkMode = true,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Branding */}
        <div
          onClick={() => onNavigate(user ? 'dashboard' : 'welcome')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#7055FF] p-[1px] shadow-sm group-hover:shadow-[0_0_15px_rgba(0,122,255,0.4)] transition-all">
            <div className="w-full h-full bg-[#0D0D10] rounded-[11px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#007AFF] group-hover:text-white transition-colors" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-300 transition-colors">
              Team Rocket
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              TARSIER
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-ping" />
            </span>
          </div>
        </div>

        {/* Live Surveillance Indicator (When In App) */}
        {currentView !== 'welcome' && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#15151A] border border-white/5 text-xs text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-neutral-400 font-medium">Night Guard:</span>
            <span className="text-white font-medium">Active</span>
            {activeIncidentsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 font-semibold text-[10px] border border-red-500/30">
                {activeIncidentsCount} Active Alert{activeIncidentsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Right Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Voice Assistant Trigger Button */}
          <button
            onClick={onOpenVoice}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#15151A] hover:bg-[#1E1E26] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 hover:border-[#007AFF]/40 transition-all cursor-pointer group shadow-sm"
            title="Launch TARSIER Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-[#007AFF] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Optional Dark / Light Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl bg-[#15151A] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          )}

          {currentView === 'welcome' ? (
            <>
              <button
                onClick={() => onNavigate('welcome')}
                className="text-sm font-medium text-white hover:text-[#007AFF] px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('about-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-medium text-neutral-400 hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#15151A] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-sm font-medium bg-[#007AFF] hover:bg-[#0066D6] text-white px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-[0_0_15px_rgba(0,122,255,0.4)] transition-all cursor-pointer"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`text-sm font-medium flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#15151A] text-white border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-[#15151A]/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Fleet</span>
              </button>
              <button
                onClick={() => onNavigate('support')}
                className={`text-sm font-medium flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'support'
                    ? 'bg-[#15151A] text-white border border-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-[#15151A]/60'
                }`}
              >
                <LifeBuoy className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#15151A] border border-white/10 flex items-center justify-center text-xs font-semibold text-[#007AFF]">
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="hidden lg:block text-left text-xs leading-tight">
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-neutral-400">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-[#15151A] rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="text-sm font-medium bg-[#007AFF] hover:bg-[#0066D6] text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
