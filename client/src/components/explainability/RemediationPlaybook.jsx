import React, { useState } from 'react';
import { Wrench, Check, Copy, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function RemediationPlaybook({ playbook }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const defaultPlaybook = {
    title: 'PostgreSQL DB Connection Pool Remediation Playbook',
    estimatedTimeToResolve: '2.5 minutes',
    steps: [
      {
        order: 1,
        action: 'Dynamic Pool Scale-Up',
        command: 'kubectl scale deploy pgbouncer --replicas=6 && psql -c "ALTER SYSTEM SET max_connections = 500;"',
        risk: 'LOW',
        estimatedDuration: '30s',
        description: 'Expands connection pool ceiling from 100 to 500 to immediately drain queued connection waits.'
      },
      {
        order: 2,
        action: 'Terminate Idle-in-Transaction Client Sessions',
        command: 'psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle in transaction\' AND state_change < now() - interval \'1 minute\';"',
        risk: 'MEDIUM',
        estimatedDuration: '15s',
        description: 'Frees 42 leaked database connection handles held by hung microservice clients.'
      },
      {
        order: 3,
        action: 'Soft Restart Auth Service Pods',
        command: 'kubectl rollout restart deployment auth-service -n core',
        risk: 'LOW',
        estimatedDuration: '45s',
        description: 'Flushes saturated HikariCP pools and forces fresh socket handshakes.'
      },
      {
        order: 4,
        action: 'Replay Queued Idempotent Payments',
        command: 'curl -X POST https://api.internal/v1/payments/retry-queue -H "Authorization: Bearer $OPS_TOKEN"',
        risk: 'LOW',
        estimatedDuration: '60s',
        description: 'Automatically re-dispatches 142 failed payment transactions held in dead-letter queues.'
      }
    ]
  };

  const currentPlaybook = playbook || defaultPlaybook;

  const handleCopy = (cmd, idx) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-cyber-border/70 gap-2">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Wrench className="w-4 h-4 text-cyber-green" />
          <span>ACTIONABLE REMEDIATION PLAYBOOK (F6 STEP-BY-STEP FIX)</span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cyber-muted" />
          <span className="text-cyber-muted">Estimated Time to Resolve:</span>
          <span className="text-cyber-green font-bold">{currentPlaybook.estimatedTimeToResolve}</span>
        </div>
      </div>

      <div className="space-y-3 font-mono">
        {currentPlaybook.steps.map((step, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg border border-cyber-border/80 bg-cyber-card/70 flex flex-col space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-cyber-green/20 border border-cyber-green/50 text-cyber-green flex items-center justify-center font-bold text-[10px]">
                  {step.order}
                </span>
                <span className="font-bold text-white uppercase">{step.action}</span>
              </div>

              <div className="flex items-center space-x-2 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded border font-bold ${
                  step.risk === 'LOW' ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green' : 'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber'
                }`}>
                  Risk: {step.risk}
                </span>
                <span className="text-cyber-muted">~{step.estimatedDuration}</span>
              </div>
            </div>

            <p className="text-xs text-cyber-muted font-sans leading-tight">
              {step.description}
            </p>

            {/* Bash Command Line Box */}
            <div className="flex items-center justify-between p-2 rounded bg-cyber-bg border border-cyber-border/80 text-[11px] text-cyber-cyan font-mono overflow-x-auto">
              <span className="truncate pr-2">$ {step.command}</span>
              <button
                onClick={() => handleCopy(step.command, idx)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-white text-[10px] flex-shrink-0 transition-colors cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-cyber-green" />
                    <span className="text-cyber-green">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
