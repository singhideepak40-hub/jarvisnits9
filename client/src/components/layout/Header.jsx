import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { ShieldCheck, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header() {
  const {
    systemStatus,
    currentScenarioPreset,
    loadScenario,
    healAllServices,
    isChatOpen,
    setIsChatOpen,
    isBackendConnected
  } = useJarvis();

  const isIncident = systemStatus === 'INCIDENT_DETECTED';

  return (
    <header className="border-b border-surface-border bg-surface-panel/80 backdrop-blur-md px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-brand-400">
            <span className="font-bold text-sm tracking-wider">J</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-semibold tracking-tight text-white">
                J.A.R.V.I.S.
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Incident Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Banking & Payment Reliability Monitoring
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 pl-3 border-l border-surface-border">
          <div className={`w-2 h-2 rounded-full ${isIncident ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isIncident ? 'Active Incident' : 'All Systems Nominal'}
          </span>
        </div>
      </div>

      {/* Preset Scenario Switcher & Actions */}
      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
        {/* Scenario Pills */}
        <div className="flex items-center bg-surface-card p-1 rounded-lg border border-surface-border text-xs">
          <span className="text-slate-400 px-2 text-[11px] hidden md:inline">Demo Scenarios:</span>
          {[
            { id: 'db_pool', label: 'DB Connection Exhaustion' },
            { id: 'stripe_down', label: 'Payment Gateway 503' },
            { id: 'healthy', label: 'Healthy Baseline' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => loadScenario(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                currentScenarioPreset === p.id
                  ? 'bg-slate-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 1-Click Resolve Action if incident is active */}
        {isIncident && (
          <button
            onClick={healAllServices}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
            title="Execute recommended fix and restore healthy state"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Apply 1-Click Fix</span>
          </button>
        )}

        {/* AI Assistant */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>AI Explanation</span>
        </button>
      </div>
    </header>
  );
}
