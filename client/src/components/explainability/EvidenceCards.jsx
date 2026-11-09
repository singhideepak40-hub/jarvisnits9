import React from 'react';
import { FileText, HelpCircle, CheckCircle } from 'lucide-react';

export default function EvidenceCards({ explainability }) {
  const data = explainability || {
    rootService: 'core-db',
    confidence: 91,
    evidenceCards: [
      {
        title: 'Initial Outage Trigger',
        service: 'core-db',
        timestamp: '10:41:00 AM',
        traceId: 'trace-bank-8819',
        log: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42',
        metric: 'Active Connections: 98/100 (98%)',
        impact: 'Connection queue saturation'
      },
      {
        title: 'First Downstream Victim',
        service: 'auth-service',
        timestamp: '10:41:30 AM',
        traceId: 'trace-bank-8819',
        log: 'PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms',
        metric: 'Queue Delay: 5,120ms',
        impact: 'User session verification blocked'
      },
      {
        title: 'Cascade Boundary Breach',
        service: 'payment-service',
        timestamp: '10:42:15 AM',
        traceId: 'trace-bank-8819',
        log: 'PaymentProcessingException: Core DB write lock acquisition timed out',
        metric: 'Error Rate: 78.4%',
        impact: 'Checkout transaction failures'
      }
    ],
    whatWouldChangeMyMind: [
      'If Core DB query execution latency was under 15ms during the initial anomaly, confidence drops to 14%.',
      'If API Gateway registered network packet loss prior to database connection saturation, causality shifts to Network Fabric.',
      'If independent health checks confirmed available idle worker connections > 50%.'
    ]
  };

  return (
    <div className="space-y-4">
      {/* Evidence Cards */}
      <div className="calm-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">
          Forensic Telemetry Evidence
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Concrete logs, timestamps, and metric deviations that justify why Core PostgreSQL DB is the single point of failure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.evidenceCards.map((card, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-surface-bg border border-surface-border flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-brand-400">{card.title}</span>
                  <span className="text-[10px] text-slate-400">{card.timestamp}</span>
                </div>

                <div className="text-xs font-semibold text-white mb-1">
                  {card.service}
                </div>

                <p className="text-xs font-mono text-slate-300 leading-relaxed bg-surface-card p-2 rounded border border-surface-border">
                  {card.log}
                </p>
              </div>

              <div className="pt-2 border-t border-surface-border/60 text-[11px] flex items-center justify-between text-slate-400">
                <span>{card.impact}</span>
                <span className="text-slate-200 font-medium">{card.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Falsifiability ("What would change my mind?") */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 mb-1">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>Scientific Falsifiability: "What Would Change My Mind?"</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Transparent reasoning disclosure: what telemetry conditions would invalidate this conclusion.
        </p>

        <ul className="space-y-1.5 text-xs text-slate-300">
          {data.whatWouldChangeMyMind.map((rule, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-brand-400 font-bold">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
