import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Wrench, Check, Copy, Clock, Play, CheckCircle2 } from 'lucide-react';

export default function RemediationPlaybook({ playbook }) {
  const { healAllServices } = useJarvis();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [executingIndex, setExecutingIndex] = useState(null);

  const defaultPlaybook = {
    title: 'Core PostgreSQL DB Pool Exhaustion Remediation',
    estimatedTimeToResolve: '2.5 minutes',
    steps: [
      {
        order: 1,
        action: 'Dynamic Pool Scale-Up',
        command: 'kubectl scale deploy pgbouncer --replicas=6 && psql -c "ALTER SYSTEM SET max_connections = 500;"',
        risk: 'Low',
        estimatedDuration: '30s',
        description: 'Expands connection ceiling from 100 to 500 to immediately drain queued connection waits.'
      },
      {
        order: 2,
        action: 'Terminate Idle Client Sessions',
        command: 'psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle in transaction\' AND state_change < now() - interval \'1 minute\';"',
        risk: 'Medium',
        estimatedDuration: '15s',
        description: 'Frees 42 leaked database connection handles held by hung microservice clients.'
      },
      {
        order: 3,
        action: 'Soft Restart Auth Service Pods',
        command: 'kubectl rollout restart deployment auth-service -n core',
        risk: 'Low',
        estimatedDuration: '45s',
        description: 'Flushes saturated HikariCP pools and forces fresh socket handshakes.'
      },
      {
        order: 4,
        action: 'Replay Queued Failed Payments',
        command: 'curl -X POST https://api.internal/v1/payments/retry-queue -H "Authorization: Bearer $OPS_TOKEN"',
        risk: 'Low',
        estimatedDuration: '60s',
        description: 'Automatically re-dispatches 142 failed payment transactions held in dead-letter queues.'
      }
    ]
  };

  const currentPlaybook = playbook || defaultPlaybook;

  const handleCopy = (cmd, idx) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const executeStep = (idx) => {
    setExecutingIndex(idx);
    setTimeout(() => {
      setExecutingIndex(null);
      setCompletedSteps(prev => {
        const next = new Set(prev);
        next.add(idx);
        if (next.size === currentPlaybook.steps.length) {
          healAllServices();
        }
        return next;
      });
    }, 600);
  };

  const executeAll = () => {
    currentPlaybook.steps.forEach((_, idx) => {
      setTimeout(() => {
        executeStep(idx);
      }, idx * 500);
    });
  };

  return (
    <div className="calm-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Actionable Remediation Playbook
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step fix to restore normal transaction processing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={executeAll}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
          >
            Execute All 4 Steps
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {currentPlaybook.steps.map((step, idx) => {
          const isDone = completedSteps.has(idx);
          const isRunning = executingIndex === idx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-surface-card border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between text-xs pb-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-medium text-[11px] ${
                    isDone ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {isDone ? '✓' : step.order}
                  </span>
                  <span className="font-semibold text-white">{step.action}</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span>Risk: {step.risk}</span>
                  <span>•</span>
                  <span>~{step.estimatedDuration}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                {step.description}
              </p>

              {/* Command Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg bg-surface-bg border border-surface-border text-xs font-mono text-slate-300 gap-2">
                <span className="truncate pr-2">$ {step.command}</span>

                <div className="flex items-center space-x-1.5 flex-shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(step.command, idx)}
                    className="px-2 py-1 rounded bg-surface-card border border-surface-border hover:border-slate-500 text-slate-300 text-[11px] cursor-pointer"
                  >
                    {copiedIndex === idx ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    onClick={() => executeStep(idx)}
                    disabled={isDone || isRunning}
                    className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-brand-500/15 border-brand-500/30 text-brand-400 hover:bg-brand-500/25'
                    }`}
                  >
                    {isDone ? 'Completed' : (isRunning ? 'Running...' : 'Run Step')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
