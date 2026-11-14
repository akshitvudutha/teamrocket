import React, { useState } from 'react';
import { TarsierLogo } from './TarsierLogo';
import { ArrowRight, Lock, Mail, User, Building, ShieldCheck, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateSignIn: () => void;
  onNavigateWelcome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateSignIn,
  onNavigateWelcome,
}) => {
  const [fullName, setFullName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@enterprise.io');
  const [organization, setOrganization] = useState('Acme E-Commerce Mesh');
  const [password, setPassword] = useState('••••••••••••');
  const [agreePolicy, setAgreePolicy] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 600);
  };

  const handleInstantDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient electric blue blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Back Pill */}
      <button
        onClick={onNavigateWelcome}
        className="absolute top-6 left-6 text-xs text-[var(--text-muted)] hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
      >
        &larr; Back to Welcome
      </button>

      {/* Main Form Box */}
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TarsierLogo size={36} showWordmark={true} wordmarkClassName="text-lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Create TARSIER Account
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Equip your engineering team with autonomous on-call resilience.
          </p>
        </div>

        <div className="notch-card p-7 sm:p-8 space-y-5 shadow-2xl border border-[var(--border-medium)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Alex Chen"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@company.com"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Cluster / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                  placeholder="e.g. Production Cluster East"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Master Passkey</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-xs text-[var(--text-muted)] text-left">
              <input
                type="checkbox"
                checked={agreePolicy}
                onChange={(e) => setAgreePolicy(e.target.checked)}
                required
                className="mt-0.5 rounded border-[var(--border-medium)] accent-blue-600"
              />
              <span className="leading-snug">
                I agree to the deterministic safety policy and mandatory human verification for infrastructure mutation.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full notch-btn-primary py-2.5 text-xs font-medium shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Provisioning SRE Tenant...</span>
              ) : (
                <>
                  <span>Create Account & Enter Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[var(--border-subtle)] w-full" />
            <span className="bg-[var(--bg-surface)] px-3 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider relative">
              Instant Access
            </span>
          </div>

          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full notch-btn-ghost py-2.5 text-xs font-medium flex items-center justify-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Skip Setup & Launch Live Demo</span>
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-[var(--text-muted)]">
              Already have an account?{' '}
              <button
                onClick={onNavigateSignIn}
                className="text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
