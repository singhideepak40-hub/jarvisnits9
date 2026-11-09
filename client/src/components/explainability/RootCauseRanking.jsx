import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';

export default function RootCauseRanking({ rootCauseData }) {
  const topCauses = rootCauseData?.topCauses || [
    {
      rank: 1,
      service: 'core-db',
      confidence: 91,
      firstAnomalyTime: new Date(Date.now() - 140000).toISOString(),
      downstreamCount: 4,
      primaryLog: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, maxWait=5000ms'
    },
    {
      rank: 2,
      service: 'auth-service',
      confidence: 26,
      firstAnomalyTime: new Date(Date.now() - 110000).toISOString(),
      downstreamCount: 2,
      primaryLog: 'PoolWaitTimeout: Unable to acquire DB session for token validation'
    },
    {
      rank: 3,
      service: 'api-gateway',
      confidence: 14,
      firstAnomalyTime: new Date(Date.now() - 80000).toISOString(),
      downstreamCount: 1,
      primaryLog: 'HTTP 504 Gateway Timeout: Upstream services timed out'
    }
  ];

  return (
    <div className="rounded-xl hud-panel p-4 border border-cyber-border">
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-3">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-cyber-red animate-pulse" />
          <span>JUSTIFIED ROOT CAUSE DETECTOR (F3 RANKED CAUSES)</span>
        </div>
        <span className="text-[10px] font-mono text-cyber-muted">
          Algorithm: Earliest Anomaly + Downstream Graph Depth
        </span>
      </div>

      <div className="space-y-3">
        {topCauses.map(cause => {
          const isRank1 = cause.rank === 1;

          return (
            <div
              key={cause.rank}
              className={`p-3 rounded-lg border font-mono transition-all ${
                isRank1
                  ? 'border-cyber-red/60 bg-cyber-red/10 shadow-neon-red'
                  : 'border-cyber-border bg-cyber-card/50 text-cyber-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isRank1 ? 'bg-cyber-red text-white' : 'bg-cyber-card text-cyber-muted border border-cyber-border'
                  }`}>
                    #{cause.rank}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-white uppercase">{cause.service}</span>
                    <span className="text-[10px] text-cyber-muted ml-2">
                      ({cause.downstreamCount} downstream microservices cascaded)
                    </span>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-cyber-bg rounded-full overflow-hidden border border-cyber-border">
                    <div
                      className={`h-full rounded-full ${
                        isRank1 ? 'bg-cyber-red shadow-neon-red' : 'bg-cyber-muted'
                      }`}
                      style={{ width: `${cause.confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${isRank1 ? 'text-cyber-red' : 'text-cyber-muted'}`}>
                    {cause.confidence}%
                  </span>
                </div>
              </div>

              {/* Primary Evidence Log */}
              <div className="text-[11px] bg-cyber-bg/90 p-2 rounded border border-cyber-border/70 text-cyber-text truncate">
                <span className="text-cyber-cyan mr-1.5 font-bold">[T-0 TELEMETRY]:</span>
                {cause.primaryLog}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
