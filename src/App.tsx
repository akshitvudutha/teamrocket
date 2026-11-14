import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewStats } from './components/OverviewStats';
import { ServiceGrid } from './components/ServiceGrid';
import { IncidentTable } from './components/IncidentTable';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { AiInvestigationView } from './components/AiInvestigationView';
import { RecoveryView } from './components/RecoveryView';
import { ReportsView } from './components/ReportsView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import {
  getServices,
  getIncidents,
  simulateScenario,
  resetAllSimulations,
  approveRemediation,
  executeRecoveryProgress,
} from './services/incidentService';
import { Incident, ServiceHealth, VoiceCommandResponse } from './types';
import { Bell, CheckCircle2, ShieldAlert, Sparkles, X, Mic } from 'lucide-react';

export function App() {
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

  const showToast = (title: string, desc: string, type: 'alert' | 'success' | 'info' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null), 4500;
    });
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
    // Find active incident for this service if any
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
        const targetInc = selectedIncident || activeIncidents[0] || incidents[0];
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

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL');

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 antialiased">
      {/* Apple Dynamic Island / Linear Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start space-x-3 p-4 rounded-2xl bg-[#141724]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-2 rounded-xl shrink-0">
            {toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs font-semibold text-white">{toastMessage.title}</h4>
            <p className="text-xs text-slate-400 leading-snug">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Top Header */}
      <Header
        incidents={incidents}
        services={services}
        onSimulateScenario={handleSimulateScenario}
        onResetAll={handleResetAll}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeIncidentCount={activeIncidents.length}
          criticalIncidentCount={criticalIncidents.length}
          servicesCount={services.length}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <div className="max-w-[1700px] mx-auto space-y-6">
            {/* TAB 1: OVERVIEW */}
            {currentTab === 'overview' && (
              <div className="space-y-7 animate-in fade-in duration-200">
                {/* Overview Stats Cards */}
                <OverviewStats services={services} incidents={incidents} />

                {/* Active Incidents Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">Active Incident Stream</h3>
                      <p className="text-xs text-slate-400">
                        Real-time telemetry anomalies triaged by Team Rocket AI Agent.
                      </p>
                    </div>
                    {activeIncidents.length > 0 && (
                      <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {activeIncidents.length} Unresolved Incident{activeIncidents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <IncidentTable
                    incidents={incidents}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                    selectedIncidentId={selectedIncident?.id}
                  />
                </div>

                {/* 12-Service Health Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        E-Commerce Application Cluster (12 Microservices)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live cluster health, latency (P99), error rates, and CPU utilization.
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('services')}
                      className="text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      View All Services &rarr;
                    </button>
                  </div>

                  <ServiceGrid
                    services={services}
                    onSelectService={handleSelectService}
                    selectedServiceId={selectedService?.id}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: INCIDENTS */}
            {currentTab === 'incidents' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white tracking-tight">Active & Historical Incidents</h2>
                    <p className="text-xs text-slate-400">
                      Search and filter incidents across all 12 microservices.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSimulateScenario()}
                    className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-xs shadow-rose-950 transition cursor-pointer"
                  >
                    + Simulate Chaos Scenario
                  </button>
                </div>

                <IncidentTable
                  incidents={incidents}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  selectedIncidentId={selectedIncident?.id}
                />
              </div>
            )}

            {/* TAB 3: SERVICES */}
            {currentTab === 'services' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">
                    Application Architecture (12 Monitored Microservices)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive telemetry, pod counts, upstream dependencies, and operational health.
                  </p>
                </div>

                <ServiceGrid
                  services={services}
                  onSelectService={handleSelectService}
                  selectedServiceId={selectedService?.id}
                />
              </div>
            )}

            {/* TAB 4: AI INVESTIGATION */}
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
      </div>

      {/* Detailed Incident Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          initialTab={modalInitialTab}
          onClose={() => setSelectedIncident(null)}
          onApproveRemediation={handleApproveRemediation}
          onCompleteRecovery={handleCompleteRecovery}
        />
      )}

      {/* Floating Apple-Style Voice Assistant Capsule */}
      <button
        type="button"
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#131624]/90 hover:bg-[#1a1f33] backdrop-blur-2xl text-white font-medium text-xs shadow-2xl shadow-indigo-950/80 hover:scale-105 active:scale-95 transition-all border border-indigo-400/30 cursor-pointer group ring-1 ring-white/10"
        title="Open Team Rocket Voice Assistant"
      >
        <div className="relative">
          <Mic className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
        </div>
        <span className="font-sans tracking-tight">Voice AI</span>
        <span className="text-[10px] font-mono px-1 rounded bg-white/[0.08] text-slate-300">
          ⌘K
        </span>
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteAction={handleVoiceAction}
        activeIncidentId={selectedIncident?.id || activeIncidents[0]?.id}
        selectedServiceId={selectedService?.id}
      />
    </div>
  );
}

export default App;
