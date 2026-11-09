import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Wrench, Check, Copy, AlertTriangle, ShieldCheck, Clock, Zap, Play, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function RemediationPlaybook({ playbook }) {
  const { healAllServices } = useJarvis();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [executingIndex, setExecutingIndex] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState({});

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

  const executeStep = (step, idx) => {
    soundEffects.playClick();
    setExecutingIndex(idx);
    setTerminalLogs(prev => ({
      ...prev,
      [idx]: `[DISPATCHING] $ ${step.command}...`
    }));

    setTimeout(() => {
      soundEffects.playSuccess();
      setExecutingIndex(null);
      setCompletedSteps(prev => {
        const next = new Set(prev);
        next.add(idx);
        // If all completed, heal whole platform
        if (next.size === currentPlaybook.steps.length) {
          healAllServices();
        }
        return next;
      });
      setTerminalLogs(prev => ({
        ...prev,
        [idx]: `[SUCCESS] Output: 200 OK. Operation confirmed across cluster nodes.`
      }));
    }, 700);
  };

  const executeAllSteps = () => {
    soundEffects.playClick();
    currentPlaybook.steps.forEach((s, idx) => {
      setTimeout(() => {
        executeStep(s, idx);
      }, idx * 600);
    });
  };

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4 select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-cyber-border/70 gap-2">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Wrench className="w-4 h-4 text-cyber-green" />
          <span>ACTIONABLE REMEDIATION PLAYBOOK (F6 INTERACTIVE EXECUTION)</span>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={executeAllSteps}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold text-xs hover:bg-cyber-green/30 transition-all shadow-neon-green cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>EXECUTE ALL 4 STEPS LIVE</span>
          </button>
        </div>
      </div>

      <div className="space-y-3 font-mono">
        {currentPlaybook.steps.map((step, idx) => {
          const isDone = completedSteps.has(idx);
          const isRunning = executingIndex === idx;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition-all flex flex-col space-y-2 ${
                isDone
                  ? 'border-cyber-green/60 bg-cyber-green/10 shadow-neon-green'
                  : 'border-cyber-border/80 bg-cyber-card/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isDone ? 'bg-cyber-green text-cyber-bg' : 'bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan'
                  }`}>
                    {isDone ? '✓' : step.order}
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

              {/* Command box with 2 interactive buttons: Run Live and Copy */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded bg-cyber-bg border border-cyber-border/80 text-[11px] text-cyber-cyan font-mono gap-2">
                <span className="truncate pr-2">$ {step.command}</span>

                <div className="flex items-center space-x-1.5 flex-shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(step.command, idx)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-white text-[10px] cursor-pointer"
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

                  <button
                    onClick={() => executeStep(step, idx)}
                    disabled={isRunning || isDone}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded border text-[10px] font-bold transition-all cursor-pointer ${
                      isDone
                        ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                        : (isRunning ? 'bg-cyber-amber/20 border-cyber-amber text-cyber-amber animate-pulse' : 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/30 shadow-neon-cyan')
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isDone ? 'COMPLETED' : (isRunning ? 'EXECUTING...' : 'RUN LIVE')}</span>
                  </button>
                </div>
              </div>

              {/* Live execution feedback */}
              {terminalLogs[idx] && (
                <div className="text-[10px] text-cyber-green font-mono pt-1">
                  {terminalLogs[idx]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
