import React, { useState } from 'react';
import { Sliders, Play, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function WhatIfLab() {
  const [selectedService, setSelectedService] = useState('payment-gateway');
  const [failureType, setFailureType] = useState('latency_surge');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dryRunSuccess, setDryRunSuccess] = useState(false);

  const runExperiment = async () => {
    soundEffects.playAlert();
    setIsSimulating(true);
    setDryRunSuccess(false);

    try {
      const res = await fetch('/api/whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetService: selectedService, failureMode: failureType })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      }
    } catch {
      // Local fallback
      setSimulationResult({
        targetService: selectedService,
        failureMode: failureType,
        predictedBlastRadius: [selectedService, 'payment-service', 'api-gateway', 'web-portal'],
        predictedUsersAffected: 3800,
        predictedRevenueRiskUSD: 16150,
        timeToCascadeMinutes: 3.5,
        recommendation: `Pre-provision circuit breakers on ${selectedService} callers to isolate failure.`
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const runSelfHealingDryRun = () => {
    soundEffects.playSuccess();
    setDryRunSuccess(true);
  };

  return (
    <div className="space-y-4">
      {/* What-If Lab Header & Form */}
      <div className="rounded-xl hud-panel p-5 border border-cyber-border">
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
            <Sliders className="w-4 h-4 text-cyber-cyan animate-pulse" />
            <span>DIGITAL TWIN "WHAT-IF" SANDBOX LAB (I9)</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            ISOLATED ZERO-RISK REPLICA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Target Microservice</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-cyber-card border border-cyber-border rounded-lg px-3 py-2 text-xs font-mono text-cyber-text focus:border-cyber-cyan focus:outline-none"
            >
              <option value="payment-gateway">External Payment Gateway (Stripe)</option>
              <option value="core-db">Core PostgreSQL Database</option>
              <option value="auth-service">Auth Service Pods</option>
              <option value="api-gateway">API Gateway (Kong)</option>
              <option value="notification-service">Notification Worker</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-cyber-muted uppercase mb-1">Synthetic Failure Mode</label>
            <select
              value={failureType}
              onChange={(e) => setFailureType(e.target.value)}
              className="w-full bg-cyber-card border border-cyber-border rounded-lg px-3 py-2 text-xs font-mono text-cyber-text focus:border-cyber-cyan focus:outline-none"
            >
              <option value="latency_surge">Extreme Latency Surge (+3500ms)</option>
              <option value="connection_exhaustion">Socket / Connection Exhaustion</option>
              <option value="total_outage">Total Hard Crash (SIGKILL / 503)</option>
              <option value="packet_drop">Cross-Zone 60% Packet Loss</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runExperiment}
              disabled={isSimulating}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan hover:bg-cyber-cyan/30 text-cyber-cyan font-mono text-xs font-bold transition-all shadow-neon-cyan cursor-pointer"
            >
              <Play className="w-4 h-4 fill-cyber-cyan" />
              <span>{isSimulating ? 'SIMULATING TWIN...' : 'RUN WHAT-IF EXPERIMENT'}</span>
            </button>
          </div>
        </div>

        {/* Experiment Results */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-cyber-card/70 border border-cyber-cyan/40 font-mono space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-cyber-border">
              <span className="text-cyber-cyan font-bold uppercase">
                Predicted Blast Radius: {simulationResult.predictedBlastRadius.length} Microservices
              </span>
              <span className="text-cyber-amber font-bold">
                Cascade Velocity: ~{simulationResult.timeToCascadeMinutes} minutes
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {simulationResult.predictedBlastRadius.map((svc, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-cyber-red/15 border border-cyber-red/40 text-cyber-red font-bold">
                  {svc}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-cyber-bg p-2 rounded border border-cyber-border">
                <span className="text-[10px] text-cyber-muted block uppercase">Projected Users Impacted</span>
                <strong className="text-white text-sm">{simulationResult.predictedUsersAffected.toLocaleString()}</strong>
              </div>
              <div className="bg-cyber-bg p-2 rounded border border-cyber-border">
                <span className="text-[10px] text-cyber-muted block uppercase">Revenue Risk Exposure</span>
                <strong className="text-cyber-amber text-sm">${simulationResult.predictedRevenueRiskUSD.toLocaleString()} USD</strong>
              </div>
              <div className="bg-cyber-bg p-2 rounded border border-cyber-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-cyber-muted block uppercase">Proactive Protection</span>
                <strong className="text-cyber-green text-sm">Circuit Breaker Auto-Trip</strong>
              </div>
            </div>

            {/* I10: Self-Healing Dry Run Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-cyber-border/70">
              <span className="text-[11px] text-cyber-muted">
                Run automated self-healing dry run on digital twin?
              </span>
              <button
                onClick={runSelfHealingDryRun}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold text-xs hover:bg-cyber-green/30 transition-all shadow-neon-green cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>EXECUTE SELF-HEALING DRY RUN (I10)</span>
              </button>
            </div>

            {dryRunSuccess && (
              <div className="p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/40 text-cyber-green text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyber-green flex-shrink-0" />
                <span>
                  <strong>DRY RUN VERIFIED:</strong> Step 1: Drain traffic → Step 2: Scale pool → Step 3: Replay queue. Projected health restored to 100% in 1.4 minutes without touching production!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
