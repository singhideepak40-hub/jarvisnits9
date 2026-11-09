import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Clock, Zap, Users, DollarSign, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function MetricCounters() {
  const { setActiveTab } = useJarvis();
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono select-none">
      {/* 1. Time to Root Cause */}
      <div
        onClick={() => {
          soundEffects.playClick();
          setActiveTooltip(activeTooltip === 'time' ? null : 'time');
        }}
        className="p-3.5 rounded-xl hud-panel border border-cyber-border/80 flex items-center space-x-3 cursor-pointer hover:border-cyber-green/50 hover:scale-[1.01] transition-all"
        title="Click to view speed breakdown"
      >
        <div className="w-10 h-10 rounded-lg bg-cyber-green/15 border border-cyber-green/40 flex items-center justify-center text-cyber-green shadow-neon-green flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-cyber-muted uppercase block">Time to Root Cause</span>
          <div className="text-base font-bold text-cyber-green text-glow-green">8 Seconds</div>
          <span className="text-[10px] text-cyber-muted line-through">~45 min manual triage</span>
        </div>
      </div>

      {/* 2. Alert Reduction */}
      <div
        onClick={() => {
          soundEffects.playClick();
          setActiveTab('compare');
        }}
        className="p-3.5 rounded-xl hud-panel border border-cyber-border/80 flex items-center space-x-3 cursor-pointer hover:border-cyber-cyan/50 hover:scale-[1.01] transition-all"
        title="Click to open Before / After Split Slider"
      >
        <div className="w-10 h-10 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-neon-cyan flex-shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-cyber-muted uppercase block">Alerts Reduction</span>
          <div className="text-base font-bold text-cyber-cyan text-glow-cyan">92.6% Filtered</div>
          <span className="text-[10px] text-cyber-muted flex items-center space-x-1">
            <span>247 raw → 1 incident</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 3. Users Protected */}
      <div
        onClick={() => {
          soundEffects.playClick();
          setActiveTab('counterfactual');
        }}
        className="p-3.5 rounded-xl hud-panel border border-cyber-border/80 flex items-center space-x-3 cursor-pointer hover:border-cyber-blue/50 hover:scale-[1.01] transition-all"
        title="Click to open Counterfactual Rewind & Fix simulator"
      >
        <div className="w-10 h-10 rounded-lg bg-cyber-blue/15 border border-cyber-blue/40 flex items-center justify-center text-cyber-blue flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-cyber-muted uppercase block">Users Protected</span>
          <div className="text-base font-bold text-white">3,890 Saved</div>
          <span className="text-[10px] text-cyber-muted flex items-center space-x-1">
            <span>Via rewind & fix</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* 4. Revenue Saved */}
      <div
        onClick={() => {
          soundEffects.playClick();
          setActiveTab('digitaltwin');
        }}
        className="p-3.5 rounded-xl hud-panel border border-cyber-border/80 flex items-center space-x-3 cursor-pointer hover:border-cyber-amber/50 hover:scale-[1.01] transition-all"
        title="Click to open Digital Twin sandbox"
      >
        <div className="w-10 h-10 rounded-lg bg-cyber-amber/15 border border-cyber-amber/40 flex items-center justify-center text-cyber-amber shadow-neon-amber flex-shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-cyber-muted uppercase block">Estimated Revenue Saved</span>
          <div className="text-base font-bold text-cyber-amber text-glow-amber">$17,140 USD</div>
          <span className="text-[10px] text-cyber-muted flex items-center space-x-1">
            <span>From dropped checkouts</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
