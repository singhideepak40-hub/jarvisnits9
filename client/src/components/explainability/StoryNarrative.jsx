import React, { useState } from 'react';
import { BookOpen, UserCheck, Wrench, Copy, Check } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function StoryNarrative({ storyData }) {
  const [viewMode, setViewMode] = useState('engineer'); // 'engineer' | 'executive'
  const [copied, setCopied] = useState(false);

  const defaultEngineer = `### Technical Telemetry & Cascade Forensic Analysis
- **10:41:00 AM - Root Anomaly:** \`core-db\` connection pool reached 98% saturation (HikariCP pool limit: 100/100). Latency surged from 14ms to 4,820ms due to unindexed transaction contention.
- **T+30s - Upstream Stalling:** \`auth-service\` worker threads hung waiting on user session queries, generating \`PoolWaitTimeoutException\` and cascading thread pool starvation.
- **T+60s - Ingress Timeout:** \`api-gateway\` registered HTTP 504 Gateway Timeouts across \`/auth/verify\` and \`/checkout/execute\` endpoints as downstream timeouts tripped circuit thresholds.
- **T+90s - Transaction Rollbacks:** \`payment-service\` failed 142 consecutive checkout transactions with \`PaymentProcessingException: DB connection deadlocked\`.
- **T+120s - Queue Overflow:** \`notification-service\` message broker DLQ exceeded 10,000 pending SMS/email notifications.
- **Root Conclusion:** Isolated database connection exhaustion cascaded downstream across 5 microservices. Upstream services are collateral victims.`;

  const defaultExecutive = `### Executive Summary & Business Impact
- **What Happened:** At **10:41 AM**, our central payment processing database experienced capacity limits due to a sudden spike in checkout queries.
- **Customer Impact:** An estimated **4,200 customers** experienced delayed logins or interrupted checkout transactions over an 18-minute window.
- **Financial Exposure:** Estimated revenue exposure of **$18,500 USD**, with zero data corruption or unrecoverable loss.
- **Current Status:** J.A.R.V.I.S. auto-correlated 247 incoming alarms down to the single database connection bottleneck and generated an executable 4-step remediation plan.
- **Resolution Plan:** Dynamic pool expansion and terminating idle sessions will restore full platform throughput within 2.5 minutes.`;

  const textToDisplay = viewMode === 'engineer' 
    ? (storyData?.engineerStory || defaultEngineer)
    : (storyData?.executiveStory || defaultExecutive);

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(textToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl hud-panel p-4 border border-cyber-border">
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-3">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <BookOpen className="w-4 h-4 text-cyber-cyan" />
          <span>INCIDENT STORY MODE (I7 AUTO NARRATIVE)</span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-cyber-bg p-0.5 border border-cyber-border">
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('engineer');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'engineer'
                  ? 'bg-cyber-card text-cyber-cyan shadow-neon-cyan'
                  : 'text-cyber-muted hover:text-white'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Engineer View</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('executive');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                viewMode === 'executive'
                  ? 'bg-cyber-card text-cyber-cyan shadow-neon-cyan'
                  : 'text-cyber-muted hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Executive View</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Rendered Narrative Story */}
      <div className="p-4 rounded-lg bg-cyber-bg/90 border border-cyber-border/70 text-xs font-mono text-cyber-text leading-relaxed whitespace-pre-wrap">
        {textToDisplay}
      </div>
    </div>
  );
}
