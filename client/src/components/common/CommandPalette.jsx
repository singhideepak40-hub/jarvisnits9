import React, { useState, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Wrench,
  FileText,
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  Database,
  Server,
  Sparkles,
  X
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const {
    setActiveTab,
    loadScenario,
    healAllServices,
    setIsChatOpen,
    setSelectedNodeId
  } = useJarvis();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    // Navigation
    {
      id: 'nav-overview',
      group: 'Navigation',
      label: 'Go to System Overview',
      icon: LayoutDashboard,
      shortcut: 'Tab 1',
      run: () => { setActiveTab('overview'); onClose(false); }
    },
    {
      id: 'nav-predictions',
      group: 'Navigation',
      label: 'Go to Failure Predictions & Forecast',
      icon: TrendingUp,
      shortcut: 'Tab 2',
      run: () => { setActiveTab('predictions'); onClose(false); }
    },
    {
      id: 'nav-investigation',
      group: 'Navigation',
      label: 'Go to Root Cause & Actionable Fix',
      icon: Wrench,
      shortcut: 'Tab 3',
      run: () => { setActiveTab('investigation'); onClose(false); }
    },
    {
      id: 'nav-logs',
      group: 'Navigation',
      label: 'Inspect Live Banking Logs',
      icon: FileText,
      shortcut: 'Tab 4',
      run: () => { setActiveTab('logs'); onClose(false); }
    },
    {
      id: 'nav-report',
      group: 'Navigation',
      label: 'View Incident Post-Mortem Report',
      icon: FileSpreadsheet,
      shortcut: 'Tab 5',
      run: () => { setActiveTab('report'); onClose(false); }
    },
    // Instant Remediation
    {
      id: 'act-heal-all',
      group: 'Remediation',
      label: 'Execute 1-Click Incident Remediation (Heal All)',
      icon: CheckCircle2,
      badge: 'Recommended',
      run: () => { healAllServices(); onClose(false); }
    },
    {
      id: 'act-inspect-db',
      group: 'Services',
      label: 'Inspect Core Database Node (core-db)',
      icon: Database,
      run: () => { setSelectedNodeId('core-db'); onClose(false); }
    },
    {
      id: 'act-inspect-auth',
      group: 'Services',
      label: 'Inspect Auth Service Node (auth-service)',
      icon: Server,
      run: () => { setSelectedNodeId('auth-service'); onClose(false); }
    },
    // Demo Scenarios
    {
      id: 'scen-db',
      group: 'Scenario Simulation',
      label: 'Simulate: Core DB Pool Exhaustion Cascade',
      icon: Zap,
      run: () => { loadScenario('db_pool'); onClose(false); }
    },
    {
      id: 'scen-stripe',
      group: 'Scenario Simulation',
      label: 'Simulate: Stripe Payment Gateway 503 Outage',
      icon: Zap,
      run: () => { loadScenario('stripe_down'); onClose(false); }
    },
    {
      id: 'scen-healthy',
      group: 'Scenario Simulation',
      label: 'Simulate: 100% Healthy Baseline Telemetry',
      icon: CheckCircle2,
      run: () => { loadScenario('healthy'); onClose(false); }
    },
    // AI Assistant
    {
      id: 'ai-chat',
      group: 'AI Reasoning',
      label: 'Ask AI Assistant for Incident Explanation',
      icon: Sparkles,
      run: () => { setIsChatOpen(true); onClose(false); }
    }
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 select-none">
      <div className="w-full max-w-xl rounded-xl calm-card shadow-2xl overflow-hidden flex flex-col border border-surface-border animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-surface-border bg-surface-panel">
          <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, service name, or scenario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => onClose(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching actions found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.run}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left text-slate-300 hover:text-white hover:bg-surface-hover/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-md bg-surface-bg border border-surface-border flex items-center justify-center text-slate-400 group-hover:text-brand-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.group}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-slate-500 bg-surface-bg px-1.5 py-0.5 rounded border border-surface-border">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-surface-border bg-surface-panel/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong> and press <strong>Enter</strong></span>
          <span>Press <strong>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
}
