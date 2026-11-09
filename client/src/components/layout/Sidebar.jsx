import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  FileText,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, incidents, predictions } = useJarvis();

  const navItems = [
    {
      id: 'overview',
      label: 'System Overview',
      icon: LayoutDashboard,
      badge: incidents.length > 0 ? '1 Incident' : null,
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    },
    {
      id: 'predictions',
      label: 'Failure Predictions',
      icon: TrendingUp,
      badge: predictions.length > 0 ? `${predictions.length} At Risk` : 'Forecast',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    {
      id: 'investigation',
      label: 'Root Cause & Fix',
      icon: Search,
      badge: null
    },
    {
      id: 'logs',
      label: 'Live Banking Logs',
      icon: FileText,
      badge: null
    },
    {
      id: 'report',
      label: 'Incident Report',
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <aside className="w-60 flex-shrink-0 border-r border-surface-border bg-surface-panel/90 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-surface-card text-white font-semibold border border-surface-border shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Clean Human Quote / Summary Card */}
      <div className="p-3.5 rounded-lg bg-surface-card border border-surface-border text-xs text-slate-400 leading-relaxed">
        <p className="text-[11px] text-slate-300 font-medium mb-1">
          Predictive Triage
        </p>
        <p className="text-[11px] text-slate-400">
          Correlates hundreds of alerts into a single root cause and forecasts upcoming failures before cascade saturation.
        </p>
      </div>
    </aside>
  );
}
