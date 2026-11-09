import React from 'react';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import TrendLineChart from './TrendLineChart';

export default function FailureConeView({ predictions = [] }) {
  const sampleForecasts = predictions.length > 0 ? predictions : [
    {
      id: 'PRED-core-db-dbConnections',
      service: 'core-db',
      serviceLabel: 'Core PostgreSQL DB',
      metric: 'dbConnections',
      metricName: 'Connection Pool Saturation',
      unit: '%',
      currentValue: 92,
      thresholdLimit: 95,
      etaMinutes: 2.1,
      etaCountdownSec: 126,
      probability: 96,
      evidence: 'Rolling 60-point ring buffer detected steep upward slope (+2.4%/tick). Projected breach in 02:06.',
      preventiveAction: 'Pre-scale PgBouncer replicas to 6 and flush hung idle sessions.'
    },
    {
      id: 'PRED-auth-service-latency',
      service: 'auth-service',
      serviceLabel: 'Auth Service',
      metric: 'latency',
      metricName: 'P99 Token Verification Latency',
      unit: 'ms',
      currentValue: 1840,
      thresholdLimit: 2500,
      etaMinutes: 4.2,
      etaCountdownSec: 252,
      probability: 91,
      evidence: 'Thread pool queue wait times climbing linearly as DB pool exhausts.',
      preventiveAction: 'Isolate non-critical token auth checks to distributed read-replica.'
    },
    {
      id: 'PRED-payment-service-errorRate',
      service: 'payment-service',
      serviceLabel: 'Payment Service',
      metric: 'errorRate',
      metricName: 'Checkout Transaction Failures',
      unit: '%',
      currentValue: 8.4,
      thresholdLimit: 15.0,
      etaMinutes: 7.5,
      etaCountdownSec: 450,
      probability: 84,
      evidence: 'Downstream cascade propagation from Core DB write deadlocks.',
      preventiveAction: 'Trip checkout circuit breaker to graceful retry queue.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Expanding Failure Cone Banner */}
      <div className="rounded-xl hud-panel p-5 border border-cyber-amber/50 bg-gradient-to-r from-cyber-panel via-cyber-card to-cyber-bg relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border mb-4">
          <div className="flex items-center space-x-2 text-cyber-amber font-mono text-xs font-bold">
            <TrendingUp className="w-4 h-4 animate-bounce" />
            <span>PREDICTIVE FAILURE CONE FORECAST (P1 / I3 DIFFUSION MODEL)</span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-amber/20 border border-cyber-amber text-cyber-amber font-bold animate-pulse">
            HIGH PROBABILITY FUTURE CASCADE
          </span>
        </div>

        {/* The Visual Cone Progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {sampleForecasts.slice(0, 3).map((fc, idx) => (
            <div
              key={fc.id || idx}
              className="p-4 rounded-xl border border-cyber-amber/40 bg-cyber-card/80 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
            >
              {/* Expanding certainty cone gradient */}
              <div
                className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-cyber-amber to-cyber-red opacity-80"
                style={{ width: `${6 + idx * 4}px` }}
              />

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-cyber-muted uppercase tracking-wider">Step {idx + 1} Propagation</span>
                  <span className="px-2 py-0.5 rounded bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/30 font-bold">
                    {fc.probability}% Certainty
                  </span>
                </div>

                <div className="text-base font-bold text-white uppercase mb-1">
                  {fc.serviceLabel}
                </div>

                <div className="text-xs font-mono text-cyber-cyan mb-2">
                  {fc.metricName}: <strong className="text-white">{fc.currentValue}{fc.unit}</strong> → Limit: {fc.thresholdLimit}{fc.unit}
                </div>

                <p className="text-[11px] font-mono text-cyber-muted leading-tight mb-3">
                  {fc.evidence}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="pt-3 border-t border-cyber-border/70 flex items-center justify-between font-mono">
                <div className="flex items-center space-x-1.5 text-cyber-amber text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Breach in ~{fc.etaMinutes}m</span>
                </div>

                <span className="text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-2 py-0.5 rounded font-bold">
                  PRE-EMPTIVE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Projection Trend Chart */}
      <TrendLineChart />
    </div>
  );
}
