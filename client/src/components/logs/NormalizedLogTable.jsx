import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Filter, Sliders, Search, AlertCircle, ShieldCheck } from 'lucide-react';

export default function NormalizedLogTable() {
  const { events } = useJarvis();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [signalThreshold, setSignalThreshold] = useState(0.40); // 0 to 1
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = events.filter(e => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    if (searchTerm && !e.message.toLowerCase().includes(searchTerm.toLowerCase()) && !e.service.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4 font-mono">
      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-3 border-b border-cyber-border/70 gap-3">
        <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-bold">
          <Sliders className="w-4 h-4 text-cyber-cyan" />
          <span>NORMALIZED TELEMETRY EVENT STREAM ({filteredLogs.length} EVENTS)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
          {/* Signal Score Threshold Slider (I6) */}
          <div className="flex items-center space-x-2 bg-cyber-card px-2.5 py-1 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase">Signal Cutoff:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={signalThreshold}
              onChange={(e) => setSignalThreshold(Number(e.target.value))}
              className="w-20 accent-cyber-cyan cursor-pointer"
            />
            <span className="text-cyber-cyan font-bold">{signalThreshold}</span>
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-cyber-card border border-cyber-border rounded px-2.5 py-1 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="ERROR">Error Only</option>
            <option value="WARN">Warn Only</option>
            <option value="INFO">Info Only</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cyber-muted" />
            <input
              type="text"
              placeholder="Search telemetry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cyber-card border border-cyber-border rounded pl-8 pr-3 py-1 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-cyber-border text-cyber-muted text-[10px] uppercase">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Signal</th>
              <th className="py-2 px-3">Severity</th>
              <th className="py-2 px-3">Service</th>
              <th className="py-2 px-3">Trace ID</th>
              <th className="py-2 px-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40">
            {filteredLogs.map((e, idx) => {
              const signal = e.signalScore || 0.85;
              const isNoise = signal < signalThreshold;

              return (
                <tr
                  key={e.id || idx}
                  className={`transition-colors ${
                    isNoise
                      ? 'opacity-35 bg-cyber-bg hover:opacity-70'
                      : 'hover:bg-cyber-card/60'
                  }`}
                >
                  <td className="py-2 px-3 text-[10px] text-cyber-muted whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isNoise
                        ? 'bg-cyber-border text-cyber-muted'
                        : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                    }`}>
                      {signal} {isNoise ? '(NOISE)' : ''}
                    </span>
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      e.severity === 'CRITICAL' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40' : (
                        e.severity === 'ERROR' ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40' : 'bg-cyber-card text-cyber-muted border border-cyber-border'
                      )
                    }`}>
                      {e.severity}
                    </span>
                  </td>

                  <td className="py-2 px-3 whitespace-nowrap font-bold text-white uppercase text-[11px]">
                    {e.service}
                  </td>

                  <td className="py-2 px-3 text-[10px] text-cyber-muted whitespace-nowrap">
                    {e.trace_id ? e.trace_id.slice(0, 14) : 'sys-trace'}
                  </td>

                  <td className="py-2 px-3 text-cyber-text text-[11px] max-w-md truncate">
                    {e.message}
                    {e.rejectionReason && (
                      <span className="block text-[9px] text-cyber-amber italic mt-0.5">
                        ↳ [Noise Separation]: {e.rejectionReason}
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
