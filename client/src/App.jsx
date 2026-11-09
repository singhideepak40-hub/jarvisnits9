import React from 'react';
import { JarvisProvider, useJarvis } from './context/JarvisContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BootAnimation from './components/layout/BootAnimation';
import VoiceAssistant from './components/layout/VoiceAssistant';
import JarvisChatModal from './components/chat/JarvisChatModal';
import WarRoomModal from './components/warroom/WarRoomModal';

// Modals & Interactive Drawers
import NodeDetailModal from './components/modals/NodeDetailModal';
import LogDetailModal from './components/modals/LogDetailModal';
import RiskScoreModal from './components/modals/RiskScoreModal';
import CyberTerminalDrawer from './components/terminal/CyberTerminalDrawer';

// Dashboard Components
import HeroAlertCollapse from './components/dashboard/HeroAlertCollapse';
import ActiveIncidentBanner from './components/dashboard/ActiveIncidentBanner';
import MetricCounters from './components/dashboard/MetricCounters';
import ServiceGraph from './components/graph/ServiceGraph';
import ChaosConsole from './components/chaos/ChaosConsole';

// Investigation Components
import RootCauseRanking from './components/explainability/RootCauseRanking';
import EvidenceCards from './components/explainability/EvidenceCards';
import RemediationPlaybook from './components/explainability/RemediationPlaybook';
import IncidentDNAView from './components/explainability/IncidentDNAView';
import StoryNarrative from './components/explainability/StoryNarrative';
import IncidentTimeline from './components/timeline/IncidentTimeline';

// Other View Components
import FailureConeView from './components/prediction/FailureConeView';
import WhatIfLab from './components/digitaltwin/WhatIfLab';
import CounterfactualView from './components/digitaltwin/CounterfactualView';
import BeforeAfterSlider from './components/comparison/BeforeAfterSlider';
import LogUploadModal from './components/logs/LogUploadModal';
import NormalizedLogTable from './components/logs/NormalizedLogTable';
import IncidentReportModal from './components/reports/IncidentReportModal';

function MainLayout() {
  const {
    activeTab,
    showBootAnimation,
    setShowBootAnimation,
    incidentDetails
  } = useJarvis();

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans select-none">
      {/* Iron-Man Startup Boot Animation on first load */}
      {showBootAnimation && (
        <BootAnimation onComplete={() => setShowBootAnimation(false)} />
      )}

      {/* Global Command Header */}
      <Header />

      {/* Body Layout: Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-24">
          {/* TAB 1: COMMAND HUD / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              <ActiveIncidentBanner />
              <HeroAlertCollapse />
              <MetricCounters />
              <ServiceGraph />
              <ChaosConsole />
            </div>
          )}

          {/* TAB 2: ROOT CAUSE & EXPLAINABILITY */}
          {activeTab === 'investigation' && (
            <div className="space-y-5">
              <RootCauseRanking rootCauseData={incidentDetails?.rootCauseAnalysis} />
              <EvidenceCards explainability={incidentDetails?.rootCauseAnalysis?.explainability} />
              <IncidentTimeline />
              <RemediationPlaybook playbook={incidentDetails?.rootCauseAnalysis?.playbook} />
              <IncidentDNAView fingerprintData={incidentDetails?.fingerprint} />
              <StoryNarrative storyData={incidentDetails?.story} />
            </div>
          )}

          {/* TAB 3: FAILURE CONE FORECAST */}
          {activeTab === 'predictions' && (
            <div className="space-y-5">
              <FailureConeView predictions={incidentDetails?.predictions?.forecasts} />
            </div>
          )}

          {/* TAB 4: DIGITAL TWIN WHAT-IF LAB */}
          {activeTab === 'digitaltwin' && (
            <div className="space-y-5">
              <WhatIfLab />
            </div>
          )}

          {/* TAB 5: COUNTERFACTUAL REWIND & FIX SIMULATOR */}
          {activeTab === 'counterfactual' && (
            <div className="space-y-5">
              <CounterfactualView />
            </div>
          )}

          {/* TAB 6: BEFORE / AFTER SPLIT SLIDER */}
          {activeTab === 'compare' && (
            <div className="space-y-5">
              <BeforeAfterSlider />
            </div>
          )}

          {/* TAB 7: NORMALIZED TELEMETRY & LOG UPLOADER */}
          {activeTab === 'logs' && (
            <div className="space-y-5">
              <LogUploadModal />
              <NormalizedLogTable />
            </div>
          )}

          {/* TAB 8: POST-MORTEM INCIDENT REPORTS & PDF EXPORT */}
          {activeTab === 'reports' && (
            <div className="space-y-5">
              <IncidentReportModal incidentData={incidentDetails} />
            </div>
          )}
        </main>
      </div>

      {/* Floating Global Modals & Drawers */}
      <VoiceAssistant />
      <JarvisChatModal />
      <WarRoomModal />
      <NodeDetailModal />
      <LogDetailModal />
      <RiskScoreModal />
      <CyberTerminalDrawer />
    </div>
  );
}

export default function App() {
  return (
    <JarvisProvider>
      <MainLayout />
    </JarvisProvider>
  );
}
