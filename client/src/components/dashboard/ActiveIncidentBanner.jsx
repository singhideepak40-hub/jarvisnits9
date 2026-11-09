import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { AlertCircle, ArrowRight, Clock, Users, DollarSign } from 'lucide-react';

export default function ActiveIncidentBanner() {
  const { selectedIncident, incidentDetails, setActiveTab, setSelectedNodeId } = useJarvis();

  const title = selectedIncident?.title || 'Core DB Connection Exhaustion & Downstream Payment Cascade';
  const id = selectedIncident?.id || 'INC-2026-001';
  const startTime = selectedIncident?.startTime ? new Date(selectedIncident.startTime).toLocaleTimeString() : '10:41 AM';

  const usersAffected = incidentDetails?.impactAnalysis?.metrics?.totalUsersAffected?.toLocaleString() || '4,200';
  const revAtRisk = incidentDetails?.impactAnalysis?.metrics?.estimatedRevenueAtRisk?.toLocaleString() || '18,500';

  return (
    <div className="calm-card p-4 sm:p-5 border-l-4 border-l-rose-500">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Info */}
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Active Incident
            </span>
            <span className="text-xs font-mono text-slate-400">
              {id} • Started {startTime}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            The central PostgreSQL database reached its connection pool limit (98/100 slots). Authentication requests and payment checkouts are stalling downstream. J.A.R.V.I.S. has isolated the root bottleneck and generated an executable fix.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Users Affected: <strong className="text-white">{usersAffected}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Revenue at Risk: <strong className="text-white">${revAtRisk} USD</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cascade Blast Radius: <strong className="text-white">5 Microservices</strong></span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 w-full lg:w-auto justify-end flex-shrink-0">
          <button
            onClick={() => setActiveTab('predictions')}
            className="px-3.5 py-2 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Predicted Errors
          </button>

          <button
            onClick={() => setActiveTab('investigation')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Root Cause & Fix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
