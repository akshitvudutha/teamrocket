import React from 'react';
import { TarsierLogo } from './TarsierLogo';
import {
  Brain,
  ShieldCheck,
  Mic,
  Zap,
  Activity,
  ArrowRight,
  Server,
  Lock,
  Terminal,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WelcomePageProps {
  onEnterDashboard: () => void;
  onNavigateSignIn: () => void;
  onNavigateRegister: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onEnterDashboard,
  onNavigateSignIn,
  onNavigateRegister,
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased relative selection:bg-blue-500/20 selection:text-blue-400 overflow-x-hidden">
      
      {/* Electric blue subtle ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Welcome Navigation Bar */}
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl transition-all duration-300">
        <div className="notch-pill px-4 py-2.5 flex items-center justify-between shadow-2xl relative border border-[var(--border-subtle)]">
          {/* Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <TarsierLogo size={28} showWordmark={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs text-[var(--text-secondary)] font-medium">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Capabilities
            </a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">
              Architecture
            </a>
            <a href="#benchmarks" className="hover:text-blue-400 transition-colors">
              SRE Benchmarks
            </a>
            <a
              href="https://github.com/akshitvudutha/teamrocket"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="notch-btn-ghost p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>

            {/* Sign In Button */}
            <button
              onClick={onNavigateSignIn}
              className="notch-btn-ghost text-xs px-3 py-1.5"
            >
              Sign In
            </button>

            {/* Primary Action: Enter Platform */}
            <button
              onClick={onEnterDashboard}
              className="notch-btn-primary text-xs px-4 py-1.5 shadow-sm bg-blue-600 hover:bg-blue-500 text-white"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 pt-32 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16 sm:space-y-24">
        <section className="text-center space-y-6">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/25 text-blue-400 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Autonomous Incident Commander v3.4 • Tier-1 SRE Resilience</span>
          </div>

          {/* Large Confident Apple Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.08]">
            Zero-Downtime Resilience.
            <br />
            <span className="text-[var(--text-muted)]">Powered by Watchful AI.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            TARSIER monitors distributed cloud microservices, isolates cascading root causes in seconds using Ollama, and executes verified runbooks behind deterministic human-in-the-loop safety gates.
          </p>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onEnterDashboard}
              className="notch-btn-primary px-7 py-3 text-xs sm:text-sm font-semibold shadow-xl shadow-blue-950/40 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Explore Live Platform</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onNavigateRegister}
              className="notch-btn-ghost px-6 py-3 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>Create Account</span>
            </button>
          </div>

          <div className="pt-2 text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 12 Microservices Ingested
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Non-Destructive Invariants
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-indigo-400" /> Hands-Free Voice AI (⌘K)
            </span>
          </div>
        </section>

        {/* INTERACTIVE TELEMETRY PREVIEW MOCKUP */}
        <section className="notch-card p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--border-medium)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Live Interactive Telemetry Stream
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Real-Time Anomaly Triage & Causal Reasoning
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                12/12 Services Operational
              </span>
              <button
                onClick={onEnterDashboard}
                className="notch-btn-ghost text-xs px-3 py-1 text-blue-400 hover:text-blue-300"
              >
                Open Terminal &rarr;
              </button>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Diagnosis Precision</div>
              <div className="text-xl font-semibold text-emerald-500">96.8% Accuracy</div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans">Ollama qwen2.5:7b local reasoner</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Autonomous MTTR</div>
              <div className="text-xl font-semibold text-blue-400">6.4 Minutes</div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans">82% faster than manual on-call</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] uppercase text-[var(--text-muted)] font-sans">Safety Guardrail</div>
              <div className="text-xl font-semibold text-indigo-400">100% Cryptographic</div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans">Human verification before mutation</p>
            </div>
          </div>
        </section>

        {/* 3 CORE CAPABILITIES (FEATURES) */}
        <section id="features" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Engineered for Enterprise SRE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              High-Concurrency Anomaly Defense
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Autonomous on-call intelligence built without compromises on safety or reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="notch-card p-6 space-y-3 hover:border-[var(--border-medium)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Multi-Agent Swarm
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Coordinated agents continuously ingest telemetry, isolate causal graphs, and formulate non-destructive runbooks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="notch-card p-6 space-y-3 hover:border-[var(--border-medium)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Deterministic Safety Gate
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Mandatory visual verification for cluster mutations. Defends against rogue commands and prompt-injection poisoning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="notch-card p-6 space-y-3 hover:border-[var(--border-medium)] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                TARSIER Voice Copilot
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Hands-free voice recognition with device speech synthesis, live animated AI waveform, and query execution via `⌘K`.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="notch-card p-8 sm:p-12 text-center space-y-5 bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-surface-elevated)] border border-[var(--border-medium)]">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Ready to upgrade your on-call resilience?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Experience TARSIER's autonomous incident response platform in interactive demonstration mode.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterDashboard}
              className="notch-btn-primary px-8 py-3 text-xs sm:text-sm font-semibold shadow-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            >
              <span>Launch Platform Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onNavigateSignIn}
              className="notch-btn-ghost px-6 py-3 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>Sign In to Workstation</span>
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-4 sm:px-8 text-center text-xs text-[var(--text-muted)] space-y-3">
        <div className="flex justify-center">
          <TarsierLogo size={24} showWordmark={true} />
        </div>
        <p className="font-mono text-[11px]">
          TARSIER • Autonomous AI Incident Response Platform • Built by Team Rocket
        </p>
        <div className="flex justify-center space-x-4 text-xs">
          <button onClick={onNavigateSignIn} className="hover:text-blue-400">Sign In</button>
          <span>•</span>
          <button onClick={onNavigateRegister} className="hover:text-blue-400">Register</button>
          <span>•</span>
          <button onClick={onEnterDashboard} className="hover:text-blue-400">Live Terminal</button>
          <span>•</span>
          <a href="https://github.com/akshitvudutha/teamrocket" target="_blank" rel="noreferrer" className="hover:text-blue-400">GitHub Repository</a>
        </div>
      </footer>
    </div>
  );
};
