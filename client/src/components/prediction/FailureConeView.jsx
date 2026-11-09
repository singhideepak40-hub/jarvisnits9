import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Sliders,
  AlertCircle,
  FileText,
  Activity,
  Zap
} from 'lucide-react';
import TrendLineChart from './TrendLineChart';
import { useJarvis } from '../../context/JarvisContext';

export default function FailureConeView() {
  const { healService } = useJarvis();
  const [mitigatedIds, setMitigatedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('UNCHECKED'); // 'UNCHECKED' | 'MITIGATED'

  // Live ticking countdown timers (seconds)
  const [timers, setTimers] = useState({
    'err-1': 105, // 1m 45s
    'err-2': 190, // 3m 10s
    'err-3': 340  // 5m 40s
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const upcomingErrors = [
    {
      id: 'err-1',
      service: 'auth-service',
      serviceName: 'Auth Service',
      predictedError: 'java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available within 5000ms',
      timeLabel: 'In ~1.5 minutes',
      probability: 96,
      logSignature: 'core-db: HikariPool-1 - Connection pool exhausted! Active: 98/100, pending checkout transactions: 42',
      trendRate: 'Connection consumption velocity: +4.8 slots/sec (Linear slope)',
      impact: 'User authentication & JWT validation will stall, locking out customer login sessions.',
      recommendedFix: 'Scale database connection ceiling to 500 to relieve thread starvation.',
      targetServiceId: 'auth-service'
    },
    {
      id: 'err-2',
      service: 'api-gateway',
      serviceName: 'API Gateway',
      predictedError: 'HTTP 504 Gateway Timeout: Upstream /checkout/pay took > 10,000ms',
      timeLabel: 'In ~3 minutes',
      probability: 91,
      logSignature: 'auth-service: PoolWaitTimeout: Unable to acquire DB session for token validation within 5000ms',
      trendRate: 'Auth Service P99 latency rose from 35ms to 4,800ms over last 90s',
      impact: 'Storefront checkouts and mobile banking transfers will fail with HTTP 504 timeouts.',
      recommendedFix: 'Enable circuit breaker load-shedding on non-critical checkout validations.',
      targetServiceId: 'api-gateway'
    },
    {
      id: 'err-3',
      service: 'payment-service',
      serviceName: 'Payment Service',
      predictedError: 'PaymentTransactionException: Core DB write lock timed out. Debit rolled back.',
      timeLabel: 'In ~5.5 minutes',
      probability: 85,
      logSignature: 'core-db: TransactionLockTimeout: Lock wait timeout exceeded; try restarting transaction',
      trendRate: 'Downstream lock queues climbing linearly following Auth Service timeouts',
      impact: '142 customer checkout transactions will fail and require manual retry.',
      recommendedFix: 'Route failed orders to idempotent background dead-letter retry queue.',
      targetServiceId: 'payment-service'
    }
  ];

  const handleMitigate = (err) => {
    setMitigatedIds(prev => new Set(prev).add(err.id));
    healService(err.targetServiceId);
  };

  const activeCount = upcomingErrors.length - mitigatedIds.size;

  return (
    <div className="space-y-6 select-none">
      {/* Intro Header */}
      <div className="calm-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-semibold text-white tracking-tight">
                Predictive Failure Forecast
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Log Telemetry Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              J.A.R.V.I.S. continuously analyzes incoming log velocities and buffer consumption rates to predict cascading failures before they reach production users.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              activeCount > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {activeCount > 0 ? `${activeCount} Impending Failures Detected` : 'All Predictions Mitigated'}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Comparison Card (God-Tier Interactive What-If) */}
      <div className="calm-card p-5 bg-gradient-to-r from-surface-card to-surface-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div>
            <span className="text-xs font-semibold text-slate-200">
              Interactive Incident Trajectory Comparison
            </span>
            <p className="text-xs text-slate-400">
              Compare the business impact of allowing failures to cascade vs proactive mitigation.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-surface-bg p-1 rounded-lg border border-surface-border text-xs">
            <button
              onClick={() => setViewMode('UNCHECKED')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'UNCHECKED'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unchecked Cascade
            </button>
            <button
              onClick={() => setViewMode('MITIGATED')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'MITIGATED'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Proactive Mitigation
            </button>
          </div>
        </div>

        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-surface-bg/80 border border-surface-border">
            <span className="text-[10px] text-slate-500 block uppercase">Projected Downtime</span>
            <span className={`text-base font-bold ${viewMode === 'UNCHECKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {viewMode === 'UNCHECKED' ? '45 minutes' : '0 seconds'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {viewMode === 'UNCHECKED' ? 'Cascading cascade saturation' : '100% SLA preserved'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-bg/80 border border-surface-border">
            <span className="text-[10px] text-slate-500 block uppercase">Customers Impacted</span>
            <span className={`text-base font-bold ${viewMode === 'UNCHECKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {viewMode === 'UNCHECKED' ? '4,200 users' : '0 users'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {viewMode === 'UNCHECKED' ? 'Stalled logins & checkouts' : 'Zero dropouts'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-bg/80 border border-surface-border">
            <span className="text-[10px] text-slate-500 block uppercase">Revenue at Risk</span>
            <span className={`text-base font-bold ${viewMode === 'UNCHECKED' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {viewMode === 'UNCHECKED' ? '$18,500 USD' : '$0 USD'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {viewMode === 'UNCHECKED' ? 'Failed customer checkouts' : 'Averted completely'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-bg/80 border border-surface-border">
            <span className="text-[10px] text-slate-500 block uppercase">Resolution Window</span>
            <span className={`text-base font-bold ${viewMode === 'UNCHECKED' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {viewMode === 'UNCHECKED' ? '01:45 countdown' : 'Mitigated'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {viewMode === 'UNCHECKED' ? 'Time before first breach' : 'Pre-emptive fix in place'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Impending Errors Predicted from Log Stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white">
              Impending Errors Ranked by Urgency
            </h3>
            <span className="text-xs text-slate-400">
              (Live time until occurrence)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Detected from rolling log signatures
          </span>
        </div>

        <div className="space-y-3.5">
          {upcomingErrors.map((err) => {
            const isMitigated = mitigatedIds.has(err.id);
            const remainingSec = timers[err.id] || 0;

            return (
              <div
                key={err.id}
                className={`p-4 rounded-xl border transition-all ${
                  isMitigated
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'calm-card hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
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
                    <span className="flex items-center space-x-1.5 text-slate-300 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {isMitigated ? (
                          <span className="text-emerald-400 font-sans font-medium">Prevented</span>
                        ) : (
                          <>Breach in <strong className="text-amber-400">{formatSeconds(remainingSec)}</strong></>
                        )}
                      </span>
                    </span>

                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-bg text-slate-300 border border-surface-border">
                      {err.probability}% Probability
                    </span>
                  </div>
                </div>

                {/* Error Details */}
                <div className="py-3 space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                      Predicted Impending Exception:
                    </span>
                    <div className="p-2.5 rounded-lg bg-surface-bg border border-surface-border font-mono text-xs text-rose-300/90 break-all">
                      {err.predictedError}
                    </div>
                  </div>

                  {/* Triggering Log Signature */}
                  <div className="p-2.5 rounded-lg bg-surface-bg/60 border border-surface-border/60 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-[11px] text-brand-400 font-medium">
                      <FileText className="w-3 h-3" />
                      <span>Triggering Log Signature from Telemetry Stream:</span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-300 truncate">
                      {err.logSignature}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Mathematical Trend: {err.trendRate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">User & Business Impact:</span>
                      <span className="text-slate-300">{err.impact}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Proactive Mitigation Action:</span>
                      <span className="text-slate-300">{err.recommendedFix}</span>
                    </div>
                  </div>
                </div>

                {/* Actionable Prevention Button */}
                <div className="pt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-surface-border">
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500">Status: </span>
                    <span className={isMitigated ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                      {isMitigated ? 'Mitigation active. Telemetry stabilizing.' : 'Action required before countdown expires.'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMitigate(err)}
                    disabled={isMitigated}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      isMitigated
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25'
                    }`}
                  >
                    {isMitigated ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mitigation Applied (SLA Protected)</span>
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
        <h3 className="text-sm font-semibold text-white mb-1">
          Anticipated Cascade Progression Timeline
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Natural downstream propagation across microservices if left unaddressed.
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
