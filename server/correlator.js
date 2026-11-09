import { store } from './store.js';

/**
 * Multi-signal correlation engine
 * Formula: score = 0.35*time + 0.30*dependency + 0.20*pattern + 0.15*shared_ids
 */

function calculateTimeProximity(t1, t2, windowSeconds = 180) {
  const diffSec = Math.abs(new Date(t1) - new Date(t2)) / 1000;
  if (diffSec > windowSeconds) return 0;
  return Math.max(0, 1 - (diffSec / windowSeconds));
}

function calculateDependencyProximity(s1, s2) {
  if (s1 === s2) return 1.0;
  const s1Ancestors = store.getAncestors(s1);
  const s1Descendants = store.getDescendants(s1);

  if (s1Ancestors.includes(s2) || s1Descendants.includes(s2)) {
    return 0.85;
  }
  // Check 2-hop
  for (const a of s1Ancestors) {
    if (store.getAncestors(a).includes(s2)) return 0.60;
  }
  for (const d of s1Descendants) {
    if (store.getDescendants(d).includes(s2)) return 0.60;
  }
  return 0.05;
}

function calculatePatternSimilarity(msg1, msg2) {
  if (!msg1 || !msg2) return 0;
  const m1 = msg1.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  const m2 = msg2.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');

  if (m1 === m2) return 1.0;

  // Keyword clustering
  const keywords = ['timeout', 'connection', 'pool', 'exhausted', 'refused', '504', '500', 'latency', 'deadlock', 'retry'];
  let matched = 0;
  for (const kw of keywords) {
    if (m1.includes(kw) && m2.includes(kw)) matched++;
  }
  if (matched >= 2) return 0.85;
  if (matched === 1) return 0.50;

  // Jaccard word token similarity
  const tokens1 = new Set(m1.split(/\s+/).filter(w => w.length > 2));
  const tokens2 = new Set(m2.split(/\s+/).filter(w => w.length > 2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0.1;

  let intersection = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersection++;
  });
  const union = new Set([...tokens1, ...tokens2]).size;
  return union > 0 ? (intersection / union) : 0;
}

function calculateSharedIds(ev1, ev2) {
  let score = 0;
  if (ev1.trace_id && ev2.trace_id && ev1.trace_id === ev2.trace_id) {
    score += 0.7;
  }
  if (ev1.user_id && ev2.user_id && ev1.user_id === ev2.user_id && ev1.user_id !== 'sys-daemon') {
    score += 0.3;
  }
  return score;
}

export function correlateEvents(events = store.eventStore) {
  if (!events || events.length === 0) {
    return {
      rawAlertCount: 0,
      relevantEventCount: 0,
      noiseCount: 0,
      incidents: [],
      noiseEvents: []
    };
  }

  // Filter only WARN, ERROR, CRITICAL for clustering (keep INFO for telemetry replay)
  const alertEvents = events.filter(e => ['WARN', 'ERROR', 'CRITICAL'].includes(e.severity));
  const rawAlertCount = alertEvents.length;

  if (alertEvents.length === 0) {
    return {
      rawAlertCount: 0,
      relevantEventCount: 0,
      noiseCount: 0,
      incidents: [],
      noiseEvents: []
    };
  }

  // Calculate signal score for each event against all other events
  const signalScores = new Map();
  const pairs = [];

  for (let i = 0; i < alertEvents.length; i++) {
    const e1 = alertEvents[i];
    let maxPairScore = 0;

    for (let j = i + 1; j < alertEvents.length; j++) {
      const e2 = alertEvents[j];

      const timeScore = calculateTimeProximity(e1.timestamp, e2.timestamp);
      const depScore = calculateDependencyProximity(e1.service, e2.service);
      const patternScore = calculatePatternSimilarity(e1.message, e2.message);
      const sharedScore = calculateSharedIds(e1, e2);

      const totalScore = (0.35 * timeScore) + (0.30 * depScore) + (0.20 * patternScore) + (0.15 * sharedScore);

      if (totalScore > maxPairScore) maxPairScore = totalScore;

      if (totalScore >= 0.55) {
        pairs.push({ e1, e2, score: totalScore });
      }
    }

    signalScores.set(e1.id, Math.max(maxPairScore, e1.severity === 'CRITICAL' ? 0.75 : 0.2));
  }

  // Separate noise (signal score < 0.45 and no connected cluster)
  const relevantEvents = [];
  const noiseEvents = [];

  alertEvents.forEach(e => {
    const score = +(signalScores.get(e.id) || 0.3).toFixed(2);
    const enriched = { ...e, signalScore: score };
    if (score >= 0.45) {
      relevantEvents.push(enriched);
    } else {
      enriched.rejectionReason = e.service === 'notification-service' && e.message.includes('GC') 
        ? 'Isolated background garbage collection latency; zero cascade impact'
        : 'Spurious warning without downstream propagation or causal correlation';
      noiseEvents.push(enriched);
    }
  });

  // Group relevant events into connected components (Incidents)
  // Union-Find / Disjoint Set
  const parent = new Map();
  function find(id) {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)));
    }
    return parent.get(id);
  }
  function union(id1, id2) {
    const r1 = find(id1);
    const r2 = find(id2);
    if (r1 !== r2) parent.set(r1, r2);
  }

  // Connect pairs with score >= 0.55
  pairs.forEach(p => {
    if (p.score >= 0.55) {
      union(p.e1.id, p.e2.id);
    }
  });

  const clusters = new Map();
  relevantEvents.forEach(e => {
    const rootId = find(e.id);
    if (!clusters.has(rootId)) clusters.set(rootId, []);
    clusters.get(rootId).push(e);
  });

  // Convert clusters into Incident objects
  const incidents = [];
  let incIdx = 1;

  for (const [, clusterEvents] of clusters.entries()) {
    if (clusterEvents.length === 0) continue;

    // Sort by timestamp ascending
    clusterEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const startTime = clusterEvents[0].timestamp;
    const lastTime = clusterEvents[clusterEvents.length - 1].timestamp;
    const servicesInvolved = Array.from(new Set(clusterEvents.map(e => e.service)));
    const criticalCount = clusterEvents.filter(e => e.severity === 'CRITICAL').length;
    const errorCount = clusterEvents.filter(e => e.severity === 'ERROR').length;

    let overallSeverity = 'WARN';
    if (criticalCount > 0) overallSeverity = 'CRITICAL';
    else if (errorCount > 0) overallSeverity = 'ERROR';

    incidents.push({
      id: `INC-2026-${String(incIdx++).padStart(3, '0')}`,
      title: servicesInvolved.includes('core-db')
        ? 'Core DB Connection Exhaustion & Downstream Payment Cascade'
        : `${servicesInvolved[0]?.toUpperCase() || 'Service'} Degradation Cascade`,
      severity: overallSeverity,
      status: 'INVESTIGATING',
      startTime,
      lastTime,
      eventCount: clusterEvents.length,
      rawNoiseFiltered: Math.max(1, rawAlertCount - clusterEvents.length),
      servicesInvolved,
      events: clusterEvents
    });
  }

  return {
    rawAlertCount,
    relevantEventCount: relevantEvents.length,
    noiseCount: noiseEvents.length,
    reductionPercentage: rawAlertCount > 0 ? +(((rawAlertCount - incidents.length) / rawAlertCount) * 100).toFixed(1) : 0,
    incidents,
    noiseEvents
  };
}
