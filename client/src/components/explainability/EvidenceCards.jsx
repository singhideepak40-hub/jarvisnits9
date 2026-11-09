import React from 'react';
import { HelpCircle, CheckCircle, AlertCircle, FileText, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function EvidenceCards({ explainability }) {
  const data = explainability || {
    rootService: 'core-db',
    confidence: 91,
    confidenceBreakdown: {
      temporalOrder: 35,
      dependencyPath: 30,
      patternMatch: 20,
      sharedTrace: 15
    },
    signalsFired: [
      {
        rule: 'Temporal Precedence (Earliest Anomaly)',
        weight: '35%',
        description: 'core-db emitted its first telemetry anomaly at 10:41:00 AM, preceding all downstream errors.'
      },
      {
        rule: 'Directed Graph Dependency Propagation',
        weight: '30%',
        description: 'Graph analysis reveals 4 downstream microservices directly depend on core-db: [auth-service → api-gateway → payment-service].'
      },
      {
        rule: 'Signature & Pattern Clustering',
        weight: '20%',
        description: 'Correlated logs confirm resource exhaustion cascade (HikariPool-1 pool exhausted).'
      },
      {
        rule: 'Shared Trace & User Correlation',
        weight: '15%',
        description: 'Cross-service distributed traces confirm request timeouts originate from core-db.'
      }
    ],
    whatWouldChangeMyMind: [
      'If core-db telemetry demonstrated query execution latency < 15ms during initial anomaly, confidence drops to 14%.',
      'If upstream API Gateway logs confirmed network packet drops before DB pool exhaustion, causality shifts to Network Fabric.',
      'If independent health checks on Core DB replica nodes confirmed available idle worker slots > 60%.'
    ],
    evidenceCards: [
      {
        title: 'Primary Anomaly Trigger',
        service: 'core-db',
        timestamp: '10:41:00 AM',
        traceId: 'trace-core-8819',
        log: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42',
        metric: 'Active Connections: 98/100 (98%)',
        impact: 'Origin of cascading deadlock'
      },
      {
        title: 'First Downstream Victim',
        service: 'auth-service',
        timestamp: '10:41:30 AM',
        traceId: 'trace-core-8819',
        log: 'PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms',
        metric: 'Queue Delay: 5120ms',
        impact: 'Authentication token validation stalled'
      },
      {
        title: 'Cascade Boundary Breach',
        service: 'payment-service',
        timestamp: '10:42:15 AM',
        traceId: 'trace-core-8819',
        log: 'PaymentProcessingException: Core DB write lock acquisition timed out. Transaction rolled back.',
        metric: 'Error Rate: 78.4%',
        impact: 'Checkout transaction failures for active shoppers'
      }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Confidence Breakdown Bar */}
      <div className="rounded-xl hud-panel p-4 border border-cyber-border">
        <div className="flex items-center justify-between pb-2 border-b border-cyber-border/70 mb-3">
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <span>JUSTIFIED CONFIDENCE BREAKDOWN (I5 MULTI-SIGNAL AUDIT)</span>
          </div>
          <span className="text-xs font-mono font-bold text-cyber-green">
            Aggregate Score: 91%
          </span>
        </div>

        {/* Multi-segment breakdown bar */}
        <div className="w-full h-3 bg-cyber-bg rounded-full overflow-hidden flex border border-cyber-border mb-3">
          <div style={{ width: '35%' }} className="bg-cyber-cyan h-full" title="Temporal Order: 35%" />
          <div style={{ width: '30%' }} className="bg-cyber-blue h-full" title="Graph Dependency: 30%" />
          <div style={{ width: '20%' }} className="bg-cyber-amber h-full" title="Pattern Similarity: 20%" />
          <div style={{ width: '15%' }} className="bg-cyber-purple h-full" title="Shared Trace IDs: 15%" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyber-cyan inline-block" />
            <span className="text-cyber-muted">Temporal Order: <strong className="text-white">35%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyber-blue inline-block" />
            <span className="text-cyber-muted">Dependency Path: <strong className="text-white">30%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyber-amber inline-block" />
            <span className="text-cyber-muted">Pattern Match: <strong className="text-white">20%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyber-purple inline-block" />
            <span className="text-cyber-muted">Shared Trace: <strong className="text-white">15%</strong></span>
          </div>
        </div>
      </div>

      {/* Forensic Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.evidenceCards.map((card, idx) => (
          <div key={idx} className="p-3.5 rounded-xl hud-panel border border-cyber-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-cyber-cyan font-bold uppercase">{card.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted">
                  {card.timestamp}
                </span>
              </div>

              <div className="text-xs font-bold text-white uppercase mb-1">
                {card.service}
              </div>

              <div className="text-[11px] font-mono bg-cyber-bg/90 p-2 rounded border border-cyber-border/70 text-cyber-text leading-tight mb-2">
                {card.log}
              </div>
            </div>

            <div className="pt-2 border-t border-cyber-border/60 text-[10px] font-mono flex items-center justify-between">
              <span className="text-cyber-muted">{card.impact}</span>
              <span className="text-cyber-amber font-bold">{card.metric}</span>
            </div>
          </div>
        ))}
      </div>

      {/* I5: "What would change my mind?" Honesty Clause */}
      <div className="rounded-xl hud-panel p-4 border border-cyber-amber/40 bg-cyber-amber/5">
        <div className="flex items-center space-x-2 text-cyber-amber font-mono text-xs font-bold mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>FALSIFIABILITY MATRIX: "WHAT WOULD CHANGE MY MIND?"</span>
        </div>
        <p className="text-[11px] text-cyber-muted font-sans mb-2">
          Transparent scientific reasoning: J.A.R.V.I.S. explicitly discloses counter-factual conditions that would invalidate this diagnosis:
        </p>

        <ul className="space-y-1.5 text-xs font-mono text-cyber-text">
          {data.whatWouldChangeMyMind.map((rule, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-cyber-amber font-bold">›</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
