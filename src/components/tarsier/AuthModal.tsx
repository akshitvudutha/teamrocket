import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User, Building, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types/tarsier';
import { INITIAL_USER } from '../../data/tarsierMockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'signin',
  onLoginSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      name: name.trim() || (activeTab === 'signin' ? 'Vikrant S.' : 'SRE Engineer'),
      email: email.trim() || 'sre@rocket.team',
      role: 'Lead SRE Commander',
      organization: org.trim() || 'Team Rocket Cloud Operations',
    };
    onLoginSuccess(newUser);
  };

  const handleFastDemoLogin = () => {
    onLoginSuccess(INITIAL_USER);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D0D10] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#7055FF] p-[1px]">
            <div className="w-full h-full bg-[#0D0D10] rounded-[11px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#007AFF]" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              TARSIER
              <span className="text-xs font-normal text-neutral-400">| SRE Access</span>
            </div>
            <div className="text-xs text-neutral-400">Team Rocket • Night Guard Incident Platform</div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#15151A] p-1 border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Fast-Track Demo Login Pill (Recommended for Evaluators) */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleFastDemoLogin}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#007AFF]/20 via-[#7055FF]/20 to-transparent border border-[#007AFF]/30 hover:border-[#007AFF] text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#007AFF]" />
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-[#007AFF] transition-colors">
                  One-Click Demo SRE Sign In
                </div>
                <div className="text-[11px] text-neutral-400">Preloaded with 6 websites & live incident</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#007AFF] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0D0D10] px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            or continue with credentials
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikrant S."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Organization</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. Team Rocket SRE"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-300">Password</label>
              {activeTab === 'signin' && (
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Click "One-Click Demo SRE Sign In" above!')}
                  className="text-[11px] text-[#007AFF] hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#15151A] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-sm font-semibold shadow-[0_0_20px_rgba(0,122,255,0.3)] hover:shadow-[0_0_25px_rgba(0,122,255,0.5)] transition-all cursor-pointer"
          >
            {activeTab === 'signin' ? 'Sign In to Night Guard' : 'Create Operator Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
