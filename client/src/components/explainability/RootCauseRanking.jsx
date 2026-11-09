import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RootCauseRanking({ rootCauseData }) {
  const { setSelectedNodeId, setSelectedLog } = useJarvis();

  const topCauses = rootCauseData?.topCauses || [
    {
      rank: 1,
      service: 'core-db',
      label: 'Core PostgreSQL DB',
      confidence: 91,
      firstAnomalyTime: '10:41:00 AM',
      downstreamCount: 4,
      primaryLog: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42',
      reason: 'First service to experience metric degradation. 4 downstream microservices depend on this database.'
    },
    {
      rank: 2,
      service: 'auth-service',
      label: 'Auth Service',
      confidence: 26,
      firstAnomalyTime: '10:41:30 AM',
      downstreamCount: 2,
      primaryLog: 'PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms',
      reason: 'Collateral victim: worker threads blocked waiting for database sessions.'
    },
    {
      rank: 3,
      service: 'api-gateway',
      label: 'API Gateway',
      confidence: 14,
      firstAnomalyTime: '10:42:00 AM',
      downstreamCount: 1,
      primaryLog: 'HTTP 504 Gateway Timeout: Upstream /auth/verify took >10000ms',
      reason: 'Surface symptom: returned gateway timeouts to web & mobile clients.'
    }
  ];

  return (
    <div className="calm-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Root Cause Analysis & Confidence Ranking
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by earliest anomaly timestamp, graph dependency depth, and causal signal strength.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Click any card to inspect
        </span>
      </div>

      <div className="space-y-3">
        {topCauses.map((cause) => {
          const isRank1 = cause.rank === 1;

          return (
            <div
              key={cause.rank}
              onClick={() => setSelectedNodeId(cause.service)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isRank1
                  ? 'bg-rose-950/15 border-rose-500/40 hover:border-rose-500/60'
                  : 'bg-surface-card border-surface-border hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-surface-border/60">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isRank1 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {cause.rank}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {cause.label || cause.service}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({cause.downstreamCount} downstream services impacted)
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-20 h-2 bg-surface-bg rounded-full overflow-hidden border border-surface-border">
                    <div
                      className={`h-full rounded-full ${isRank1 ? 'bg-rose-500' : 'bg-slate-500'}`}
                      style={{ width: `${cause.confidence}%` }}
                    />
                  </div>
                  <span className={`font-semibold ${isRank1 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {cause.confidence}% Confidence
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {cause.reason}
              </p>

              {/* Primary Evidence Log */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLog({
                    service: cause.service,
                    severity: isRank1 ? 'CRITICAL' : 'ERROR',
                    message: cause.primaryLog,
                    timestamp: cause.firstAnomalyTime,
                    trace_id: 'trace-bank-8819'
                  });
                }}
                className="p-2 rounded bg-surface-bg text-xs font-mono text-slate-300 border border-surface-border hover:border-brand-400/50 transition-colors truncate"
              >
                <span className="text-brand-400 mr-2 font-medium">[Initial Error]:</span>
                {cause.primaryLog}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
