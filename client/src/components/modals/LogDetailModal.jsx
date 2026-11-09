import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Copy, Check, Terminal, Sparkles } from 'lucide-react';

export default function LogDetailModal() {
  const { selectedLog, setSelectedLog, setIsChatOpen } = useJarvis();
  const [copied, setCopied] = useState(false);

  if (!selectedLog) return null;

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const askAiAboutLog = () => {
    setSelectedLog(null);
    setIsChatOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl rounded-xl calm-card shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-panel">
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-semibold text-white">{selectedLog.service}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(selectedLog.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <button
            onClick={() => setSelectedLog(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Message Box */}
          <div className="p-3 rounded-lg bg-surface-bg border border-surface-border">
            <span className="text-[11px] text-slate-400 block font-medium mb-1">Error Message</span>
            <span className="text-xs text-slate-100 font-mono leading-relaxed">{selectedLog.message}</span>
          </div>

          {/* Trace Waterfall */}
          <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-surface-border">
              <span>Distributed Request Trace ({selectedLog.trace_id ? selectedLog.trace_id.slice(0, 16) : 'trace-bank-8819'}...)</span>
              <span>Total: 4,892ms</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-24">web-portal</span>
                <div className="flex-1 mx-2 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full w-[4%]" />
                </div>
                <span className="text-slate-400 font-mono text-[10px]">14ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 w-24">api-gateway</span>
                <div className="flex-1 mx-2 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full w-[8%]" />
                </div>
                <span className="text-slate-400 font-mono text-[10px]">38ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-medium w-24">auth-service</span>
                <div className="flex-1 mx-2 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[94%]" />
                </div>
                <span className="text-amber-400 font-mono text-[10px]">4,820ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-medium w-24">core-db</span>
                <div className="flex-1 mx-2 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full w-[98%]" />
                </div>
                <span className="text-rose-400 font-mono text-[10px] font-semibold">4,800ms [LOCK]</span>
              </div>
            </div>
          </div>

          {/* Raw JSON viewer */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Standard Normalized Schema</span>
              <button
                onClick={copyPayload}
                className="flex items-center space-x-1 text-slate-300 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-surface-bg border border-surface-border text-[11px] text-slate-300 font-mono overflow-x-auto max-h-36">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={askAiAboutLog}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Ask AI to Explain This Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
