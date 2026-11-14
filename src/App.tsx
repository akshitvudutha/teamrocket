import React, { useState, useEffect } from 'react';
import { FloatingNav, NavTab } from './components/FloatingNav';
import { OverviewStats } from './components/OverviewStats';
import { ServiceGrid } from './components/ServiceGrid';
import { IncidentTable } from './components/IncidentTable';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AiInvestigationView } from './components/AiInvestigationView';
import { RecoveryView } from './components/RecoveryView';
import { ReportsView } from './components/ReportsView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ThemeProvider } from './context/ThemeContext';
import {
  getServices,
  getIncidents,
  simulateScenario,
  resetAllSimulations,
  approveRemediation,
  executeRecoveryProgress,
} from './services/incidentService';
import { Incident, ServiceHealth, VoiceCommandResponse } from './types';
import { CheckCircle2, ShieldAlert, Sparkles, X, Mic } from 'lucide-react';

function DashboardContent() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [modalInitialTab, setModalInitialTab] = useState<'rca' | 'metrics' | 'logs' | 'remediation' | 'recovery'>('rca');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'alert' | 'success' | 'info' } | null>(null);

  // Load initial data
  useEffect(() => {
    setServices(getServices());
    setIncidents(getIncidents());
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens Voice Assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsVoiceModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (title: string, desc: string, type: 'alert' | 'success' | 'info' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSimulateScenario = (scenarioId?: string) => {
    const { incident, service } = simulateScenario(scenarioId);
    setServices(getServices());
    setIncidents(getIncidents());
    setSelectedIncident(incident);
    showToast(
      `🚨 New Incident Ingested: ${incident.id}`,
      `Chaos injected into ${service.name}. AI Commander has generated root cause hypothesis.`,
      'alert'
    );
  };

  const handleResetAll = () => {
    resetAllSimulations();
    setServices(getServices());
    setIncidents(getIncidents());
    setSelectedIncident(null);
    setSelectedService(null);
    showToast(
      'System State Restored',
      'All 12 microservices returned to 100% operational baseline.',
      'success'
    );
  };

  const handleApproveRemediation = (incidentId: string) => {
    const updated = approveRemediation(incidentId);
    if (updated) {
      setIncidents(getIncidents());
      setServices(getServices());
      setSelectedIncident(updated);
      showToast(
        'Remediation Authorized',
        `Human on-call safety gate approved execution for ${incidentId}.`,
        'success'
      );
    }
  };

  const handleCompleteRecovery = (incidentId: string) => {
    const updated = executeRecoveryProgress(incidentId);
    if (updated) {
      setIncidents(getIncidents());
      setServices(getServices());
      setSelectedIncident(updated);
      showToast(
        'Incident Resolved',
        `${incidentId} telemetry stabilized and verified by automated canary probes.`,
        'success'
      );
    }
  };

  const handleSelectService = (svc: ServiceHealth) => {
    setSelectedService(svc);
    const relatedIncident = incidents.find(
      (i) => i.affectedServiceId === svc.id && i.status !== 'RESOLVED'
    );
    if (relatedIncident) {
      setSelectedIncident(relatedIncident);
    }
  };

  const handleVoiceAction = (action: VoiceCommandResponse['uiAction']) => {
    if (!action) return;

    switch (action.type) {
      case 'OPEN_INCIDENT': {
        const targetId = (action.payload?.incidentId as string) || 'INC-8092';
        const inc = incidents.find((i) => i.id === targetId) || incidents[0];
        if (inc) {
          setSelectedIncident(inc);
          setModalInitialTab('rca');
          showToast('Voice Command Executed', `Inspecting incident ${inc.id}`, 'info');
        }
        break;
      }
      case 'SELECT_SERVICE': {
        const serviceId = (action.payload?.serviceId as string) || 'svc-payment';
        const svc = services.find((s) => s.id === serviceId);
        if (svc) {
          handleSelectService(svc);
          setCurrentTab('services');
          showToast('Service Selected', `Viewing telemetry for ${svc.name}`, 'info');
        }
        break;
      }
      case 'SWITCH_TAB': {
        const targetTab = (action.payload?.tab as NavTab) || 'overview';
        setCurrentTab(targetTab);
        showToast('Tab Switched', `Navigated to ${targetTab} view`, 'info');
        break;
      }
      case 'SHOW_MODAL_TAB': {
        const tabName = (action.payload?.tab as 'rca' | 'remediation' | 'recovery' | 'logs' | 'metrics') || 'rca';
        const targetInc = selectedIncident || incidents.find((i) => i.status !== 'RESOLVED') || incidents[0];
        if (targetInc) {
          setModalInitialTab(tabName);
          setSelectedIncident(targetInc);
          if (tabName === 'remediation') {
            showToast('Safety Gate Active', 'Remediation requires manual on-call authorization.', 'alert');
          }
        }
        break;
      }
      case 'NONE':
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      
      {/* Centered Floating Capsule Navigation */}
      <FloatingNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        incidents={incidents}
        services={services}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onSimulateScenario={handleSimulateScenario}
        onResetAll={handleResetAll}
      />

      {/* Main Spacious Content Canvas */}
      <main className="flex-1 w-full pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="animate-in fade-in duration-200">
              <OverviewStats
                services={services}
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onSimulateScenario={handleSimulateScenario}
                onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            </div>
          )}

          {/* TAB 2: SERVICES */}
          {currentTab === 'services' && (
            <div className="animate-in fade-in duration-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5 pt-4 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Architecture Topology
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  12 Monitored Microservices
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Select any service to expand real-time P99 latency, error rates, CPU load, and pod allocation.
                </p>
              </div>

              <ServiceGrid
                services={services}
                onSelectService={handleSelectService}
                selectedServiceId={selectedService?.id}
              />
            </div>
          )}

          {/* TAB 3: INCIDENTS */}
          {currentTab === 'incidents' && (
            <div className="animate-in fade-in duration-200 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5 pt-4 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Incident Triage Stream
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Active & Historical Incidents
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Continuous telemetry anomalies triaged by Team Rocket AI Agent.
                </p>
              </div>

              <IncidentTable
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                selectedIncidentId={selectedIncident?.id}
              />
            </div>
          )}

          {/* TAB 4: AI ASSISTANT / INVESTIGATION */}
          {currentTab === 'investigation' && (
            <div className="animate-in fade-in duration-200">
              <AiInvestigationView
                incidents={incidents}
                services={services}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            </div>
          )}

          {/* TAB 5: RECOVERY */}
          {currentTab === 'recovery' && (
            <div className="animate-in fade-in duration-200">
              <RecoveryView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onApproveRemediation={handleApproveRemediation}
                onCompleteRecovery={handleCompleteRecovery}
              />
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {currentTab === 'reports' && (
            <div className="animate-in fade-in duration-200">
              <ReportsView incidents={incidents} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Dynamic Island / Notch Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start space-x-3 p-4 rounded-2xl notch-card max-w-md animate-in slide-in-from-bottom-5 duration-300 shadow-2xl border border-[var(--border-medium)]">
          <div className="p-1.5 rounded-xl shrink-0">
            {toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            ) : toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">{toastMessage.title}</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-snug">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Voice Assistant Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 notch-pill px-4 py-2 flex items-center space-x-2 text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl group border border-[var(--border-medium)]"
        title="Open Team Rocket Voice Assistant (⌘K)"
      >
        <div className="relative">
          <Mic className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
        </div>
        <span className="text-[var(--text-primary)] font-medium">Voice AI</span>
        <span className="text-[10px] font-mono px-1 rounded bg-[var(--tag-bg)] text-[var(--text-muted)]">
          ⌘K
        </span>
      </button>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          initialTab={modalInitialTab}
          onClose={() => setSelectedIncident(null)}
          onApproveRemediation={handleApproveRemediation}
          onCompleteRecovery={handleCompleteRecovery}
        />
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteAction={handleVoiceAction}
        activeIncidentId={selectedIncident?.id || incidents.find((i) => i.status !== 'RESOLVED')?.id}
        selectedServiceId={selectedService?.id}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}

export default App;
