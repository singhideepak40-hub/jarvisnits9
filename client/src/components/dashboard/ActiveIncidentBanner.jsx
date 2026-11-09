import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { ShieldAlert, ArrowRight, Activity, Clock, Users, DollarSign } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function ActiveIncidentBanner() {
  const { selectedIncident, incidentDetails, setActiveTab } = useJarvis();

  const title = selectedIncident?.title || 'Core DB Connection Exhaustion & Downstream Payment Cascade';
  const id = selectedIncident?.id || 'INC-2026-001';
  const severity = selectedIncident?.severity || 'CRITICAL';
  const startTime = selectedIncident?.startTime ? new Date(selectedIncident.startTime).toLocaleTimeString() : '10:41:00 AM';

  const riskScore = incidentDetails?.impactAnalysis?.cascadeRiskIndex || 84;
  const usersAffected = incidentDetails?.impactAnalysis?.metrics?.totalUsersAffected?.toLocaleString() || '4,200';
  const revAtRisk = incidentDetails?.impactAnalysis?.metrics?.estimatedRevenueAtRisk?.toLocaleString() || '18,500';

  return (
    <div className="rounded-xl hud-panel p-4 border border-cyber-red/50 bg-gradient-to-r from-cyber-red/10 via-cyber-card/80 to-cyber-panel font-mono">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-red/20 border border-cyber-red flex items-center justify-center text-cyber-red shadow-neon-red flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-red text-white font-bold animate-pulse">
                {severity}
              </span>
              <span className="text-xs text-cyber-cyan font-bold">{id}</span>
              <span className="text-[10px] text-cyber-muted">Started: {startTime}</span>
            </div>

            <h3 className="text-base font-bold text-white uppercase mt-0.5 tracking-tight">
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-cyber-muted mt-1.5">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-cyber-red" />
                <span>Impact: <strong className="text-white">{usersAffected} users</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-cyber-amber" />
                <span>Revenue at Risk: <strong className="text-white">${revAtRisk}</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Cascade Risk Index: <strong className="text-cyber-red font-black">{riskScore} / 100</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('investigation');
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyber-red/20 border border-cyber-red hover:bg-cyber-red/30 text-cyber-red text-xs font-bold transition-all shadow-neon-red cursor-pointer"
          >
            <span>INVESTIGATE ROOT CAUSE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
