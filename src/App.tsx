import React, { useState, useEffect } from 'react';
import { Navbar } from './components/tarsier/Navbar';
import { WelcomePage } from './components/tarsier/WelcomePage';
import { AuthModal } from './components/tarsier/AuthModal';
import { DashboardView } from './components/tarsier/DashboardView';
import { WebsiteDetailView } from './components/tarsier/WebsiteDetailView';
import { SupportView } from './components/tarsier/SupportView';
import { AddWebsiteModal } from './components/tarsier/AddWebsiteModal';
import { VoiceAssistantModal } from './components/tarsier/VoiceAssistantModal';
import { ToastNotification, ToastMessage } from './components/tarsier/ToastNotification';
import {
  INITIAL_WEBSITES,
  INITIAL_INCIDENTS,
  INITIAL_LOGS,
  INITIAL_USER,
} from './data/tarsierMockData';
import {
  AppView,
  MonitoredWebsite,
  WebsiteIncident,
  WebsiteLog,
  UserProfile,
  VoiceCommandResult,
} from './types/tarsier';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [websites, setWebsites] = useState<MonitoredWebsite[]>(INITIAL_WEBSITES);
  const [incidents, setIncidents] = useState<WebsiteIncident[]>(INITIAL_INCIDENTS);
  const [logs, setLogs] = useState<WebsiteLog[]>(INITIAL_LOGS);

  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>('site-2');
  const [pausedSites, setPausedSites] = useState<Set<string>>(new Set());

  // Modals & Chaos
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'register'>('signin');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [chaosActive, setChaosActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ title, desc, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Mount: verify backend health
  useEffect(() => {
    api.checkHealth().then((health) => {
      if (health.ollama?.connected) {
        showToast('Ollama AI Online', `Connected to local workstation reasoning engine: ${health.ollama.model || 'qwen2.5:7b'}`, 'info');
      }
    });
  }, []);

  // Automated simulated heartbeat ticker for realistic telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setWebsites((prev) =>
        prev.map((site) => {
          if (pausedSites.has(site.id)) return site;

          // Jitter latency slightly (+/- 2ms)
          const jitter = Math.floor(Math.random() * 5) - 2;
          const newLatency =
            site.status === 'down'
              ? 14000 + Math.floor(Math.random() * 800)
              : Math.max(12, site.latencyMs + jitter);

          return {
            ...site,
            latencyMs: newLatency,
            lastCheckSecondsAgo: (site.lastCheckSecondsAgo + 2) % 30,
          };
        })
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [pausedSites]);

  // Handle Navigation
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Auth Modal
  const handleOpenAuth = (initialTab: 'signin' | 'register' = 'signin') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  // Handle Login Success
  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
    showToast(
      `Welcome to TARSIER, ${loggedInUser.name}`,
      `Connected to Team Rocket Night Guard. Surveillance active on ${websites.length} websites.`,
      'success'
    );
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setCurrentView('welcome');
    showToast('Signed Out', 'You have been disconnected from SRE Night Guard.', 'info');
  };

  // Select Website to Inspect
  const handleSelectWebsite = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    setCurrentView('website-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new website
  const handleAddWebsite = (newSite: MonitoredWebsite) => {
    setWebsites((prev) => [newSite, ...prev]);
    showToast(
      'Target Added to Night Guard',
      `${newSite.name} is now surveilled across 5 global multi-region probes.`,
      'success'
    );
  };

  // Run Synthetic Probe On Demand
  const handleRunSyntheticProbe = (websiteId: string) => {
    const target = websites.find((w) => w.id === websiteId);
    if (!target) return;

    const probedLatency =
      target.status === 'down'
        ? 14200
        : Math.floor(Math.random() * 15) + (target.category === 'Security' ? 18 : 32);

    setWebsites((prev) =>
      prev.map((w) =>
        w.id === websiteId
          ? {
              ...w,
              latencyMs: probedLatency,
              lastCheckSecondsAgo: 0,
            }
          : w
      )
    );

    // Add probe log
    const newLog: WebsiteLog = {
      id: `log-probe-${Date.now()}`,
      websiteId,
      timestamp: new Date().toISOString(),
      severity: target.status === 'down' ? 'ERROR' : 'INFO',
      service: 'synthetic-sentinel',
      message: `Manual probe dispatched from US-East probe cluster. Result: HTTP ${target.httpStatus} (${probedLatency}ms).`,
      format: 'syslog',
      isSuspicious: false,
      riskScore: 0,
      statusCode: target.httpStatus,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast(
      'Synthetic Probe Executed',
      `${target.name} responded with HTTP ${target.httpStatus} in ${probedLatency}ms.`,
      target.status === 'down' ? 'alert' : 'success'
    );
  };

  // Toggle Surveillance Pause
  const handleToggleSurveillance = (websiteId: string) => {
    setPausedSites((prev) => {
      const next = new Set(prev);
      const isCurrentlyPaused = next.has(websiteId);
      if (isCurrentlyPaused) {
        next.delete(websiteId);
        showToast('Surveillance Resumed', 'Night Guard active checks restored.', 'info');
      } else {
        next.add(websiteId);
        showToast('Surveillance Paused', 'Night Guard probes paused for target.', 'alert');
      }
      return next;
    });
  };

  // Interactive Remediation of Incident (Enforced via Human Approval Gate)
  const handleRemediateIncident = (incidentId: string) => {
    const targetInc = incidents.find((i) => i.id === incidentId);
    if (!targetInc) return;

    // Update incident status
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'RESOLVED',
              isRemediated: true,
              timeline: [
                ...inc.timeline,
                {
                  time: new Date().toLocaleTimeString() + ' UTC',
                  text: 'SRE Commander authorized automated remediation via Human Approval Safety Gate.',
                  actor: 'SRE Commander',
                },
                {
                  time: new Date().toLocaleTimeString() + ' UTC',
                  text: 'Synthetic verification confirmed 100% 200 OK responses with 28ms latency.',
                  actor: 'Synthetic Sentinel',
                },
              ],
            }
          : inc
      )
    );

    // Restore the affected website to healthy
    setWebsites((prev) =>
      prev.map((w) =>
        w.id === targetInc.websiteId
          ? {
              ...w,
              status: 'healthy',
              httpStatus: 200,
              latencyMs: 28,
              activeIncidentCount: 0,
              historicalLatency: [
                ...w.historicalLatency,
                { time: '14:20', latencyMs: 28, statusCode: 200 },
              ],
            }
          : w
      )
    );

    showToast(
      'Remediation Executed & Verified',
      `Incident ${incidentId} resolved. ${targetInc.websiteName} restored to 100% healthy baseline.`,
      'success'
    );
  };

  // Toggle Outage on a specific website
  const handleSimulateOutage = (websiteId: string) => {
    setWebsites((prev) =>
      prev.map((w) => {
        if (w.id !== websiteId) return w;
        const newStatus = w.status === 'down' ? 'healthy' : 'down';
        const newHttpStatus = newStatus === 'down' ? 504 : 200;
        const newLatency = newStatus === 'down' ? 14500 : 26;

        return {
          ...w,
          status: newStatus,
          httpStatus: newHttpStatus,
          latencyMs: newLatency,
          activeIncidentCount: newStatus === 'down' ? 1 : 0,
        };
      })
    );

    showToast(
      'Synthetic Outage Toggled',
      `Toggled status on target website. Night Guard evaluated failure propagation.`,
      'info'
    );
  };

  // Chaos Injection Across Fleet
  const handleTriggerChaos = () => {
    if (chaosActive) {
      handleRestoreAll();
      return;
    }

    setChaosActive(true);

    // Inject chaos into store and api
    setWebsites((prev) =>
      prev.map((w) => {
        if (w.id === 'site-2') {
          return {
            ...w,
            status: 'down',
            httpStatus: 504,
            latencyMs: 14800,
            activeIncidentCount: 1,
          };
        }
        if (w.id === 'site-1' || w.id === 'site-4') {
          return {
            ...w,
            status: 'warning',
            latencyMs: 380,
            activeIncidentCount: 1,
          };
        }
        return w;
      })
    );

    showToast(
      '🚨 Chaos Scenario Injected',
      'Simulated dual-cause DB pool starvation + carrier gateway 504 timeout cascade.',
      'alert'
    );
  };

  // Restore All
  const handleRestoreAll = () => {
    setChaosActive(false);
    setWebsites(
      INITIAL_WEBSITES.map((w) => ({
        ...w,
        status: 'healthy',
        httpStatus: 200,
        latencyMs: w.category === 'Security' ? 22 : w.category === 'Infrastructure' ? 14 : 32,
        activeIncidentCount: 0,
      }))
    );

    setIncidents((prev) =>
      prev.map((i) => ({
        ...i,
        status: 'RESOLVED',
        isRemediated: true,
      }))
    );

    showToast(
      'Fleet Baseline Restored',
      'All websites returned to 100% operational baseline with 0 open incidents.',
      'success'
    );
  };

  // Dispatch UI Actions from Voice Assistant
  const handleExecuteUiAction = (action: VoiceCommandResult['uiAction']) => {
    if (!action) return;

    if (action.type === 'SELECT_SERVICE' && action.payload?.websiteId) {
      handleSelectWebsite(action.payload.websiteId as string);
    } else if (action.type === 'OPEN_INCIDENT' && action.payload?.websiteId) {
      handleSelectWebsite(action.payload.websiteId as string);
    }
  };

  const selectedWebsite =
    websites.find((w) => w.id === selectedWebsiteId) || websites[0];

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-slate-900 text-slate-100'} flex flex-col font-sans selection:bg-[#007AFF]/30 selection:text-white`}>
      {/* Toast Notification Container */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        user={user}
        onLogout={handleLogout}
        activeIncidentsCount={activeIncidentsCount}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'welcome' && (
          <WelcomePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            websites={websites}
            incidents={incidents}
            onSelectWebsite={handleSelectWebsite}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onTriggerChaos={handleTriggerChaos}
            onRestoreAll={handleRestoreAll}
            chaosActive={chaosActive}
          />
        )}

        {currentView === 'website-detail' && selectedWebsite && (
          <WebsiteDetailView
            website={selectedWebsite}
            incidents={incidents}
            logs={logs}
            onBack={() => handleNavigate('dashboard')}
            onRunSyntheticProbe={handleRunSyntheticProbe}
            onToggleSurveillance={handleToggleSurveillance}
            onRemediateIncident={handleRemediateIncident}
            onSimulateOutage={handleSimulateOutage}
            isPaused={pausedSites.has(selectedWebsite.id)}
          />
        )}

        {currentView === 'support' && (
          <SupportView
            websites={websites}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWebsite={handleAddWebsite}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteUiAction={handleExecuteUiAction}
      />
    </div>
  );
}
export default App;
