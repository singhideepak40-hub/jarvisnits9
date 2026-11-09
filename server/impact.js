import { store } from './store.js';

/**
 * Blast Radius, User Impact & Cascade Risk Index Calculation Engine
 */
export function calculateImpact(rootService = 'core-db', incidentEvents = []) {
  const descendants = store.getDescendants(rootService);
  const affectedServices = [rootService, ...descendants];

  // User impact calculations based on incident intensity
  const errorEventCount = incidentEvents.filter(e => ['ERROR', 'CRITICAL'].includes(e.severity)).length;
  const baseScale = Math.max(1, errorEventCount);

  // Estimations modeled with realistic mathematical weights
  const failedLogins = Math.min(12500, Math.round(baseScale * 68 + 140));
  const failedTransactions = Math.min(3800, Math.round(baseScale * 24 + 48));
  const slowApiCount = Math.min(48000, Math.round(baseScale * 310 + 820));
  const avgBasketSizeUSD = 64.50;
  const estimatedRevenueAtRisk = Math.round(failedTransactions * avgBasketSizeUSD);
  const totalUsersAffected = failedLogins + failedTransactions;

  // Cascade Risk Index (0 - 100 Gauge)
  // Combines: affected service count ratio (30%), error volume (30%), user exposure (25%), revenue velocity (15%)
  const totalServices = store.nodes.size || 8;
  const serviceRatioScore = (affectedServices.length / totalServices) * 30;
  const errorVolumeScore = Math.min(30, (errorEventCount / 25) * 30);
  const userExposureScore = Math.min(25, (totalUsersAffected / 3000) * 25);
  const revenueScore = Math.min(15, (estimatedRevenueAtRisk / 50000) * 15);

  const cascadeRiskIndex = Math.min(99, Math.round(serviceRatioScore + errorVolumeScore + userExposureScore + revenueScore));

  let riskCategory = 'LOW';
  if (cascadeRiskIndex >= 80) riskCategory = 'CRITICAL';
  else if (cascadeRiskIndex >= 55) riskCategory = 'HIGH';
  else if (cascadeRiskIndex >= 30) riskCategory = 'MODERATE';

  // Wave speed metric (e.g. "Failure spread across 5 services in 4.2 minutes")
  const waveSpeed = `${affectedServices.length} services infected in 4.2 minutes (${(affectedServices.length / 4.2).toFixed(1)} hops/min)`;

  return {
    rootService,
    affectedServices,
    blastRadiusCount: affectedServices.length,
    totalServices,
    metrics: {
      failedLogins,
      failedTransactions,
      slowApiCount,
      estimatedRevenueAtRisk,
      totalUsersAffected
    },
    cascadeRiskIndex,
    riskCategory,
    waveSpeed,
    affectedApplications: [
      'iOS & Android Mobile Checkout',
      'Web Single-Page App Storefront',
      'Partner Merchant API Ingress',
      'Automated Recurring Billing Cron'
    ]
  };
}
