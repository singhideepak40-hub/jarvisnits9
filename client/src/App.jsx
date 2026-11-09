import React from 'react';
import { JarvisProvider, useJarvis } from './context/JarvisContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import JarvisChatModal from './components/chat/JarvisChatModal';

// Modals
import NodeDetailModal from './components/modals/NodeDetailModal';
import LogDetailModal from './components/modals/LogDetailModal';

// Dashboard & Overview
import ActiveIncidentBanner from './components/dashboard/ActiveIncidentBanner';
import LiveTrafficController from './components/dashboard/LiveTrafficController';
import MetricCounters from './components/dashboard/MetricCounters';
import HeroAlertCollapse from './components/dashboard/HeroAlertCollapse';
import ServiceGraph from './components/graph/ServiceGraph';

// Predictions (Core Innovation)
import FailureConeView from './components/prediction/FailureConeView';

// Investigation & Remediation
import RootCauseRanking from './components/explainability/RootCauseRanking';
import EvidenceCards from './components/explainability/EvidenceCards';
import RemediationPlaybook from './components/explainability/RemediationPlaybook';

// Logs & Reports
import NormalizedLogTable from './components/logs/NormalizedLogTable';
import LogUploadModal from './components/logs/LogUploadModal';
import IncidentReportModal from './components/reports/IncidentReportModal';

function MainLayout() {
  const { activeTab, incidentDetails } = useJarvis();

  return (
    <div className="min-h-screen bg-surface-bg text-slate-100 flex flex-col font-sans select-none">
      {/* Clean, peaceful Header with Command Palette */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <ActiveIncidentBanner />
              <LiveTrafficController />
              <MetricCounters />
              <HeroAlertCollapse />
              <ServiceGraph />
            </div>
          )}

          {/* TAB 2: FAILURE PREDICTIONS & UPCOMING LOG FORECAST */}
          {activeTab === 'predictions' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <FailureConeView />
            </div>
          )}

          {/* TAB 3: ROOT CAUSE & ACTIONABLE FIX */}
          {activeTab === 'investigation' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <RootCauseRanking rootCauseData={incidentDetails?.rootCauseAnalysis} />
              <EvidenceCards explainability={incidentDetails?.rootCauseAnalysis?.explainability} />
              <RemediationPlaybook playbook={incidentDetails?.rootCauseAnalysis?.playbook} />
            </div>
          )}

          {/* TAB 4: LIVE BANKING TELEMETRY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <NormalizedLogTable />
              <LogUploadModal />
            </div>
          )}

          {/* TAB 5: POST-MORTEM REPORT */}
          {activeTab === 'report' && (
            <div className="space-y-5 max-w-7xl mx-auto">
              <IncidentReportModal incidentData={incidentDetails} />
            </div>
          )}
        </main>
      </div>

      {/* Clean Interactive Modals */}
      <JarvisChatModal />
      <NodeDetailModal />
      <LogDetailModal />
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
