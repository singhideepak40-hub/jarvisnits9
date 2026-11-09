import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cpu, Terminal, Radio } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function BootAnimation({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { text: 'INITIALIZING J.A.R.V.I.S. CORE SUBSYSTEMS...', icon: Terminal },
    { text: 'LOADING IN-MEMORY TEMPORAL KNOWLEDGE GRAPH...', icon: Cpu },
    { text: 'ESTABLISHING DISTRIBUTED TELEMETRY SYNAPSE...', icon: Radio },
    { text: 'REASONING & ROOT CAUSE MATRIX ONLINE.', icon: ShieldAlert }
  ];

  useEffect(() => {
    soundEffects.playBoot();
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1400);
    const timer3 = setTimeout(() => setStep(3), 2100);
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyber-bg bg-opacity-95 backdrop-blur-xl"
    >
      {/* Iron-Man HUD Arc Ring */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-8">
        <div className="absolute inset-0 rounded-full border border-cyber-cyan border-opacity-30 animate-ping" />
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyber-blue animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-8 rounded-full border border-cyber-cyan border-opacity-50 animate-pulse" />
        <div className="absolute inset-14 rounded-full bg-cyber-cyan bg-opacity-10 backdrop-blur-md flex items-center justify-center shadow-neon-cyan">
          <ShieldAlert className="w-16 h-16 text-cyber-cyan animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-blue uppercase text-glow-cyan">
        J.A.R.V.I.S.
      </h1>
      <p className="text-xs text-cyber-cyan tracking-widest font-mono uppercase mt-1 opacity-80">
        Justified Analysis & Reasoning Incident Visualizer System
      </p>

      {/* Boot progress text */}
      <div className="mt-8 flex flex-col items-center min-h-[48px]">
        <AnimatePresence mode="wait">
          {steps[step] && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 text-sm font-mono text-cyber-text"
            >
              {React.createElement(steps[step].icon, { className: "w-4 h-4 text-cyber-cyan animate-spin" })}
              <span className="tracking-wide">{steps[step].text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-72 h-1 bg-cyber-border rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-blue shadow-neon-cyan"
            initial={{ width: '10%' }}
            animate={{ width: `${(step + 1) * 25}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      <button
        onClick={onComplete}
        className="mt-6 text-xs text-cyber-muted hover:text-cyber-cyan font-mono tracking-widest transition-colors cursor-pointer"
      >
        [ PRESS ANY KEY OR CLICK TO SKIP ]
      </button>
    </motion.div>
  );
}
