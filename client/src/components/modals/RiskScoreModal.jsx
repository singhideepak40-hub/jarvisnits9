import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Activity, ShieldAlert, CheckCircle2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function RiskScoreModal() {
  const { isRiskModalOpen, setIsRiskModalOpen, incidentDetails } = useJarvis();

  if (!isRiskModalOpen) return null;

  const score = incidentDetails?.impactAnalysis?.cascadeRiskIndex || 84;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-xl rounded-2xl hud-panel border border-cyber-red shadow-neon-red overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-border bg-cyber-card/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-red/20 border border-cyber-red text-cyber-red flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CASCADE RISK INDEX FORMULATION (W11 0-100 GAUGE)
              </span>
              <span className="block text-[10px] text-cyber-muted">
                Mathematical multi-factor risk assessment model
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsRiskModalOpen(false);
            }}
            className="text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Big Score Display */}
          <div className="p-4 rounded-xl bg-cyber-red/10 border border-cyber-red/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-cyber-muted uppercase block">Aggregate Risk Index</span>
              <span className="text-3xl font-black text-cyber-red text-glow-red">{score} / 100</span>
            </div>
            <span className="px-3 py-1 rounded bg-cyber-red text-white font-bold text-xs animate-pulse">
              LEVEL: CRITICAL ESCALATION
            </span>
          </div>

          {/* Mathematical Factors Breakdown */}
          <div className="space-y-2.5 font-mono">
            <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white">1. Service Blast Ratio (30% weight)</span>
                <span className="block text-[10px] text-cyber-muted">5 out of 8 microservices infected</span>
              </div>
              <span className="text-cyber-cyan font-bold">+28 / 30 pts</span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white">2. Error Volume Velocity (30% weight)</span>
                <span className="block text-[10px] text-cyber-muted">38 correlated exceptions within 2m window</span>
              </div>
              <span className="text-cyber-amber font-bold">+26 / 30 pts</span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white">3. Customer Session Exposure (25% weight)</span>
                <span className="block text-[10px] text-cyber-muted">4,200 active users with degraded responses</span>
              </div>
              <span className="text-cyber-red font-bold">+20 / 25 pts</span>
            </div>

            <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white">4. Transaction Revenue Velocity (15% weight)</span>
                <span className="block text-[10px] text-cyber-muted">$18,500 USD in delayed checkouts</span>
              </div>
              <span className="text-cyber-green font-bold">+10 / 15 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
