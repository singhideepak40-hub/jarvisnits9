import React, { useState } from 'react';
import { Split, AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, Clock } from 'lucide-react';

export default function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl hud-panel p-5 border border-cyber-border">
        <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
            <Split className="w-4 h-4 text-cyber-cyan" />
            <span>BEFORE / AFTER COMPARISON SLIDER (W4 SPLIT SCREEN)</span>
          </div>
          <span className="text-xs font-mono text-cyber-muted">
            Drag the slider horizontally to compare
          </span>
        </div>

        {/* Impact Metric Chips (W5) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono">
          <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border text-center">
            <span className="text-[10px] text-cyber-muted block uppercase">Mean Time to Root Cause</span>
            <div className="text-sm font-bold mt-0.5">
              <span className="text-cyber-green">8 seconds</span>{' '}
              <span className="text-cyber-muted line-through text-[10px]">~45m manual</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border text-center">
            <span className="text-[10px] text-cyber-muted block uppercase">Alert Noise Reduction</span>
            <span className="text-sm font-bold text-cyber-cyan mt-0.5 block">92.6% Consolidated</span>
          </div>

          <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border text-center">
            <span className="text-[10px] text-cyber-muted block uppercase">Engineer Hours Saved</span>
            <span className="text-sm font-bold text-cyber-green mt-0.5 block">+3.8 hrs / incident</span>
          </div>

          <div className="p-3 rounded-lg bg-cyber-card/70 border border-cyber-border text-center">
            <span className="text-[10px] text-cyber-muted block uppercase">Preventive Foresight</span>
            <span className="text-sm font-bold text-cyber-amber mt-0.5 block">04:12m Early Warning</span>
          </div>
        </div>

        {/* Interactive Split-Screen Container */}
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-cyber-border select-none">
          {/* Left Side: Traditional Monitoring (Chaotic 247 Alerts) */}
          <div className="absolute inset-0 bg-cyber-bg p-5 overflow-y-auto">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-cyber-red/40 text-cyber-red font-mono text-xs font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>TRADITIONAL MONITORING (247 RAW ALERTS / ZERO CONTEXT)</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {[
                { time: '10:43:12', svc: 'web-portal', msg: 'HTTP 504 Gateway Timeout on /checkout', sev: 'CRITICAL' },
                { time: '10:43:10', svc: 'notification-service', msg: 'DeadLetterQueueOverflow: 1200 failed emails', sev: 'WARN' },
                { time: '10:43:08', svc: 'payment-service', msg: 'PaymentProcessingException: Write lock timed out', sev: 'CRITICAL' },
                { time: '10:43:02', svc: 'api-gateway', msg: 'Proxy upstream request timeout >10000ms', sev: 'ERROR' },
                { time: '10:42:58', svc: 'auth-service', msg: 'PoolWaitTimeout: Unable to acquire session in 5000ms', sev: 'CRITICAL' },
                { time: '10:42:54', svc: 'notification-service', msg: 'GC pause 420ms background memory alert', sev: 'WARN' },
                { time: '10:42:48', svc: 'core-db', msg: 'Active connection limit reached (98/100)', sev: 'ERROR' },
                { time: '10:42:40', svc: 'web-portal', msg: 'Uncaught PromiseRejection: Network Error', sev: 'ERROR' },
                { time: '10:42:35', svc: 'api-gateway', msg: 'Rate limit tripped for IP 192.168.1.42', sev: 'WARN' },
                { time: '10:42:30', svc: 'auth-service', msg: 'Session token decrypt took 4820ms', sev: 'WARN' },
                { time: '10:42:25', svc: 'payment-service', msg: 'Transaction rollback user usr_8819', sev: 'ERROR' }
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-cyber-card/60 border border-cyber-border/70 flex items-center justify-between text-cyber-muted">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-cyber-muted">{item.time}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyber-red/20 text-cyber-red font-bold">{item.sev}</span>
                    <span className="text-white font-bold">{item.svc}:</span>
                    <span className="truncate max-w-[280px]">{item.msg}</span>
                  </div>
                  <span className="text-[10px] text-cyber-muted">No correlation</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: J.A.R.V.I.S. (Clipped by sliderPos) */}
          <div
            className="absolute inset-0 bg-cyber-panel p-5 overflow-y-auto border-l-2 border-cyber-cyan shadow-neon-cyan"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-cyber-cyan/40 text-cyber-cyan font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 text-cyber-cyan" />
              <span>J.A.R.V.I.S. REASONING ENGINE (1 INCIDENT / 1 CAUSE / 1 FIX)</span>
            </div>

            <div className="space-y-3 font-mono">
              {/* Root Cause Card */}
              <div className="p-3.5 rounded-lg bg-cyber-card border border-cyber-red/50 shadow-neon-red">
                <div className="text-[10px] text-cyber-red uppercase font-bold tracking-wider mb-1">
                  Single Justified Root Cause (91% Confidence)
                </div>
                <div className="text-base font-bold text-white uppercase">
                  Core PostgreSQL DB — Connection Pool Exhaustion
                </div>
                <p className="text-xs text-cyber-muted mt-1 font-sans">
                  HikariCP connection pool hit 98/100 slots, stalling Auth Service token checks and propagating 504 timeouts to API Gateway and Payment Service.
                </p>
              </div>

              {/* Fix Playbook Step */}
              <div className="p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/40">
                <div className="text-[10px] text-cyber-green uppercase font-bold tracking-wider mb-0.5">
                  1-Click Actionable Remediation
                </div>
                <div className="text-xs text-white font-bold">
                  Scale PgBouncer pool to 500 & terminate 42 idle transaction sessions.
                </div>
                <div className="text-[10px] text-cyber-muted mt-1">
                  Estimated recovery: <strong>2.5 minutes</strong> (prevents 3,890 user failures).
                </div>
              </div>

              {/* Predictive Warning */}
              <div className="p-3 rounded-lg bg-cyber-amber/10 border border-cyber-amber/40">
                <div className="text-[10px] text-cyber-amber uppercase font-bold tracking-wider mb-0.5">
                  Next Failure Forecast
                </div>
                <div className="text-xs text-white">
                  Payment Service will suffer complete transaction timeout in <strong>04:12m</strong> if unmitigated.
                </div>
              </div>
            </div>
          </div>

          {/* Draggable Slider Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyber-cyan cursor-ew-resize z-20 flex items-center justify-center shadow-neon-cyan"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-cyber-cyan text-cyber-bg flex items-center justify-center shadow-neon-cyan">
              <Split className="w-4 h-4 font-bold" />
            </div>
          </div>
        </div>

        {/* Range Input for easy touch/mouse sliding */}
        <div className="mt-4 flex items-center space-x-3">
          <span className="text-[10px] font-mono text-cyber-red uppercase font-bold">Traditional (247 Alerts)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="flex-1 accent-cyber-cyan cursor-pointer"
          />
          <span className="text-[10px] font-mono text-cyber-cyan uppercase font-bold">J.A.R.V.I.S. (1 Cause / 1 Fix)</span>
        </div>
      </div>
    </div>
  );
}
