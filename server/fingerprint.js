/**
 * Incident DNA Fingerprint & Historical Vector Similarity Engine
 */

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Historical incident fingerprint library
export const HISTORICAL_FINGERPRINTS = [
  {
    id: 'INC-HIST-014',
    title: 'DB Connection Pool Exhaustion (Black Friday Peak)',
    date: '2024-11-29',
    originService: 'core-db',
    vector: [1.0, 0.9, 0.85, 0.95, 0.9],
    barcode: [
      { color: '#FF0055', width: 14, label: 'Origin: DB Pool' },
      { color: '#FF5E00', width: 22, label: 'Spread: Auth->Gateway' },
      { color: '#00F2FE', width: 8, label: 'Velocity: 4.2m' },
      { color: '#7928CA', width: 26, label: 'Type: 504 Gateway' },
      { color: '#FF0080', width: 30, label: 'Severity: P1 Critical' }
    ],
    resolutionPlaybook: 'Scale connection pool to 500 & terminate idle backend queries',
    resolutionTime: '4m 12s'
  },
  {
    id: 'INC-HIST-009',
    title: 'Payment Gateway Circuit Breaker Trip',
    date: '2024-08-14',
    originService: 'payment-gateway',
    vector: [0.6, 0.4, 0.3, 0.8, 0.7],
    barcode: [
      { color: '#FF9F1C', width: 18, label: 'Origin: Ext Gateway' },
      { color: '#00E5FF', width: 12, label: 'Spread: Payment only' },
      { color: '#7928CA', width: 16, label: 'Velocity: 1.1m' },
      { color: '#FF0055', width: 28, label: 'Type: HTTP 503' },
      { color: '#FF5E00', width: 26, label: 'Severity: P2' }
    ],
    resolutionPlaybook: 'Fallback to secondary Stripe gateway route',
    resolutionTime: '2m 45s'
  },
  {
    id: 'INC-HIST-022',
    title: 'Auth JWT Signature Verification Memory Leak',
    date: '2025-01-19',
    originService: 'auth-service',
    vector: [0.75, 0.65, 0.45, 0.7, 0.85],
    barcode: [
      { color: '#7928CA', width: 20, label: 'Origin: Auth Pod' },
      { color: '#FF0055', width: 18, label: 'Spread: Gateway OOM' },
      { color: '#FFB800', width: 22, label: 'Velocity: 8.5m' },
      { color: '#00F2FE', width: 20, label: 'Type: SIGKILL OOM' },
      { color: '#FF0080', width: 20, label: 'Severity: P1' }
    ],
    resolutionPlaybook: 'Roll back JWT cert rotation patch and scale memory limit to 2Gi',
    resolutionTime: '6m 30s'
  }
];

export function computeIncidentFingerprint(incident) {
  const originService = incident?.servicesInvolved?.[0] || 'core-db';
  const isCoreDb = originService.includes('db');

  // Vector: [origin_idx, spread_reach, velocity, error_severity, cascade_depth]
  const currentVector = isCoreDb
    ? [0.98, 0.88, 0.82, 0.94, 0.91]
    : [0.65, 0.50, 0.40, 0.75, 0.60];

  const currentBarcode = [
    { color: '#FF0055', width: 16, label: `Origin: ${originService}` },
    { color: '#FF5E00', width: 24, label: 'Spread: Cascade Depth 4' },
    { color: '#00F2FE', width: 12, label: 'Velocity: High' },
    { color: '#7928CA', width: 24, label: 'Error: Timeout + Deadlock' },
    { color: '#FF0080', width: 24, label: 'Severity: Critical P1' }
  ];

  // Compare against historical incidents
  const matches = HISTORICAL_FINGERPRINTS.map(hist => {
    const similarity = +(cosineSimilarity(currentVector, hist.vector) * 100).toFixed(1);
    return {
      ...hist,
      matchPercentage: similarity
    };
  });

  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    currentBarcode,
    currentVector,
    topMatch: matches[0],
    allMatches: matches
  };
}
