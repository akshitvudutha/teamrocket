import React, { useState } from 'react';
import { TarsierLogo } from './TarsierLogo';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface SignInPageProps {
  onSignInSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateWelcome: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  onSignInSuccess,
  onNavigateRegister,
  onNavigateWelcome,
}) => {
  const [email, setEmail] = useState('sre.commander@tarsier.mesh');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignInSuccess();
    }, 600);
  };

  const handleInstantDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignInSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Electric Blue ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Back Pill */}
      <button
        onClick={onNavigateWelcome}
        className="absolute top-6 left-6 text-xs text-[var(--text-muted)] hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
      >
        &larr; Back to Welcome
      </button>

      {/* Main Container */}
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TarsierLogo size={36} showWordmark={true} wordmarkClassName="text-lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Sign In to TARSIER
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Access your autonomous on-call incident response terminal.
          </p>
        </div>

        {/* Glass Authentication Card */}
        <div className="notch-card p-7 sm:p-8 space-y-6 shadow-2xl border border-[var(--border-medium)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Demonstration mode: Instant password reset is active. Click Instant Demo to enter.');
                  }}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
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

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border-medium)] accent-blue-600"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 2FA Active
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full notch-btn-primary py-2.5 text-xs font-medium shadow-md mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating with Cluster...</span>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[var(--border-subtle)] w-full" />
            <span className="bg-[var(--bg-surface)] px-3 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider relative">
              Quick SRE Evaluation
            </span>
          </div>

          {/* 1-Click Demo Button */}
          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full notch-btn-ghost py-2.5 text-xs font-medium flex items-center justify-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Launch 1-Click Interactive Demo</span>
          </button>

          {/* Footer switch */}
          <div className="text-center pt-2">
            <p className="text-xs text-[var(--text-muted)]">
              Don't have a cluster account?{' '}
              <button
                onClick={onNavigateRegister}
                className="text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Register for TARSIER
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-[var(--text-muted)] font-mono">
          TARSIER v3.4 • Protected by Deterministic Safety Policy & mTLS Ingress
        </p>
      </div>
    </div>
  );
};
