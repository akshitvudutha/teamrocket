import React from 'react';
import {
  ShieldCheck,
  Globe2,
  Lock,
  ArrowRight,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { AppView } from '../../types/tarsier';

interface WelcomePageProps {
  onNavigate: (view: AppView) => void;
  onOpenAuth: (initialTab: 'signin' | 'register') => void;
}

export function WelcomePage({ onNavigate, onOpenAuth }: WelcomePageProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-black text-white overflow-hidden">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#007AFF]/15 via-[#7055FF]/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#15151A] border border-white/10 mb-8 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#007AFF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007AFF]"></span>
          </span>
          <span className="text-xs font-medium text-neutral-300">
            Next-Gen Autonomous SRE Incident Response
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-xs font-semibold text-[#007AFF]">Team Rocket</span>
        </div>

        {/* Centered Large Title */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-3">
          TARSIER
        </h1>

        {/* Directly Below Tagline */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight bg-gradient-to-r from-[#007AFF] via-[#7055FF] to-white bg-clip-text text-transparent mb-6">
          Your Night Guard
        </h2>

        {/* Supporting Text */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-400 font-normal leading-relaxed mb-10">
          Protect your websites, detect issues early, and keep you informed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-16">
          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#007AFF] hover:bg-[#0066D6] text-white font-medium text-base px-8 py-3.5 rounded-xl shadow-[0_0_25px_rgba(0,122,255,0.35)] hover:shadow-[0_0_35px_rgba(0,122,255,0.5)] transition-all cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('feature-showcase');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#15151A] hover:bg-[#1E1E24] text-neutral-300 hover:text-white font-medium text-base px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <span>Learn More</span>
          </button>
        </div>

        {/* Interactive Preview Card: Live Night Guard Telemetry Mock */}
        <div className="relative max-w-4xl mx-auto rounded-2xl bg-[#0D0D10] border border-white/10 p-4 sm:p-6 shadow-2xl overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs font-mono text-neutral-400">
                tarsier-night-guard.probe.live — 6 Monitored Targets
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● SURVEILLANCE ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#15151A] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Global Fleet Health</div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                99.94%
                <span className="text-xs font-semibold text-emerald-400">SLA Met</span>
              </div>
            </div>
            <div className="bg-[#15151A] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Average Response Time</div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                42 ms
                <span className="text-xs font-semibold text-neutral-400">p95</span>
              </div>
            </div>
            <div className="bg-[#15151A] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Active Incident Analysis</div>
              <div className="text-2xl font-bold text-amber-400 flex items-baseline gap-2">
                1 Alert
                <span className="text-xs font-medium text-neutral-400">Root Cause Isolated</span>
              </div>
            </div>
          </div>

          <div className="bg-[#15151A]/80 rounded-xl p-4 border border-white/5 font-mono text-xs text-neutral-300 space-y-1.5 overflow-x-auto">
            <div className="flex items-center justify-between text-neutral-400 border-b border-white/5 pb-2 mb-2">
              <span>TARGET URL</span>
              <span>PROTOCOL</span>
              <span>LATENCY</span>
              <span>STATUS</span>
            </div>
            <div className="flex items-center justify-between hover:bg-white/[0.02] py-1 px-1 rounded transition-colors">
              <span className="text-white font-medium">store.rocket.io</span>
              <span className="text-neutral-400">HTTPS / TLS 1.3</span>
              <span className="text-amber-400 font-semibold">148 ms</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">WARNING</span>
            </div>
            <div className="flex items-center justify-between hover:bg-white/[0.02] py-1 px-1 rounded transition-colors">
              <span className="text-white font-medium">api.rocket-cloud.net</span>
              <span className="text-neutral-400">REST Ingress</span>
              <span className="text-red-400 font-semibold">14,200 ms</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-semibold border border-red-500/30">DOWN (504)</span>
            </div>
            <div className="flex items-center justify-between hover:bg-white/[0.02] py-1 px-1 rounded transition-colors">
              <span className="text-white font-medium">auth.rocket.id</span>
              <span className="text-neutral-400">OIDC / ZeroTrust</span>
              <span className="text-emerald-400 font-semibold">22 ms</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">HEALTHY</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
            <span>AI Reasoning: HikariCP pool lock contention on backend order-engine isolated.</span>
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-[#007AFF] hover:underline flex items-center gap-1 font-medium"
            >
              Open Fleet Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section (Approved Composition) */}
      <section id="feature-showcase" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#007AFF] mb-3">
            ARCHITECTURAL ADVANTAGES
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Engineered for High-Concurrency Cloud Systems
          </p>
          <p className="text-neutral-400 text-base">
            TARSIER operates silently in the background, continuously testing your endpoints, extracting telemetry, and preempting outages before your customers notice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Region Probing */}
          <div className="bg-[#15151A] rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center mb-6 text-[#007AFF] group-hover:scale-105 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">24/7 Global Surveillance</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Multi-region synthetic ping, HTTP/2, and TLS checks from North America, Europe, and Asia-Pacific every 15-30 seconds with sub-second alerting.
            </p>
          </div>

          {/* Card 2: AI Causal Night Guard */}
          <div className="bg-[#15151A] rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#7055FF]/10 border border-[#7055FF]/20 flex items-center justify-center mb-6 text-[#7055FF] group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Causal Diagnostics</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Causal hypothesis reasoning isolates patient-zero root causes in complex multi-service architectures without drowning your engineers in noisy logs.
            </p>
          </div>

          {/* Card 3: Prompt-Injection Defense */}
          <div className="bg-[#15151A] rounded-2xl p-7 border border-white/10 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Threat Shield & Guardrails</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Quarantines adversarial prompt injection attempts embedded in log streams and enforces deterministic, non-LLM safety guardrails and change freezes.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 text-center">
        <div className="bg-[#0D0D10] rounded-2xl border border-white/10 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Built by Team Rocket for Autonomous Reliability
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
            TARSIER brings together deep microservices topology analysis, synthetic telemetry pipelines, local LLM structured JSON reasoning, and deterministic human-in-the-loop safety.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="bg-[#15151A] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Architecture</div>
              <div className="text-sm font-semibold text-white">12 Microservices</div>
            </div>
            <div className="bg-[#15151A] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Inference Engine</div>
              <div className="text-sm font-semibold text-white">Local Ollama LLM</div>
            </div>
            <div className="bg-[#15151A] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Throughput</div>
              <div className="text-sm font-semibold text-white">170k+ logs/sec</div>
            </div>
            <div className="bg-[#15151A] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-neutral-400 mb-1">Defense Precision</div>
              <div className="text-sm font-semibold text-white">100% Zero-Bypass</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
            <span className="text-neutral-400 font-medium">TARSIER — Your Night Guard</span>
            <span>•</span>
            <span>Developed by Team Rocket</span>
          </div>
          <div>All rights reserved. Built for SRE and Cloud Operations.</div>
        </div>
      </footer>
    </div>
  );
}
