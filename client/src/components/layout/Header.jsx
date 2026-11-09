import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Volume2, VolumeX, Flame, RotateCcw, MonitorPlay, MessageSquare, Mic, ShieldAlert, Cpu } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function Header() {
  const {
    systemStatus,
    ecgStatus,
    isMuted,
    toggleMute,
    resetSimulation,
    isWarRoomOpen,
    setIsWarRoomOpen,
    isChatOpen,
    setIsChatOpen,
    isVoiceListening,
    setIsVoiceListening,
    triggerChaos,
    isBackendConnected
  } = useJarvis();

  // Handle ECG heartbeat line visual styling
  const ecgStrokeColor = ecgStatus === 'alarm' 
    ? '#FF2A55' 
    : (ecgStatus === 'irregular' ? '#FF9F1C' : '#00F0A0');

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-cyber-border bg-cyber-panel/90 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyber-card border border-cyber-cyan/40 shadow-neon-cyan">
          <ShieldAlert className="w-6 h-6 text-cyber-cyan animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-blue">
              J.A.R.V.I.S.
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              v2.0 HUD
            </span>
            {isBackendConnected ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-green/10 border border-cyber-green/30 text-cyber-green flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
                <span>WS LIVE</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-amber/10 border border-cyber-amber/30 text-cyber-amber">
                EDGE HYBRID
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-cyber-muted tracking-tight">
            Justified Analysis & Reasoning Incident Visualizer System
          </p>
        </div>
      </div>

      {/* I8: Early Warning Heartbeat ECG Line */}
      <div className="hidden lg:flex items-center space-x-3 px-4 py-1.5 rounded-lg bg-cyber-card/60 border border-cyber-border/70">
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-wider">Telemetry ECG</span>
          <span className={`text-xs font-mono font-bold ${
            ecgStatus === 'alarm' ? 'text-cyber-red animate-pulse' : (ecgStatus === 'irregular' ? 'text-cyber-amber' : 'text-cyber-green')
          }`}>
            {ecgStatus === 'alarm' ? 'ALARM: CORRELATED CASCADE' : (ecgStatus === 'irregular' ? 'WARNING: ANOMALIES' : 'STEADY PULSE 72 BPM')}
          </span>
        </div>

        {/* Dynamic ECG Waveform SVG */}
        <div className="relative w-48 h-8 overflow-hidden rounded bg-cyber-bg border border-cyber-border">
          <svg className="w-[400px] h-8 animate-ecg" viewBox="0 0 400 32" fill="none">
            {ecgStatus === 'alarm' ? (
              // Sharp ventricular fibrillation / alarm pattern
              <path
                d="M0 16 L20 16 L28 4 L34 28 L42 2 L50 26 L58 16 L80 16 L100 16 L108 4 L114 28 L122 2 L130 26 L138 16 L160 16 L180 16 L188 4 L194 28 L202 2 L210 26 L218 16 L240 16 L260 16 L268 4 L274 28 L282 2 L290 26 L298 16 L320 16 L340 16 L348 4 L354 28 L362 2 L370 26 L378 16 L400 16"
                stroke={ecgStrokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : ecgStatus === 'irregular' ? (
              // Arrhythmic wave
              <path
                d="M0 16 L25 16 L30 8 L35 24 L40 16 L60 16 L80 16 L90 5 L98 27 L105 16 L130 16 L150 16 L160 8 L170 22 L178 16 L200 16 L225 16 L230 8 L235 24 L240 16 L260 16 L280 16 L290 5 L298 27 L305 16 L330 16 L350 16 L360 8 L370 22 L378 16 L400 16"
                stroke={ecgStrokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              // Healthy steady rhythm
              <path
                d="M0 16 L40 16 L48 10 L54 22 L60 4 L68 28 L74 16 L90 16 L140 16 L148 10 L154 22 L160 4 L168 28 L174 16 L190 16 L240 16 L248 10 L254 22 L260 4 L268 28 L274 16 L290 16 L340 16 L348 10 L354 22 L360 4 L368 28 L374 16 L400 16"
                stroke={ecgStrokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Control Actions & Audio Toggle */}
      <div className="flex items-center space-x-2.5">
        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
          className={`p-2 rounded-lg border font-mono text-xs transition-colors cursor-pointer ${
            isMuted 
              ? 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-white' 
              : 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan shadow-neon-cyan'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* W2: Voice Assistant Trigger */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsVoiceListening(!isVoiceListening);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
            isVoiceListening
              ? 'bg-cyber-red/20 border-cyber-red text-cyber-red shadow-neon-red animate-pulse'
              : 'bg-cyber-card border-cyber-border hover:border-cyber-cyan/50 text-cyber-text'
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${isVoiceListening ? 'text-cyber-red' : 'text-cyber-cyan'}`} />
          <span className="hidden sm:inline font-bold">"Hey JARVIS"</span>
        </button>

        {/* P5: AI Assistant Modal */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsChatOpen(!isChatOpen);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-cyan/40 hover:bg-cyber-cyan/10 text-cyber-cyan font-mono text-xs transition-all shadow-neon-cyan cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">AI Chat</span>
        </button>

        {/* W9: War Room Mode */}
        <button
          onClick={() => {
            soundEffects.playAlert();
            setIsWarRoomOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-red/20 border border-cyber-red hover:bg-cyber-red/30 text-cyber-red font-mono text-xs font-bold transition-all shadow-neon-red cursor-pointer"
        >
          <MonitorPlay className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">WAR ROOM</span>
        </button>

        {/* Reset System */}
        <button
          onClick={resetSimulation}
          title="Reset Simulation State"
          className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-muted text-cyber-muted hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
