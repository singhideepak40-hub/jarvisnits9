import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Server, RefreshCw, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

export default function NodeDetailModal() {
  const { selectedNode, setSelectedNodeId, healService } = useJarvis();
  const [feedback, setFeedback] = useState(null);

  if (!selectedNode) return null;

  const handleAction = (name, fn) => {
    setFeedback(`Executing ${name}...`);
    setTimeout(() => {
      fn();
      setFeedback(`${name} completed successfully.`);
    }, 500);
  };

  const isFailing = selectedNode.status === 'failing' || selectedNode.health < 40;
  const isDegraded = selectedNode.status === 'degraded' || (selectedNode.health >= 40 && selectedNode.health < 80);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl rounded-xl calm-card shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-panel">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-slate-300">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">{selectedNode.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                  isFailing
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : (isDegraded ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30')
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Pod ID: {selectedNode.id}-4f9a • Region: us-east-1a • Replicas: 4/4 Ready
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedNodeId(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Health & Alerts */}
          <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Health Status</span>
              <span className={`text-xl font-bold ${
                selectedNode.health < 40 ? 'text-rose-400' : (selectedNode.health < 80 ? 'text-amber-400' : 'text-emerald-400')
              }`}>
                {selectedNode.health}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Active Alerts</span>
              <span className="text-sm font-semibold text-slate-200">{selectedNode.activeAlerts || 0} Events</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-[10px] text-slate-400 block">CPU Load</span>
              <span className="text-xs font-semibold text-white">{selectedNode.metrics?.cpu || 24}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-[10px] text-slate-400 block">Memory</span>
              <span className="text-xs font-semibold text-white">{selectedNode.metrics?.memory || 48}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-[10px] text-slate-400 block">P99 Latency</span>
              <span className={`text-xs font-semibold ${
                (selectedNode.metrics?.latency || 24) > 1000 ? 'text-rose-400' : 'text-white'
              }`}>
                {selectedNode.metrics?.latency || 24}ms
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-[10px] text-slate-400 block">Active Conns</span>
              <span className="text-xs font-semibold text-white">{selectedNode.metrics?.connections || 32}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-200 block mb-2">Service Maintenance Actions:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('Rolling Pod Restart', () => healService(selectedNode.id))}
                className="px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-200 font-medium transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Restart Pods</span>
              </button>

              <button
                onClick={() => handleAction('Scale Workers (x5)', () => healService(selectedNode.id))}
                className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 font-medium transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Heal / Restore 100%</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
