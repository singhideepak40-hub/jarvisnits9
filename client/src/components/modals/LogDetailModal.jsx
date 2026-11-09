import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Copy, Check, Terminal, Sparkles, Clock, Server, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function LogDetailModal() {
  const { selectedLog, setSelectedLog, setIsChatOpen } = useJarvis();
  const [copied, setCopied] = useState(false);

  if (!selectedLog) return null;

  const copyPayload = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const askAiAboutLog = () => {
    soundEffects.playClick();
    setSelectedLog(null);
    setIsChatOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-2xl rounded-2xl hud-panel border border-cyber-cyan shadow-neon-cyan overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyber-border bg-cyber-card/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan text-cyber-cyan flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase">{selectedLog.service}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  selectedLog.severity === 'CRITICAL' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red' : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan'
                }`}>
                  {selectedLog.severity}
                </span>
              </div>
              <span className="text-[10px] text-cyber-muted">
                Timestamp: {selectedLog.timestamp}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedLog(null);
            }}
            className="text-cyber-muted hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Message Banner */}
          <div className="p-3 rounded-lg bg-cyber-card/90 border border-cyber-border text-cyber-text">
            <span className="text-[10px] text-cyber-muted uppercase block mb-1">Message Payload</span>
            <span className="text-white font-bold">{selectedLog.message}</span>
          </div>

          {/* Distributed Trace Span Waterfall */}
          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
            <div className="flex items-center justify-between text-[10px] text-cyber-muted uppercase pb-1 border-b border-cyber-border">
              <span>Distributed Trace Spans ({selectedLog.trace_id ? selectedLog.trace_id.slice(0, 16) : 'trace-core-8819'}...)</span>
              <span>Total Latency: 4,892ms</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-cyber-muted w-24">web-portal</span>
                <div className="flex-1 mx-2 h-2 bg-cyber-card rounded-full overflow-hidden">
                  <div className="bg-cyber-cyan h-full w-[4%]" />
                </div>
                <span className="text-cyber-cyan font-mono text-[10px]">14ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cyber-muted w-24">api-gateway</span>
                <div className="flex-1 mx-2 h-2 bg-cyber-card rounded-full overflow-hidden">
                  <div className="bg-cyber-blue h-full w-[8%]" />
                </div>
                <span className="text-cyber-blue font-mono text-[10px]">38ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cyber-muted w-24">auth-service</span>
                <div className="flex-1 mx-2 h-2 bg-cyber-card rounded-full overflow-hidden">
                  <div className="bg-cyber-amber h-full w-[94%]" />
                </div>
                <span className="text-cyber-amber font-mono text-[10px]">4,820ms (WAIT)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cyber-red font-bold w-24">core-db</span>
                <div className="flex-1 mx-2 h-2 bg-cyber-card rounded-full overflow-hidden">
                  <div className="bg-cyber-red h-full w-[98%] shadow-neon-red" />
                </div>
                <span className="text-cyber-red font-mono text-[10px] font-bold">4,800ms [LOCK]</span>
              </div>
            </div>
          </div>

          {/* Raw JSON viewer */}
          <div className="relative">
            <div className="flex items-center justify-between text-[10px] text-cyber-muted uppercase mb-1">
              <span>Standard Normalized Schema Representation</span>
              <button
                onClick={copyPayload}
                className="flex items-center space-x-1 text-cyber-cyan hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-cyber-green" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-cyber-card/80 border border-cyber-border text-[11px] text-cyber-cyan overflow-x-auto">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={askAiAboutLog}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-bold hover:bg-cyber-cyan/30 transition-all shadow-neon-cyan cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask J.A.R.V.I.S. AI to Explain This Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
