import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Search, Filter, FileText } from 'lucide-react';

export default function NormalizedLogTable() {
  const { events, setSelectedLog, setSelectedNodeId } = useJarvis();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="calm-card p-5 space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-surface-border gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Normalized Banking Telemetry Log Stream
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to inspect distributed trace spans and payload JSON.
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
              placeholder="Search logs or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-bg border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 w-full sm:w-56"
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
            <tr className="bg-surface-bg/80 border-b border-surface-border text-slate-400 text-[11px]">
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
                  className="hover:bg-surface-hover/60 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      isCrit
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
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
                    className="py-2 px-3 whitespace-nowrap font-medium text-slate-200 hover:text-brand-400 hover:underline"
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
                      <span className="block text-[10px] text-slate-400 italic mt-0.5">
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
