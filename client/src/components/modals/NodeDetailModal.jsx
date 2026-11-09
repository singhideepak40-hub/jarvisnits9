import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Server, Database, Activity, RefreshCw, Zap, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function NodeDetailModal() {
  const { selectedNode, setSelectedNodeId, healService, triggerChaos } = useJarvis();
  const [actionOutput, setActionOutput] = useState(null);
  const [isRunningAction, setIsRunningAction] = useState(false);

  if (!selectedNode) return null;

  const handleAction = (actionName, fn) => {
    soundEffects.playClick();
    setIsRunningAction(true);
    setActionOutput(`[EXEC] Running ${actionName} on ${selectedNode.id}...`);

    setTimeout(() => {
      fn();
      soundEffects.playSuccess();
      setIsRunningAction(false);
      setActionOutput(`[SUCCESS] ${actionName} completed successfully. Telemetry normalized.`);
    }, 700);
  };

  const isFailing = selectedNode.status === 'failing' || selectedNode.health < 40;
  const isDegraded = selectedNode.status === 'degraded' || (selectedNode.health >= 40 && selectedNode.health < 80);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-2xl rounded-2xl hud-panel border border-cyber-cyan shadow-neon-cyan overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-border bg-cyber-card/80">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isFailing ? 'bg-cyber-red/20 border border-cyber-red text-cyber-red' : 'bg-cyber-cyan/15 border border-cyber-cyan text-cyber-cyan'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white uppercase">{selectedNode.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted">
                  {selectedNode.tier || selectedNode.type}
                </span>
              </div>
              <span className="text-[11px] text-cyber-muted">
                Pod ID: {selectedNode.id}-7f8c9b-x2r4 • Region: us-east-1a • K8s Ready: 4/4
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedNodeId(null);
            }}
            className="text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Health & Status Bar */}
          <div className="p-3.5 rounded-xl bg-cyber-card/70 border border-cyber-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-cyber-muted uppercase block">Service Health Score</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xl font-bold ${
                  selectedNode.health < 40 ? 'text-cyber-red' : (selectedNode.health < 80 ? 'text-cyber-amber' : 'text-cyber-green')
                }`}>
                  {selectedNode.health}%
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                  isFailing ? 'bg-cyber-red/20 text-cyber-red border-cyber-red' : (
                    isDegraded ? 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber' : 'bg-cyber-green/20 text-cyber-green border-cyber-green'
                  )
                }`}>
                  {selectedNode.status}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-cyber-muted uppercase block">Active Alerts</span>
              <span className="text-lg font-bold text-cyber-red">{selectedNode.activeAlerts || 0} Events</span>
            </div>
          </div>

          {/* Real-Time Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
              <span className="text-[9px] text-cyber-muted uppercase block">CPU Utilization</span>
              <strong className="text-white text-xs">{selectedNode.metrics?.cpu || 28}%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
              <span className="text-[9px] text-cyber-muted uppercase block">Memory Heap</span>
              <strong className="text-white text-xs">{selectedNode.metrics?.memory || 52}%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
              <span className="text-[9px] text-cyber-muted uppercase block">P99 Latency</span>
              <strong className={`text-xs ${
                (selectedNode.metrics?.latency || 24) > 1000 ? 'text-cyber-red' : 'text-cyber-cyan'
              }`}>
                {selectedNode.metrics?.latency || 24}ms
              </strong>
            </div>
            <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
              <span className="text-[9px] text-cyber-muted uppercase block">Active Conns</span>
              <strong className="text-cyber-green text-xs">{selectedNode.metrics?.connections || 45}</strong>
            </div>
          </div>

          {/* Interactive Ops Action Buttons */}
          <div>
            <span className="text-[10px] text-cyber-cyan uppercase font-bold block mb-2">
              Microservice Interactive Ops Actions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleAction('Soft Restart Pods', () => healService(selectedNode.id))}
                disabled={isRunningAction}
                className="px-3 py-2 rounded-lg bg-cyber-card border border-cyber-cyan/40 hover:bg-cyber-cyan/10 text-cyber-cyan font-bold transition-all shadow-neon-cyan cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart Pods</span>
              </button>

              <button
                onClick={() => handleAction('Scale Workers (x5)', () => healService(selectedNode.id))}
                disabled={isRunningAction}
                className="px-3 py-2 rounded-lg bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold transition-all shadow-neon-green hover:bg-cyber-green/30 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Heal / Scale (100%)</span>
              </button>

              <button
                onClick={() => handleAction('Simulate Fault', () => triggerChaos('kill_db'))}
                disabled={isRunningAction}
                className="px-3 py-2 rounded-lg bg-cyber-red/20 border border-cyber-red text-cyber-red font-bold transition-all shadow-neon-red hover:bg-cyber-red/30 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Inject Chaos Spike</span>
              </button>
            </div>
          </div>

          {/* Simulated Terminal Feedback */}
          {actionOutput && (
            <div className="p-2.5 rounded-lg bg-cyber-bg border border-cyber-border text-[11px] text-cyber-green font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyber-green flex-shrink-0" />
              <span className="truncate">{actionOutput}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
