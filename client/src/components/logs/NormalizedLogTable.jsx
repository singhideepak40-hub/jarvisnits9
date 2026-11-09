import React, { useState, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Search, Filter, FileText, Play, Pause, Radio } from 'lucide-react';

export default function NormalizedLogTable() {
  const { events, setEvents, setSelectedLog, setSelectedNodeId, currentScenarioPreset } = useJarvis();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Auto-stream incoming banking telemetry every 3.5 seconds if live streaming is ON
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const services = ['web-portal', 'api-gateway', 'auth-service', 'payment-service', 'notification-service'];
      const chosenService = services[Math.floor(Math.random() * services.length)];
      const randomTrace = `trace-bank-${Math.floor(1000 + Math.random() * 9000)}`;

      let newLog;
      if (currentScenarioPreset === 'db_pool') {
        const samples = [
          {
            service: 'core-db',
            severity: 'WARN',
            message: `HikariPool-1 - Connection acquisition wait queue increased: ${Math.floor(25 + Math.random() * 20)} threads waiting`,
            type: 'dependency'
          },
          {
            service: 'auth-service',
            severity: 'ERROR',
            message: `TokenVerificationTimeout: JWT session validation delayed by ${Math.floor(2000 + Math.random() * 3000)}ms on core-db`,
            type: 'timeout'
          },
          {
            service: 'api-gateway',
            severity: 'WARN',
            message: `HighLatencyWarning: Ingress /checkout latency threshold 3,500ms exceeded (actual: ${Math.floor(3600 + Math.random() * 1200)}ms)`,
            type: 'network'
          },
          {
            service: 'web-portal',
            severity: 'INFO',
            message: `CustomerStorefrontSession: Client ping received from session_${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'frontend'
          }
        ];
        newLog = samples[Math.floor(Math.random() * samples.length)];
      } else {
        newLog = {
          service: chosenService,
          severity: 'INFO',
          message: `HTTP 200 OK: Processed transaction request uid=cust_${Math.floor(1000 + Math.random() * 9000)} in 22ms`,
          type: 'network'
        };
      }

      const generatedEvent = {
        id: `ev-live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        service: newLog.service,
        severity: newLog.severity,
        message: newLog.message,
        type: newLog.type,
        trace_id: randomTrace,
        signalScore: newLog.severity === 'ERROR' ? 0.92 : (newLog.severity === 'WARN' ? 0.65 : 0.15)
      };

      setEvents(prev => [generatedEvent, ...prev.slice(0, 149)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, currentScenarioPreset, setEvents]);

  const filteredLogs = events.filter(e => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchMsg = e.message.toLowerCase().includes(term);
      const matchSvc = e.service.toLowerCase().includes(term);
      if (!matchMsg && !matchSvc) return false;
    }
    return true;
  });

  return (
    <div className="calm-card p-5 space-y-4 select-none border border-surface-border">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-surface-border gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white">
              Normalized Banking Telemetry Log Stream
            </h3>
            {/* Live Streaming Pill */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border cursor-pointer transition-colors ${
                isLiveStreaming
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Click to pause or resume live simulated streaming"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isLiveStreaming ? 'Streaming Live' : 'Stream Paused'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to inspect distributed trace spans, timing watermarks, and JSON payload.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Severity */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-surface-bg border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="ERROR">Error</option>
            <option value="WARN">Warning</option>
            <option value="INFO">Info</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search message or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-bg border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Quick Service Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 text-[11px] mr-1">Filter by Service:</span>
        {['core-db', 'auth-service', 'api-gateway', 'payment-service', 'notification-service'].map((svc) => (
          <button
            key={svc}
            onClick={() => setSearchTerm(searchTerm === svc ? '' : svc)}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer border ${
              searchTerm === svc
                ? 'bg-brand-500/15 border-brand-500/30 text-brand-400 font-medium'
                : 'bg-surface-bg border-surface-border text-slate-400 hover:text-white'
            }`}
          >
            {svc}
          </button>
        ))}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2 cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto rounded-lg border border-surface-border">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-bg/90 border-b border-surface-border text-slate-400 text-[11px] sticky top-0 z-10 backdrop-blur-sm">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Service</th>
              <th className="py-2.5 px-3">Trace ID</th>
              <th className="py-2.5 px-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {filteredLogs.map((log, idx) => {
              const isCrit = log.severity === 'CRITICAL';
              const isErr = log.severity === 'ERROR';

              return (
                <tr
                  key={log.id || idx}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-surface-hover/70 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      isCrit
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold'
                        : (isErr ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}>
                      {log.severity}
                    </span>
                  </td>

                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(log.service);
                    }}
                    className="py-2 px-3 whitespace-nowrap font-medium text-slate-200 group-hover:text-brand-400"
                    title="Click to inspect service node"
                  >
                    {log.service}
                  </td>

                  <td className="py-2 px-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {log.trace_id ? log.trace_id.slice(0, 14) : 'sys-trace'}
                  </td>

                  <td className="py-2 px-3 text-slate-300 text-xs max-w-lg truncate">
                    {log.message}
                    {log.rejectionReason && (
                      <span className="block text-[10px] text-slate-500 italic mt-0.5">
                        ↳ [Noise Separation]: {log.rejectionReason}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
