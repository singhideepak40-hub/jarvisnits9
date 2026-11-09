import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Filter, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function HeroAlertCollapse({ rawCount = 247, relevantCount = 38, incidentCount = 1 }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [animatedRaw, setAnimatedRaw] = useState(rawCount);

  // Generate 48 particle dots for the visual collapse animation
  const dots = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    initialX: (i % 8 - 3.5) * 45 + (Math.sin(i) * 15),
    initialY: (Math.floor(i / 8) - 2.5) * 25 + (Math.cos(i) * 12),
    color: i % 4 === 0 ? '#FF2A55' : (i % 3 === 0 ? '#FF9F1C' : '#00F2FE')
  }));

  const replayCollapse = () => {
    soundEffects.playAlert();
    setIsCollapsed(false);
    setTimeout(() => {
      soundEffects.playSuccess();
      setIsCollapsed(true);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden rounded-xl hud-panel p-5 border border-cyber-border/80 bg-gradient-to-br from-cyber-panel via-cyber-card/60 to-cyber-bg">
      {/* Background Cyber Scanning Grid */}
      <div className="absolute inset-0 bg-cyber-cyan/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: The Narrative Headline */}
        <div className="flex-1 space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>NOISE COLLAPSE ENGINE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            <span className="text-glow-red text-cyber-red">247</span> Raw Alerts{' '}
            <span className="text-cyber-muted text-xl font-normal">→</span>{' '}
            <span className="text-glow-cyan text-cyber-cyan">1</span> Root Cause
          </h2>

          <p className="text-xs text-cyber-muted max-w-xl font-sans leading-relaxed">
            Multi-signal correlation filters 84.6% decoy telemetry noise, tracing upstream dependency paths to isolate the single point of failure before cascade saturation.
          </p>

          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={replayCollapse}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-cyan/40 hover:bg-cyber-cyan/10 text-cyber-cyan text-xs font-mono font-semibold transition-all shadow-neon-cyan cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY COLLAPSE HERO</span>
            </button>
            <span className="text-[11px] font-mono text-cyber-muted">
              Reduction: <span className="text-cyber-green font-bold">92.6% Noise Filtered</span>
            </span>
          </div>
        </div>

        {/* Center/Right: Particle Collapse Graphic */}
        <div className="relative w-72 h-44 flex items-center justify-center rounded-xl bg-cyber-bg/80 border border-cyber-border overflow-hidden">
          {/* Radar circle guides */}
          <div className="absolute w-36 h-36 rounded-full border border-cyber-cyan/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute w-24 h-24 rounded-full border border-cyber-blue/30" />

          {/* Dots floating or collapsed */}
          <AnimatePresence>
            {!isCollapsed ? (
              dots.map(dot => (
                <motion.div
                  key={dot.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: dot.initialX,
                    y: dot.initialY,
                    opacity: 0.8,
                    scale: 1
                  }}
                  exit={{ x: 0, y: 0, opacity: 0.9, scale: 0.2 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: dot.color, boxShadow: `0 0 6px ${dot.color}` }}
                />
              ))
            ) : (
              // Collapsed Hero Pulse Node
              <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative flex items-center justify-center w-20 h-20 rounded-full bg-cyber-red/20 border-2 border-cyber-red shadow-neon-red"
              >
                <div className="w-12 h-12 rounded-full bg-cyber-red/40 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge overlays */}
          <div className="absolute bottom-2 inset-x-2 flex justify-between text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-card/90 border border-cyber-border text-cyber-muted">
            <span>Raw: <strong className="text-cyber-red">{rawCount}</strong></span>
            <span>Filtered: <strong className="text-cyber-cyan">{relevantCount}</strong></span>
            <span>Target: <strong className="text-cyber-green">{incidentCount}</strong></span>
          </div>
        </div>

        {/* Right: Stage Step Metric Chips */}
        <div className="flex flex-row lg:flex-col gap-2.5">
          <div className="px-3.5 py-2 rounded-lg bg-cyber-card/70 border border-cyber-red/30 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center font-mono text-xs font-bold text-cyber-red">
              247
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Stage 1: Raw Signals</div>
              <div className="text-xs font-bold text-cyber-text">Spurious Alerts</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-cyber-card/70 border border-cyber-amber/30 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyber-amber/10 border border-cyber-amber/30 flex items-center justify-center font-mono text-xs font-bold text-cyber-amber">
              38
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Stage 2: Correlated</div>
              <div className="text-xs font-bold text-cyber-text">Temporal Cluster</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-cyber-card/70 border border-cyber-green/40 flex items-center space-x-3 shadow-neon-green">
            <div className="w-8 h-8 rounded-full bg-cyber-green/20 border border-cyber-green/50 flex items-center justify-center font-mono text-xs font-bold text-cyber-green">
              1
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Stage 3: Justified Root</div>
              <div className="text-xs font-bold text-cyber-green">Core DB Pool Fix</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
