import React, { useState } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  Mail,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  Shield,
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MonitoredWebsite } from '../../types/tarsier';

interface SupportViewProps {
  websites: MonitoredWebsite[];
  onBackToDashboard: () => void;
  onShowToast: (title: string, desc: string, type: 'success' | 'alert' | 'info') => void;
}

export function SupportView({ websites, onBackToDashboard, onShowToast }: SupportViewProps) {
  const [subject, setSubject] = useState('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(websites[0]?.id || '');
  const [severity, setSeverity] = useState<'sev1' | 'sev2' | 'sev3'>('sev1');
  const [description, setDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newTicketId = `SRE-${Math.floor(Math.random() * 9000 + 1000)}`;
    setTicketId(newTicketId);
    setTicketSubmitted(true);
    onShowToast(
      `Support Ticket Dispatched: ${newTicketId}`,
      `Team Rocket on-call primary pager alerted. SLA target: < 15 mins.`,
      'success'
    );
  };

  const handleExportTelemetry = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            platform: 'TARSIER — Your Night Guard',
            exportedAt: new Date().toISOString(),
            surveilledWebsites: websites,
            team: 'Team Rocket',
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tarsier-telemetry-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('Diagnostic Bundle Exported', 'Downloaded full fleet telemetry package.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#007AFF] mb-1">
            <LifeBuoy className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>24/7 Operations & Escalation Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Contact Support & SRE Command
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Dispatch urgent incident tickets, export diagnostic telemetry, and connect with Team Rocket engineers.
          </p>
        </div>

        <button
          onClick={handleExportTelemetry}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#15151A] hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#007AFF]" />
          <span>Export Fleet Diagnostics (.json)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Incident Ticket Dispatch Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#15151A] rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl">
            {ticketSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Ticket Dispatched: {ticketId}
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Your Sev-{severity.replace('sev', '')} notification has been routed to the Team Rocket on-call rotation. Night Guard automated telemetry has been attached to the diagnostic payload.
                </p>
                <div className="pt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setTicketSubmitted(false);
                      setSubject('');
                      setDescription('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0D0D10] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    Open Another Ticket
                  </button>
                  <button
                    onClick={onBackToDashboard}
                    className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold shadow-sm"
                  >
                    Return to Fleet Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">
                  Dispatch Escalation Ticket
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Target Monitored Website
                    </label>
                    <select
                      value={selectedWebsiteId}
                      onChange={(e) => setSelectedWebsiteId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D10] border border-white/10 text-xs text-white focus:outline-none focus:border-[#007AFF]"
                    >
                      {websites.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.url.replace('https://', '')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Escalation Severity
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSeverity('sev1')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          severity === 'sev1'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : 'bg-[#0D0D10] text-neutral-400 border-white/5'
                        }`}
                      >
                        Sev-1 (Critical)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeverity('sev2')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          severity === 'sev2'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                            : 'bg-[#0D0D10] text-neutral-400 border-white/5'
                        }`}
                      >
                        Sev-2 (Degraded)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSeverity('sev3')}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          severity === 'sev3'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            : 'bg-[#0D0D10] text-neutral-400 border-white/5'
                        }`}
                      >
                        Sev-3 (Inquiry)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Incident Summary / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 504 timeouts on checkout route during flash sale"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D10] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Diagnostic Telemetry / Observations
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details or symptoms observed..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D10] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#007AFF] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(0,122,255,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Emergency SRE Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SRE Knowledge Base & FAQ */}
          <div className="bg-[#15151A] rounded-2xl p-6 sm:p-7 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#7055FF]" />
              <span>Night Guard SRE Quick Reference</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">
                  How does TARSIER isolate dual-cause failures?
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  TARSIER evaluates multi-service topology DAGs to differentiate independent upstream timeouts (e.g. 3rd-party shipping APIs) from internal database pool starvation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">
                  How are prompt-injection attacks quarantined?
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Untrusted telemetry from customer inputs and external tool outputs is filtered by regex threat analyzers and wrapped in XML boundary tags, preventing system directive overrides.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5">
                <div className="font-semibold text-white mb-1">
                  What is the Deterministic Human Safety Gate?
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  During organizational change freezes, destructive remediation actions are hard-blocked by non-LLM code until approved by an authorized SRE engineer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Emergency Contacts & Architecture */}
        <div className="space-y-6">
          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#007AFF]">
              On-Call Escalation Matrix
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Akshit V.</div>
                  <div className="text-neutral-400">Backend Core & AI Lead</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  PRIMARY
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Vikrant S.</div>
                  <div className="text-neutral-400">Frontend Dashboard Lead</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300 font-semibold">
                  SECONDARY
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Ritesh G.</div>
                  <div className="text-neutral-400">Chaos & Evaluation Lead</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300 font-semibold">
                  ON-CALL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#15151A] rounded-2xl p-6 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <Shield className="w-4 h-4 text-[#007AFF]" />
              <span>Team Rocket Incident Guarantee</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every synthetic probe is recorded with sub-millisecond precision. All incident reports adhere to blameless post-mortem standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
