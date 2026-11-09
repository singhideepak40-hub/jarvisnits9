import { store } from './store.js';

/**
 * Linear regression slope calculation
 * slope = (N*sum(xy) - sum(x)*sum(y)) / (N*sum(x^2) - (sum(x))^2)
 */
function calculateLinearSlope(values) {
  const n = values.length;
  if (n < 5) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = (n * sumXX) - (sumX * sumX);
  if (denominator === 0) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Estimates minutes to threshold breach
 */
function minutesToThreshold(bufferValues, thresholdLimit, stepSeconds = 3) {
  if (bufferValues.length < 5) return null;
  const lastVal = bufferValues[bufferValues.length - 1];
  if (lastVal >= thresholdLimit) return 0; // Already breached

  const slope = calculateLinearSlope(bufferValues);
  if (slope <= 0.05) return null; // Not rising or flat

  const stepsRemaining = (thresholdLimit - lastVal) / slope;
  const secondsRemaining = stepsRemaining * stepSeconds;
  return Math.max(0.5, +(secondsRemaining / 60).toFixed(1));
}

export function generatePredictions() {
  const predictions = [];
  const serviceForecasts = new Map();

  // Threshold rules per metric
  const thresholds = {
    dbConnections: { limit: 95, name: 'Connection Pool Saturation (%)', unit: '%' },
    latency: { limit: 2500, name: 'P99 Latency SLA (ms)', unit: 'ms' },
    errorRate: { limit: 15, name: 'Error Rate Budget (%)', unit: '%' },
    cpu: { limit: 90, name: 'CPU Exhaustion (%)', unit: '%' },
    memory: { limit: 92, name: 'Heap Memory OOM (%)', unit: '%' }
  };

  // 1. Scan rolling ring buffers for each service
  for (const [serviceId, buffers] of store.metricBuffers.entries()) {
    const node = store.nodes.get(serviceId);
    if (!node) continue;

    for (const [metricKey, thresholdCfg] of Object.entries(thresholds)) {
      const ring = buffers[metricKey];
      if (!ring) continue;
      const history = ring.getAll().map(pt => pt.value);
      if (history.length < 6) continue;

      const etaMinutes = minutesToThreshold(history, thresholdCfg.limit);
      const currentVal = history[history.length - 1];

      if (etaMinutes !== null && etaMinutes <= 12) {
        const probability = Math.min(97, Math.max(65, Math.round(98 - (etaMinutes * 2.8))));

        // Build projected future points (dotted line)
        const slope = calculateLinearSlope(history);
        const projectedPoints = [];
        const lastTimestamp = Date.now();
        for (let step = 1; step <= 10; step++) {
          const futureVal = Math.min(100, +(currentVal + (slope * step)).toFixed(1));
          projectedPoints.push({
            timestamp: new Date(lastTimestamp + step * 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            projected: futureVal,
            threshold: thresholdCfg.limit
          });
        }

        const prediction = {
          id: `PRED-${serviceId}-${metricKey}`,
          service: serviceId,
          serviceLabel: node.label,
          metric: metricKey,
          metricName: thresholdCfg.name,
          unit: thresholdCfg.unit,
          currentValue: currentVal,
          thresholdLimit: thresholdCfg.limit,
          etaMinutes,
          etaCountdownSec: Math.round(etaMinutes * 60),
          probability,
          evidence: `Rolling 60-point ring buffer detected steep upward slope (+${slope.toFixed(2)} ${thresholdCfg.unit}/tick). Projected threshold breach at ${new Date(Date.now() + etaMinutes * 60000).toLocaleTimeString()}.`,
          history: ring.getAll().slice(-15),
          projectedTrend: projectedPoints,
          preventiveAction: `Scale ${node.label} worker nodes or pre-emptively flush connection queue before threshold breach.`
        };

        predictions.push(prediction);
        serviceForecasts.set(serviceId, prediction);

        // Mark node in graph with predictive badge
        node.predictedFailure = {
          probability,
          etaMinutes,
          metric: metricKey
        };
      }
    }
  }

  // 2. Failure Cone Propagation: Spread probability down the dependency graph
  // P(child) = P(parent) * edge_weight
  for (const [parentService, parentPred] of serviceForecasts.entries()) {
    const descendants = store.getDescendants(parentService);
    descendants.forEach(childId => {
      if (serviceForecasts.has(childId)) return; // Already has direct prediction
      const childNode = store.nodes.get(childId);
      if (!childNode) return;

      const edge = store.edges.find(e => (e.from === childId && e.to === parentService) || (e.from === parentService && e.to === childId));
      const edgeWeight = edge ? edge.weight : 0.75;
      const childProb = Math.round(parentPred.probability * edgeWeight);
      const childEta = +(parentPred.etaMinutes + 2.5).toFixed(1);

      if (childProb >= 50) {
        predictions.push({
          id: `PRED-CASCADE-${childId}`,
          service: childId,
          serviceLabel: childNode.label,
          metric: 'downstream_cascade',
          metricName: 'Cascade Latency Spike & Failures',
          unit: '%',
          currentValue: childNode.currentMetrics?.latency || 45,
          thresholdLimit: 2000,
          etaMinutes: childEta,
          etaCountdownSec: Math.round(childEta * 60),
          probability: childProb,
          evidence: `Cascade risk inherited from upstream root ${parentPred.serviceLabel} with weight ${(edgeWeight * 100).toFixed(0)}%.`,
          history: [],
          projectedTrend: [],
          preventiveAction: `Activate circuit breaker on ${childNode.label} to prevent thread starvation.`
        });

        childNode.predictedFailure = {
          probability: childProb,
          etaMinutes: childEta,
          metric: 'cascade'
        };
      }
    });
  }

  // Sort by earliest ETA
  predictions.sort((a, b) => a.etaMinutes - b.etaMinutes);

  return {
    forecasts: predictions,
    activeEarlyWarningsCount: predictions.length,
    highestRiskService: predictions[0]?.service || null,
    earliestEtaMinutes: predictions[0]?.etaMinutes || null
  };
}
