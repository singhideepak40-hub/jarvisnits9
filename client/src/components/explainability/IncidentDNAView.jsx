import React from 'react';
import { Dna, CheckCircle2, History, ArrowRight } from 'lucide-react';

export default function IncidentDNAView({ fingerprintData }) {
  const currentBarcode = fingerprintData?.currentBarcode || [
    { color: '#FF0055', width: 16, label: 'Origin: core-db' },
    { color: '#FF5E00', width: 24, label: 'Spread: Cascade Depth 4' },
    { color: '#00F2FE', width: 12, label: 'Velocity: 1.2 hops/m' },
    { color: '#7928CA', width: 24, label: 'Error: HikariCP Exhaust' },
    { color: '#FF0080', width: 24, label: 'Severity: P1 Critical' }
  ];

  const topMatch = fingerprintData?.topMatch || {
    id: 'INC-HIST-014',
    title: 'DB Connection Pool Exhaustion (Black Friday Peak)',
    date: '2024-11-29',
    matchPercentage: 87.4,
    resolutionPlaybook: 'Scale connection pool to 500 & terminate idle backend queries',
    resolutionTime: '4m 12s',
    barcode: [
      { color: '#FF0055', width: 14, label: 'Origin: DB Pool' },
      { color: '#FF5E00', width: 22, label: 'Spread: Auth->Gateway' },
      { color: '#00F2FE', width: 8, label: 'Velocity: 4.2m' },
      { color: '#7928CA', width: 26, label: 'Type: 504 Gateway' },
      { color: '#FF0080', width: 30, label: 'Severity: P1 Critical' }
    ]
  };

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Dna className="w-4 h-4 text-cyber-purple animate-pulse" />
          <span>INCIDENT DNA FINGERPRINT MATCHING (I1 VECTOR SIMILARITY)</span>
        </div>
        <span className="text-xs font-mono font-bold text-cyber-green">
          {topMatch.matchPercentage}% Cosine Similarity Match
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Incident DNA Barcode */}
        <div className="p-4 rounded-xl border border-cyber-cyan/50 bg-cyber-card/80 font-mono">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-cyber-cyan font-bold uppercase">Current Incident DNA #INC-2026-001</span>
            <span className="text-[10px] text-cyber-muted">Active Pattern</span>
          </div>

          {/* Graphical DNA Barcode */}
          <div className="h-8 rounded bg-cyber-bg flex overflow-hidden border border-cyber-border my-3 p-1 space-x-1">
            {currentBarcode.map((segment, idx) => (
              <div
                key={idx}
                className="h-full rounded-sm"
                style={{
                  width: `${segment.width}%`,
                  backgroundColor: segment.color,
                  boxShadow: `0 0 8px ${segment.color}40`
                }}
                title={segment.label}
              />
            ))}
          </div>

          <div className="text-[11px] text-cyber-muted space-y-1">
            <div>Vector: [Origin: Core-DB, Spread: 4-hop, Velocity: Fast, Type: PoolWait]</div>
          </div>
        </div>

        {/* Historical Past Incident Match */}
        <div className="p-4 rounded-xl border border-cyber-purple/50 bg-cyber-card/80 font-mono">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-cyber-purple font-bold uppercase">{topMatch.id}: {topMatch.title}</span>
            <span className="text-[10px] text-cyber-muted">{topMatch.date}</span>
          </div>

          {/* Historical DNA Barcode */}
          <div className="h-8 rounded bg-cyber-bg flex overflow-hidden border border-cyber-border my-3 p-1 space-x-1">
            {topMatch.barcode.map((segment, idx) => (
              <div
                key={idx}
                className="h-full rounded-sm"
                style={{
                  width: `${segment.width}%`,
                  backgroundColor: segment.color,
                  boxShadow: `0 0 8px ${segment.color}40`
                }}
                title={segment.label}
              />
            ))}
          </div>

          <div className="text-[11px] text-cyber-green flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Proven fix in 2024: <strong>{topMatch.resolutionPlaybook}</strong> (Resolved in {topMatch.resolutionTime})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
