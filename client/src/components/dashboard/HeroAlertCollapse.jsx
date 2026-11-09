import React from 'react';
import { ArrowRight, CheckCircle2, Filter } from 'lucide-react';

export default function HeroAlertCollapse({ rawCount = 247, relevantCount = 38, incidentCount = 1 }) {
  return (
    <div className="calm-card p-5">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Explanation */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-2 text-xs text-brand-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Alert Noise Reduction Engine</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            247 raw alerts filtered down to 1 justified root cause
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instead of bombarding engineers with 247 separate alerts, J.A.R.V.I.S. traces dependency paths backward to isolate the origin failure, rejecting unrelated decoy alerts and background noise.
          </p>
        </div>

        {/* 3-Stage Peaceful Step Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
          {/* Step 1 */}
          <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center min-w-[100px] flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase text-slate-500 block">Raw Alerts</span>
            <span className="text-base font-bold text-slate-200">247</span>
            <span className="text-[10px] text-slate-500 block">Unsorted</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

          {/* Step 2 */}
          <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center min-w-[100px] flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase text-slate-500 block">Correlated</span>
            <span className="text-base font-bold text-amber-400">38</span>
            <span className="text-[10px] text-slate-500 block">Relevant</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />

          {/* Step 3 */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[100px] flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase text-emerald-400 block font-semibold">Root Outage</span>
            <span className="text-base font-bold text-emerald-400">1</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Core DB Fix</span>
          </div>
        </div>
      </div>
    </div>
  );
}
