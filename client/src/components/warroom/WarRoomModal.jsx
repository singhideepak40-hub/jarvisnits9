import React, { useState, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Terminal, Volume2 } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function WarRoomModal() {
  const { isWarRoomOpen, setIsWarRoomOpen, incidentDetails, events } = useJarvis();
  const [elapsedSec, setElapsedSec] = useState(252); // ~4m 12s

  useEffect(() => {
    if (!isWarRoomOpen) return;
    const interval = setInterval(() => {
      setElapsedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWarRoomOpen]);

  if (!isWarRoomOpen) return null;

  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const rootCause = incidentDetails?.rootCauseAnalysis?.rootCause?.service || 'core-db';
  const confidence = incidentDetails?.rootCauseAnalysis?.rootCause?.confidence || 91;
  const usersAffected = incidentDetails?.impactAnalysis?.metrics?.totalUsersAffected?.toLocaleString() || '4,200';
  const revAtRisk = incidentDetails?.impactAnalysis?.metrics?.estimatedRevenueAtRisk?.toLocaleString() || '18,500';

  return (
    <div className="fixed inset-0 z-50 bg-cyber-bg/95 backdrop-blur-2xl p-6 flex flex-col justify-between overflow-y-auto font-mono">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-cyber-red/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-red/20 border border-cyber-red flex items-center justify-center text-cyber-red shadow-neon-red">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black text-cyber-red tracking-widest uppercase text-glow-red">
                INCIDENT COMMAND WAR ROOM
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyber-red text-white font-bold animate-ping">
                P1 CRITICAL
              </span>
            </div>
            <p className="text-xs text-cyber-muted">
              Live Tactical Operations & Escalation Command HUD (W9)
            </p>
          </div>
        </div>

        {/* Big Incident Timer */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-cyber-muted uppercase block">Incident Elapsed T+</span>
            <span className="text-2xl font-black text-cyber-red tracking-widest">{timeStr}</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsWarRoomOpen(false);
            }}
            className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-red text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Grid: 3 Large Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1">
        {/* Panel 1: Single Root Cause & Evidence */}
        <div className="p-5 rounded-2xl hud-panel-red border border-cyber-red/60 flex flex-col justify-between">
          <div>
            <span className="text-xs text-cyber-red font-bold uppercase tracking-wider block mb-2">
              IDENTIFIED ROOT BOTTLENECK ({confidence}% JUSTIFIED CONFIDENCE)
            </span>
            <h3 className="text-2xl font-black text-white uppercase text-glow-red">
              {rootCause}
            </h3>
            <p className="text-xs text-cyber-muted font-sans mt-2 leading-relaxed">
              HikariCP connection pool hit 98/100 slots. Transaction lock queue contention stalled Auth Service, cascading 504 timeouts to API Gateway and Payment Service.
            </p>
          </div>

          <div className="pt-4 border-t border-cyber-red/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-cyber-muted">Earliest Anomaly:</span>
              <span className="text-white">10:41:00 AM UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Root Trace ID:</span>
              <span className="text-cyber-cyan">trace-core-8819</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">Cascade Wave Velocity:</span>
              <span className="text-cyber-amber">1.2 hops / minute</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Blast Radius & Impact KPIs */}
        <div className="p-5 rounded-2xl hud-panel border border-cyber-cyan/40 flex flex-col justify-between">
          <div>
            <span className="text-xs text-cyber-cyan font-bold uppercase tracking-wider block mb-2">
              LIVE PLATFORM EXPOSURE
            </span>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <span className="text-[10px] text-cyber-muted uppercase block">Impacted Shoppers</span>
                <span className="text-xl font-bold text-cyber-red">{usersAffected}</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <span className="text-[10px] text-cyber-muted uppercase block">Revenue at Risk</span>
                <span className="text-xl font-bold text-cyber-amber">${revAtRisk}</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <span className="text-[10px] text-cyber-muted uppercase block">Infected Services</span>
                <span className="text-xl font-bold text-cyber-red">5 / 8</span>
              </div>
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <span className="text-[10px] text-cyber-muted uppercase block">Cascade Risk Score</span>
                <span className="text-xl font-bold text-cyber-red">84 / 100</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[10px] text-cyber-muted block mb-1">AFFECTED DEPENDENCY CHAIN:</span>
            <div className="flex items-center space-x-1.5 text-xs text-cyber-cyan font-bold">
              <span>core-db</span>
              <span>→</span>
              <span>auth</span>
              <span>→</span>
              <span>gateway</span>
              <span>→</span>
              <span>payment</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Instant Execution Protocol */}
        <div className="p-5 rounded-2xl hud-panel border border-cyber-green/50 flex flex-col justify-between shadow-neon-green">
          <div>
            <span className="text-xs text-cyber-green font-bold uppercase tracking-wider block mb-2">
              TACTICAL EXECUTION PROTOCOL
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-cyber-card border border-cyber-green/40">
                <div className="font-bold text-white mb-0.5">Step 1: Scale DB Pool to 500</div>
                <div className="text-[11px] text-cyber-cyan font-mono truncate">
                  $ kubectl scale deploy pgbouncer --replicas=6
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-card border border-cyber-border">
                <div className="font-bold text-white mb-0.5">Step 2: Terminate Idle Sessions</div>
                <div className="text-[11px] text-cyber-muted font-mono truncate">
                  $ pg_terminate_backend(pid) state='idle'
                </div>
              </div>

              <div className="p-2.5 rounded bg-cyber-card border border-cyber-border">
                <div className="font-bold text-white mb-0.5">Step 3: Rollout Restart Auth Pods</div>
                <div className="text-[11px] text-cyber-muted font-mono truncate">
                  $ kubectl rollout restart deployment auth-service
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playSuccess();
              alert('Self-Healing Remediation Protocol Dispatched to Cluster!');
            }}
            className="w-full py-2.5 rounded-xl bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold text-xs hover:bg-cyber-green/30 transition-all shadow-neon-green cursor-pointer mt-3"
          >
            DISPATCH 1-CLICK REMEDIATION PROTOCOL
          </button>
        </div>
      </div>

      {/* Bottom Live Log Ticker */}
      <div className="p-3 rounded-xl bg-cyber-card/80 border border-cyber-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate">
          <Terminal className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
          <span className="text-cyber-muted">LIVE TELEMETRY:</span>
          <span className="text-cyber-text truncate">
            {events[0]?.message || 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42'}
          </span>
        </div>
        <span className="text-[10px] text-cyber-muted font-mono ml-4 flex-shrink-0">
          Auto-Refreshing
        </span>
      </div>
    </div>
  );
}
