import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import {
  LayoutDashboard,
  SearchCode,
  TrendingUp,
  Sliders,
  History,
  Split,
  FileCode,
  FileSpreadsheet,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function Sidebar() {
  const { activeTab, setActiveTab, incidents, predictions } = useJarvis();

  const navItems = [
    { id: 'dashboard', label: 'Command HUD', icon: LayoutDashboard, badge: null },
    { 
      id: 'investigation', 
      label: 'Root Cause & Why?', 
      icon: SearchCode, 
      badge: incidents.length > 0 ? `${incidents.length} Active` : null, 
      badgeColor: 'text-cyber-red bg-cyber-red/20 border-cyber-red/40' 
    },
    { 
      id: 'predictions', 
      label: 'Failure Cone Forecast', 
      icon: TrendingUp, 
      badge: predictions.length > 0 ? `${predictions.length} ETA` : null,
      badgeColor: 'text-cyber-amber bg-cyber-amber/20 border-cyber-amber/40'
    },
    { id: 'digitaltwin', label: 'Digital Twin Lab', icon: Sliders, badge: 'What-If' },
    { id: 'counterfactual', label: 'Rewind & Fix Sim', icon: History, badge: '92.6% Saved' },
    { id: 'compare', label: 'Before / After Slider', icon: Split, badge: '247 vs 1' },
    { id: 'logs', label: 'Normalized Telemetry', icon: FileCode, badge: null },
    { id: 'reports', label: 'Post-Mortem PDF', icon: FileSpreadsheet, badge: null }
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-cyber-border bg-cyber-panel/95 backdrop-blur-md select-none">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-cyber-muted">
          Operational Systems
        </div>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                soundEffects.playClick();
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/10 border border-cyber-cyan/40 text-cyber-cyan shadow-neon-cyan'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-cyber-muted'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                  item.badgeColor || 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Product Philosophy Footer Card */}
      <div className="p-3 m-3 rounded-lg bg-cyber-card/80 border border-cyber-border/80">
        <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-mono font-bold mb-1">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>CORE PHILOSOPHY</span>
        </div>
        <p className="text-[11px] text-cyber-muted leading-relaxed font-sans italic">
          "Other tools show you 247 alerts. J.A.R.V.I.S. shows you the 1 cause, the 1 fix, and the next failure before it happens."
        </p>
      </div>
    </aside>
  );
}
