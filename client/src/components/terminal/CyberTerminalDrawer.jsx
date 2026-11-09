import React, { useState, useRef, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Terminal, X, ChevronUp, ChevronDown, Play, Trash2 } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function CyberTerminalDrawer() {
  const {
    isTerminalOpen,
    setIsTerminalOpen,
    healAllServices,
    incidentDetails,
    triggerChaos,
    setActiveTab
  } = useJarvis();

  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState([
    { text: 'J.A.R.V.I.S. Command Line Interface [Version 2.0.0-PROD]', type: 'info' },
    { text: 'Type "help" or click any shortcut pill below to execute diagnostic protocols.', type: 'info' }
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [history, isTerminalOpen]);

  if (!isTerminalOpen) return null;

  const runCommand = (cmd) => {
    soundEffects.playClick();
    const cleanCmd = (cmd || commandInput).trim();
    if (!cleanCmd) return;

    setCommandInput('');
    const newHistory = [...history, { text: `$ ${cleanCmd}`, type: 'input' }];

    const lower = cleanCmd.toLowerCase();

    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    if (lower.includes('status')) {
      newHistory.push({
        text: `[SYSTEM STATUS: ONLINE] Topology nodes: 8 | Active Outage: INC-2026-001 (CRITICAL)\nRoot bottleneck: core-db (91% confidence) | Blast: 5 services cascaded.`,
        type: 'output'
      });
    } else if (lower.includes('diagnose') || lower.includes('rootcause')) {
      newHistory.push({
        text: `[ANALYSIS RESULTS]\n- Root Cause: core-db (PostgreSQL connection pool exhausted)\n- Active Connections: 98/100 (98%)\n- Earliest Anomaly: 10:41:00 AM\n- Downstream Victims: auth-service, api-gateway, payment-service, notification-service\n- Confidence Score: 91% (Justified Multi-Signal)`,
        type: 'output'
      });
      setActiveTab('investigation');
    } else if (lower.includes('fix') || lower.includes('heal') || lower.includes('remediate')) {
      newHistory.push({
        text: `[REMEDIATION DISPATCHED]\n1. Scaling PgBouncer deployment to 6 replicas... [DONE]\n2. Terminating 42 idle backend sessions... [DONE]\n3. Soft-restarting auth-service pods... [DONE]\n4. Replaying failed payments queue... [DONE]\n\n>>> ALL 8 SERVICES HEALTH RESTORED TO 100%! <<<`,
        type: 'success'
      });
      healAllServices();
    } else if (lower.includes('predict') || lower.includes('forecast')) {
      newHistory.push({
        text: `[FAILURE CONE PROJECTION]\n- Payment Service: 94% breach certainty in 04:12m\n- Notification Service: 78% DLQ overflow in 07:45m\n- Suggested Action: Execute pre-emptive circuit breaker.`,
        type: 'warning'
      });
      setActiveTab('predictions');
    } else if (lower.includes('chaos') || lower.includes('kill')) {
      newHistory.push({
        text: `[CHAOS INJECTED] Triggered simulated Core DB connection exhaustion!`,
        type: 'error'
      });
      triggerChaos('kill_db');
    } else if (lower === 'help') {
      newHistory.push({
        text: `Available Commands:\n- jarvis status        : Display service mesh health\n- jarvis diagnose      : Run root cause engine & evidence audit\n- jarvis fix --all     : Execute automated 4-step remediation protocol\n- jarvis predict       : Inspect predictive failure cone forecasts\n- jarvis chaos kill-db : Inject synthetic DB connection pool exhaustion\n- clear                : Clear terminal output`,
        type: 'info'
      });
    } else {
      newHistory.push({
        text: `Command not recognized: "${cleanCmd}". Type "help" or click one of the preset pills below.`,
        type: 'error'
      });
    }

    setHistory(newHistory);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-cyber-panel/95 border-t border-cyber-cyan/50 backdrop-blur-2xl shadow-neon-cyan font-mono select-none">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-border bg-cyber-card/70">
        <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-bold">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
          <span>J.A.R.V.I.S. INTERACTIVE CLI TERMINAL (OPERATOR SHELL)</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setHistory([])}
            title="Clear output"
            className="text-cyber-muted hover:text-white cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsTerminalOpen(false);
            }}
            className="text-cyber-muted hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Console Box */}
      <div ref={endRef} className="h-44 p-4 overflow-y-auto space-y-1 text-xs">
        {history.map((h, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap leading-relaxed ${
              h.type === 'input' ? 'text-white font-bold' : (
                h.type === 'success' ? 'text-cyber-green font-bold' : (
                  h.type === 'error' ? 'text-cyber-red font-bold' : (
                    h.type === 'warning' ? 'text-cyber-amber font-bold' : 'text-cyber-cyan'
                  )
                )
              )
            }`}
          >
            {h.text}
          </div>
        ))}
      </div>

      {/* Quick Clickable Command Pills */}
      <div className="px-4 py-1.5 bg-cyber-bg/80 border-t border-cyber-border/70 flex items-center space-x-2 overflow-x-auto text-[10px]">
        <span className="text-cyber-muted uppercase flex-shrink-0">Quick Run:</span>
        {[
          { label: 'jarvis diagnose', cmd: 'jarvis diagnose' },
          { label: 'jarvis fix --all', cmd: 'jarvis fix --all' },
          { label: 'jarvis predict', cmd: 'jarvis predict' },
          { label: 'jarvis status', cmd: 'jarvis status' },
          { label: 'jarvis chaos kill-db', cmd: 'jarvis chaos kill-db' },
          { label: 'clear', cmd: 'clear' }
        ].map((pill, idx) => (
          <button
            key={idx}
            onClick={() => runCommand(pill.cmd)}
            className="px-2 py-0.5 rounded bg-cyber-card border border-cyber-cyan/30 hover:border-cyber-cyan text-cyber-cyan whitespace-nowrap cursor-pointer transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand();
        }}
        className="p-2.5 bg-cyber-card/90 border-t border-cyber-border flex items-center space-x-2"
      >
        <span className="text-cyber-green font-bold text-xs pl-2">&gt;</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Type 'jarvis fix --all', 'jarvis diagnose', or click shortcuts above..."
          className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan text-xs font-bold hover:bg-cyber-cyan/30 transition-all cursor-pointer"
        >
          ENTER
        </button>
      </form>
    </div>
  );
}
