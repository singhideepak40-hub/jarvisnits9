import React, { useState } from 'react';
import { Clock, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import TrendLineChart from './TrendLineChart';

export default function FailureConeView() {
  const [mitigatedIds, setMitigatedIds] = useState(new Set());

  const upcomingErrors = [
    {
      id: 'err-1',
      service: 'auth-service',
      serviceName: 'Auth Service',
      predictedError: 'java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available within 5000ms',
      timeRemaining: '01:45',
      timeLabel: 'In ~1.5 minutes',
      probability: 96,
      rootSignal: 'Active connection pool usage reached 98/100 slots on Core PostgreSQL DB.',
      impact: 'Will cause user login and authentication verification requests to stall.',
      recommendedFix: 'Scale database connection ceiling to 500 to relieve thread starvation.'
    },
    {
      id: 'err-2',
      service: 'api-gateway',
      serviceName: 'API Gateway',
      predictedError: 'HTTP 504 Gateway Timeout: Upstream /checkout/pay took > 10,000ms',
      timeRemaining: '03:10',
      timeLabel: 'In ~3 minutes',
      probability: 91,
      rootSignal: 'Auth Service latency rose from 35ms to 4,800ms over the last 90 seconds.',
      impact: 'Mobile app and web storefront checkouts will display 504 error pages.',
      recommendedFix: 'Enable circuit breaker shedding on non-critical checkout validations.'
    },
    {
      id: 'err-3',
      service: 'payment-service',
      serviceName: 'Payment Service',
      predictedError: 'PaymentTransactionException: Core DB write lock timed out. Debit rolled back.',
      timeRemaining: '05:40',
      timeLabel: 'In ~5.5 minutes',
      probability: 85,
      rootSignal: 'Downstream lock queues climbing linearly following Auth Service timeouts.',
      impact: '142 customer checkout transactions will fail and require manual retry.',
      recommendedFix: 'Route failed orders to idempotent background dead-letter retry queue.'
    }
  ];

  const handleMitigate = (id) => {
    setMitigatedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner (Peaceful, human explanation) */}
      <div className="calm-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Predictive Error Forecast
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              By analyzing incoming log velocity and rolling metric trends, J.A.R.V.I.S. anticipates downstream errors before they occur in production, giving engineers time to act before users are affected.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            3 Impending Failures Detected
          </span>
        </div>
      </div>

      {/* SECTION 1: Predicted Upcoming Errors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">
            Impending Errors Predicted from Log Stream
          </h3>
          <span className="text-xs text-slate-400">
            Ranked by urgency (time until occurrence)
          </span>
        </div>

        <div className="space-y-3">
          {upcomingErrors.map((err) => {
            const isMitigated = mitigatedIds.has(err.id);

            return (
              <div
                key={err.id}
                className={`p-4 rounded-xl border transition-all ${
                  isMitigated
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'calm-card hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isMitigated ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
                    <span className="text-sm font-semibold text-white">
                      {err.serviceName}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      Target: {err.service}
                    </span>
                  </div>

                  {/* Urgency & Certainty */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isMitigated ? 'Prevented' : `Breach in ${err.timeLabel} (${err.timeRemaining})`}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {err.probability}% Probability
                    </span>
                  </div>
                </div>

                {/* Error Details */}
                <div className="py-3 space-y-2">
                  <div className="p-2.5 rounded-lg bg-surface-bg border border-surface-border font-mono text-xs text-rose-300/90 break-all">
                    {err.predictedError}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Why this will happen:</span>
                      <span className="text-slate-300">{err.rootSignal}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">User Impact:</span>
                      <span className="text-slate-300">{err.impact}</span>
                    </div>
                  </div>
                </div>

                {/* Actionable Prevention Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-surface-border">
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500">Preventive Fix: </span>
                    <span className="text-slate-200">{err.recommendedFix}</span>
                  </div>

                  <button
                    onClick={() => handleMitigate(err.id)}
                    disabled={isMitigated}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      isMitigated
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25'
                    }`}
                  >
                    {isMitigated ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mitigation Applied</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Apply Preventive Mitigation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Cascade Progression Timeline */}
      <div className="calm-card p-5">
        <h3 className="text-sm font-semibold text-white mb-2">
          Anticipated Cascade Progression Timeline
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          How this outage will naturally spread downstream across banking services if left unaddressed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-surface-card border border-rose-500/30">
            <span className="text-[10px] uppercase font-semibold text-rose-400 block mb-0.5">Stage 1 (Now)</span>
            <div className="font-medium text-white">Core DB Exhaustion</div>
            <p className="text-[11px] text-slate-400 mt-1">Pool connections hit 98/100 slots.</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-card border border-amber-500/30">
            <span className="text-[10px] uppercase font-semibold text-amber-400 block mb-0.5">Stage 2 (+2 Mins)</span>
            <div className="font-medium text-white">Auth Session Timeout</div>
            <p className="text-[11px] text-slate-400 mt-1">Token validation latency exceeds 5,000ms.</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-card border border-slate-700">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Stage 3 (+5 Mins)</span>
            <div className="font-medium text-white">Checkout 504 Timeouts</div>
            <p className="text-[11px] text-slate-400 mt-1">API gateway ingress trips circuit limits.</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-card border border-slate-700">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Stage 4 (+8 Mins)</span>
            <div className="font-medium text-white">Payment Rollbacks</div>
            <p className="text-[11px] text-slate-400 mt-1">Transactions deadlocked and reversed.</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Metric Projection Trend */}
      <TrendLineChart />
    </div>
  );
}
