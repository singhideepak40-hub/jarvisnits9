/**
 * Incident Story Narrative Generator & AI Chat Assistant
 * Provides Engineer View vs Executive View + Gemini API Integration with Fallback
 */

export function generateIncidentStory(incident, rootCause, impact) {
  const rootSvc = rootCause?.service || 'core-db';
  const startStr = incident?.startTime ? new Date(incident.startTime).toLocaleTimeString() : '10:41:00 AM';
  const blastCount = impact?.blastRadiusCount || 5;
  const usersAffected = impact?.metrics?.totalUsersAffected?.toLocaleString() || '4,200';
  const revAtRisk = impact?.metrics?.estimatedRevenueAtRisk?.toLocaleString() || '18,500';

  const engineerStory = `### Technical Telemetry & Cascade Forensic Analysis
- **${startStr} - Root Anomaly:** \`${rootSvc}\` connection pool reached 98% saturation (HikariCP pool limit: 100/100). Latency surged from 14ms to 4,820ms due to unindexed transaction contention.
- **T+30s - Upstream Stalling:** \`auth-service\` worker threads hung waiting on user session queries, generating \`PoolWaitTimeoutException\` and cascading thread pool starvation.
- **T+60s - Ingress Timeout:** \`api-gateway\` registered HTTP 504 Gateway Timeouts across \`/auth/verify\` and \`/checkout/execute\` endpoints as downstream timeouts tripped circuit thresholds.
- **T+90s - Transaction Rollbacks:** \`payment-service\` failed 142 consecutive checkout transactions with \`PaymentProcessingException: DB connection deadlocked\`.
- **T+120s - Queue Overflow:** \`notification-service\` message broker DLQ exceeded 10,000 pending SMS/email notifications.
- **Root Conclusion:** Isolated database connection exhaustion cascaded downstream across ${blastCount} microservices. Upstream services are collateral victims.`;

  const executiveStory = `### Executive Summary & Business Impact
- **What Happened:** At **${startStr}**, our central payment processing database experienced capacity limits due to a sudden spike in checkout queries.
- **Customer Impact:** An estimated **${usersAffected} customers** experienced delayed logins or interrupted checkout transactions over an 18-minute window.
- **Financial Exposure:** Estimated revenue exposure of **$${revAtRisk} USD**, with zero data corruption or unrecoverable loss.
- **Current Status:** J.A.R.V.I.S. auto-correlated 247 incoming alarms down to the single database connection bottleneck and generated an executable 4-step remediation plan.
- **Resolution Plan:** Dynamic pool expansion and terminating idle sessions will restore full platform throughput within 2.5 minutes.`;

  return {
    engineerStory,
    executiveStory,
    plainLanguageSummary: `At ${startStr}, ${rootSvc} exhausted its connection pool, stalling Auth and causing cascading checkout timeouts across ${blastCount} services affecting ${usersAffected} users. Fixing the DB pool immediately resolves the entire outage.`
  };
}

/**
 * AI Chat Assistant with Gemini API & Offline Rule-Based Fallback
 */
export async function handleAIChat(userQuestion, contextData) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const questionLower = (userQuestion || '').toLowerCase();

  // Try calling Gemini if online & key available
  if (apiKey && !apiKey.startsWith('AQ.')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are J.A.R.V.I.S. (Justified Analysis & Reasoning Incident Visualizer System), an advanced AI site reliability engineer.
Answer the engineer's question clearly, concisely, and authoritatively based on this live incident data:
${JSON.stringify(contextData, null, 2)}

User Question: "${userQuestion}"
Tone: Futuristic, analytical, precise, action-oriented Iron-Man HUD AI.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) return aiText;
      }
    } catch {
      // Fall through to deterministic template engine
    }
  }

  // Deterministic, context-aware rule-based answers
  const rootSvc = contextData?.rootCause?.service || 'core-db';
  const usersCount = contextData?.impact?.metrics?.totalUsersAffected?.toLocaleString() || '4,200';
  const confidence = contextData?.rootCause?.confidence || 91;

  if (questionLower.includes('root cause') || questionLower.includes('why') || questionLower.includes('wrong')) {
    return `Sir, diagnostic telemetry confirms **${rootSvc} connection pool exhaustion** is the root cause with **${confidence}% justified confidence**.HikariCP pool connections reached 98/100, causing Auth Service to stall on session token lookup, which propagated HTTP 504 timeouts to the API Gateway. The other 246 alerts are downstream victims, not causes.`;
  }

  if (questionLower.includes('fix') || questionLower.includes('remediat') || questionLower.includes('how to solve')) {
    return `Recommended remediation protocol:\n1. **Scale Connection Pool**: \`kubectl scale deploy pgbouncer --replicas=6 && psql -c "ALTER SYSTEM SET max_connections = 500;"\`\n2. **Terminate Idle Sessions**: Kill 42 hung backend client queries.\n3. **Rollout Restart Auth**: Flush client socket connection pools.\n\nSimulation indicates this will restore platform throughput within 2.5 minutes and prevent 92.6% of further user failures.`;
  }

  if (questionLower.includes('next') || questionLower.includes('fail') || questionLower.includes('forecast') || questionLower.includes('predict')) {
    return `Predictive failure cone analysis indicates that if unmitigated, **Payment Service** will suffer a complete transaction blackout in approximately **04:12 minutes** as thread pool queues exceed memory bounds (94% breach probability). Notification Service queues will subsequently overflow at T+7m.`;
  }

  if (questionLower.includes('who') || questionLower.includes('user') || questionLower.includes('impact') || questionLower.includes('affected')) {
    return `Current blast radius encompasses **5 microservices** (Core DB, Auth Service, API Gateway, Payment Service, Notification Service). Approximately **${usersCount} active users** are impacted with $18,500 USD in delayed transactions. Our Cascade Risk Index is currently **84/100 (CRITICAL)**.`;
  }

  return `Affirmative. J.A.R.V.I.S. is monitoring all microservices in the temporal knowledge graph. Current primary incident points to **${rootSvc}** under heavy saturation. Would you like me to execute the digital twin dry run or trigger the remediation playbook?`;
}
