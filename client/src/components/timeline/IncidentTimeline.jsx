import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, ShieldAlert, ArrowDown, Zap } from 'lucide-react';
import { useJarvis } from '../../context/JarvisContext';
import { soundEffects } from '../../engine/soundEffects';

export default function IncidentTimeline() {
  const { incidentDetails, timeScrubberValue, setTimeScrubberValue } = useJarvis();
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineSteps = [
    {
      time: '10:41:00 AM',
      service: 'core-db',
      level: 'CRITICAL',
      event: 'Root Trigger: HikariPool connection pool saturation (98/100 connections). Active query contention.',
      blastRadius: 1
    },
    {
      time: '10:41:30 AM',
      service: 'auth-service',
      level: 'ERROR',
      event: 'Cascade Step 1: Auth worker threads timeout waiting for user session query execution (>5000ms).',
      blastRadius: 2
    },
    {
      time: '10:42:00 AM',
      service: 'api-gateway',
      level: 'CRITICAL',
      event: 'Cascade Step 2: HTTP 504 Gateway Timeout returned to upstream mobile and web checkout ingress.',
      blastRadius: 3
    },
    {
      time: '10:42:45 AM',
      service: 'payment-service',
      level: 'CRITICAL',
      event: 'Cascade Step 3: Checkout transaction commit deadlocks; payment rollback triggered for 142 orders.',
      blastRadius: 4
    },
    {
      time: '10:43:15 AM',
      service: 'notification-service',
      level: 'WARN',
      event: 'Cascade Step 4: Dead letter queue receives surge of failed payment transaction alerts.',
      blastRadius: 5
    }
  ];

  // Playback timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeScrubberValue(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, setTimeScrubberValue]);

  const togglePlay = () => {
    soundEffects.playClick();
    if (timeScrubberValue >= 100) {
      setTimeScrubberValue(0);
    }
    setIsPlaying(!isPlaying);
  };

  const resetScrubber = () => {
    soundEffects.playClick();
    setIsPlaying(false);
    setTimeScrubberValue(0);
  };

  // Determine active steps visible at current scrubber value
  const visibleStepIndex = Math.floor((timeScrubberValue / 100) * (timelineSteps.length - 1));

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-cyber-border/70 gap-3">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Clock className="w-4 h-4 text-cyber-cyan" />
          <span>INCIDENT SPREAD TIMELINE & ANIMATED REPLAY (F5 / W6)</span>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-cyber-red/20 border-cyber-red text-cyber-red shadow-neon-red'
                : 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan hover:bg-cyber-cyan/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyber-cyan" />}
            <span>{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
          </button>

          <button
            onClick={resetScrubber}
            title="Rewind to T-0"
            className="p-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-muted text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Time Scrubber Slider (W6) */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyber-muted">Timeline Scrubber:</span>
          <span className="text-cyber-cyan font-bold">
            T+{Math.round((timeScrubberValue / 100) * 195)}s / Current Blast Radius: {visibleStepIndex + 1} Services
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={timeScrubberValue}
          onChange={(e) => setTimeScrubberValue(Number(e.target.value))}
          className="w-full accent-cyber-cyan cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-cyber-muted">
          <span>10:41:00 AM (T-0 Root)</span>
          <span>10:42:00 AM</span>
          <span>10:43:15 AM (Full Cascade)</span>
        </div>
      </div>

      {/* Vertical Cascade Progression */}
      <div className="relative pl-6 space-y-4 pt-2 border-l-2 border-cyber-border/80 ml-3">
        {timelineSteps.map((step, idx) => {
          const isPassed = idx <= visibleStepIndex;
          const isCurrent = idx === visibleStepIndex;

          return (
            <div
              key={idx}
              className={`relative transition-all duration-300 ${
                isPassed ? 'opacity-100' : 'opacity-30'
              }`}
            >
              {/* Dot on line */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isCurrent
                    ? 'border-cyber-red bg-cyber-red shadow-neon-red animate-ping'
                    : (isPassed ? 'border-cyber-cyan bg-cyber-cyan/30' : 'border-cyber-border bg-cyber-bg')
                }`}
              />

              <div className={`p-3 rounded-lg border font-mono ${
                isCurrent
                  ? 'border-cyber-red/60 bg-cyber-red/10 shadow-neon-red'
                  : 'border-cyber-border/70 bg-cyber-card/60'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-cyber-cyan font-bold">{step.time}</span>
                    <span className="text-white font-bold uppercase">{step.service}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    step.level === 'CRITICAL' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40' : (
                      step.level === 'ERROR' ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40' : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                    )
                  }`}>
                    {step.level}
                  </span>
                </div>

                <p className="text-xs text-cyber-muted font-sans leading-tight">
                  {step.event}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
