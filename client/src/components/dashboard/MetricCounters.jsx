import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Clock, Zap, Users, AlertTriangle } from 'lucide-react';

export default function MetricCounters() {
  const { setActiveTab } = useJarvis();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Time to Root Cause */}
      <div
        onClick={() => setActiveTab('investigation')}
        className="calm-card p-4 flex items-center space-x-3.5 cursor-pointer hover:border-slate-600 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Time to Root Cause</span>
          <div className="text-base font-semibold text-white">8 Seconds</div>
          <span className="text-[10px] text-slate-500">vs ~45 min manual triage</span>
        </div>
      </div>

      {/* 2. Alert Reduction */}
      <div
        onClick={() => setActiveTab('logs')}
        className="calm-card p-4 flex items-center space-x-3.5 cursor-pointer hover:border-slate-600 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Noise Reduction</span>
          <div className="text-base font-semibold text-white">92.6% Filtered</div>
          <span className="text-[10px] text-slate-500">247 alerts → 1 incident</span>
        </div>
      </div>

      {/* 3. Next Failure Countdown */}
      <div
        onClick={() => setActiveTab('predictions')}
        className="calm-card p-4 flex items-center space-x-3.5 cursor-pointer hover:border-slate-600 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Next Projected Failure</span>
          <div className="text-base font-semibold text-amber-400">In 01:45 mins</div>
          <span className="text-[10px] text-slate-500">Auth Token Timeout</span>
        </div>
      </div>

      {/* 4. Users Protected */}
      <div
        onClick={() => setActiveTab('investigation')}
        className="calm-card p-4 flex items-center space-x-3.5 cursor-pointer hover:border-slate-600 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Users Protected</span>
          <div className="text-base font-semibold text-white">3,890 Saved</div>
          <span className="text-[10px] text-slate-500">With recommended fix</span>
        </div>
      </div>
    </div>
  );
}
