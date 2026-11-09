/**
 * J.A.R.V.I.S. In-Memory Temporal Knowledge Graph & Event Store
 * Implements Rule 0: NO Regular Database.
 * Holds:
 * 1. Directed Temporal Graph (nodes, edges with weights & timestamps)
 * 2. Append-Only Event Store (for time travel & replay)
 * 3. Rolling Ring Buffers for Metrics (maxlen = 60 per service)
 */

class RingBuffer {
  constructor(limit = 60) {
    this.limit = limit;
    this.buffer = [];
  }

  push(item) {
    if (this.buffer.length >= this.limit) {
      this.buffer.shift();
    }
    this.buffer.push(item);
  }

  getAll() {
    return [...this.buffer];
  }

  last() {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  clear() {
    this.buffer = [];
  }
}

export class TemporalKnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> { id, label, type, layer, health: 0-100, status: 'healthy'|'degraded'|'failing'|'predicted', metadata }
    this.edges = [];        // [{ from, to, type: 'depends_on'|'caused_by'|'affects'|'precedes', weight: 0-1, timestamp }]
    this.eventStore = [];   // Append-only list of normalized events
    this.metricBuffers = new Map(); // serviceId -> { cpu: RingBuffer, latency: RingBuffer, errorRate: RingBuffer, memory: RingBuffer, dbConnections: RingBuffer }

    this.initializeDefaultTopology();
  }

  initializeDefaultTopology() {
    this.nodes.clear();
    this.edges = [];
    this.metricBuffers.clear();

    const services = [
      { id: 'web-portal', label: 'Web Portal', type: 'frontend', layer: 0, critical: false },
      { id: 'api-gateway', label: 'API Gateway', type: 'gateway', layer: 1, critical: true },
      { id: 'auth-service', label: 'Auth Service', type: 'service', layer: 2, critical: true },
      { id: 'auth-db', label: 'Auth DB (Replica)', type: 'database', layer: 3, critical: false },
      { id: 'payment-service', label: 'Payment Service', type: 'service', layer: 2, critical: true },
      { id: 'payment-gateway', label: 'Payment Gateway (Stripe/Bank)', type: 'external', layer: 3, critical: true },
      { id: 'core-db', label: 'Core PostgreSQL DB', type: 'database', layer: 3, critical: true },
      { id: 'notification-service', label: 'Notification Service', type: 'worker', layer: 3, critical: false }
    ];

    services.forEach(s => {
      this.nodes.set(s.id, {
        ...s,
        health: 100,
        status: 'healthy',
        activeAlerts: 0,
        currentMetrics: {
          cpu: 18,
          memory: 42,
          latency: 24,
          errorRate: 0.05,
          dbConnections: 12
        }
      });

      this.metricBuffers.set(s.id, {
        cpu: new RingBuffer(60),
        memory: new RingBuffer(60),
        latency: new RingBuffer(60),
        errorRate: new RingBuffer(60),
        dbConnections: new RingBuffer(60)
      });

      // Seed initial 30 ticks of healthy telemetry
      const now = Date.now();
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now - i * 3000).toISOString();
        const buf = this.metricBuffers.get(s.id);
        buf.cpu.push({ timestamp: time, value: +(15 + Math.random() * 12).toFixed(1) });
        buf.memory.push({ timestamp: time, value: +(38 + Math.random() * 8).toFixed(1) });
        buf.latency.push({ timestamp: time, value: +(20 + Math.random() * 15).toFixed(1) });
        buf.errorRate.push({ timestamp: time, value: +(Math.random() * 0.1).toFixed(2) });
        buf.dbConnections.push({ timestamp: time, value: +(10 + Math.random() * 8).toFixed(0) });
      }
    });

    // Architecture Dependencies
    // Web Portal -> API Gateway
    this.addEdge('web-portal', 'api-gateway', 'depends_on', 0.95);
    // API Gateway -> Auth Service & Payment Service
    this.addEdge('api-gateway', 'auth-service', 'depends_on', 0.90);
    this.addEdge('api-gateway', 'payment-service', 'depends_on', 0.90);
    // Auth Service -> Auth DB & Core DB
    this.addEdge('auth-service', 'auth-db', 'depends_on', 0.60);
    this.addEdge('auth-service', 'core-db', 'depends_on', 0.95);
    // Payment Service -> Payment Gateway, Core DB, Notification
    this.addEdge('payment-service', 'payment-gateway', 'depends_on', 0.85);
    this.addEdge('payment-service', 'core-db', 'depends_on', 0.98);
    this.addEdge('payment-service', 'notification-service', 'affects', 0.65);
  }

  addEdge(from, to, type = 'depends_on', weight = 0.8) {
    this.edges.push({
      from,
      to,
      type,
      weight,
      timestamp: new Date().toISOString()
    });
  }

  addEvent(normalizedEvent) {
    this.eventStore.push(normalizedEvent);

    // Keep service alert count & metrics updated
    const node = this.nodes.get(normalizedEvent.service);
    if (node) {
      if (['ERROR', 'CRITICAL'].includes(normalizedEvent.severity)) {
        node.activeAlerts = (node.activeAlerts || 0) + 1;
        node.health = Math.max(5, node.health - (normalizedEvent.severity === 'CRITICAL' ? 25 : 12));
        node.status = node.health < 40 ? 'failing' : 'degraded';
      }
    }

    // Keep store capped at 2500 events to prevent unbounded browser/server memory
    if (this.eventStore.length > 2500) {
      this.eventStore.splice(0, this.eventStore.length - 2500);
    }
  }

  pushMetric(serviceId, metricName, value, timestamp = new Date().toISOString()) {
    const serviceBufs = this.metricBuffers.get(serviceId);
    if (serviceBufs && serviceBufs[metricName]) {
      serviceBufs[metricName].push({ timestamp, value });
    }
    const node = this.nodes.get(serviceId);
    if (node && node.currentMetrics) {
      node.currentMetrics[metricName] = value;
    }
  }

  getAncestors(nodeId) {
    // Who does nodeId depend on?
    const ancestors = new Set();
    const queue = [nodeId];
    while (queue.length > 0) {
      const curr = queue.shift();
      const directDeps = this.edges
        .filter(e => e.from === curr && e.type === 'depends_on')
        .map(e => e.to);
      for (const dep of directDeps) {
        if (!ancestors.has(dep)) {
          ancestors.add(dep);
          queue.push(dep);
        }
      }
    }
    return Array.from(ancestors);
  }

  getDescendants(nodeId) {
    // Who depends on nodeId? (Blast radius / ripple wave)
    const descendants = new Set();
    const queue = [nodeId];
    while (queue.length > 0) {
      const curr = queue.shift();
      // Find incoming 'depends_on' edges (meaning other services depend on curr)
      const directDependents = this.edges
        .filter(e => e.to === curr && e.type === 'depends_on')
        .map(e => e.from);
      // Also outgoing 'affects' edges
      const affected = this.edges
        .filter(e => e.from === curr && e.type === 'affects')
        .map(e => e.to);

      for (const dep of [...directDependents, ...affected]) {
        if (!descendants.has(dep)) {
          descendants.add(dep);
          queue.push(dep);
        }
      }
    }
    return Array.from(descendants);
  }

  getGraphData() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges]
    };
  }

  getMetricsForService(serviceId) {
    const bufs = this.metricBuffers.get(serviceId);
    if (!bufs) return null;
    return {
      cpu: bufs.cpu.getAll(),
      memory: bufs.memory.getAll(),
      latency: bufs.latency.getAll(),
      errorRate: bufs.errorRate.getAll(),
      dbConnections: bufs.dbConnections.getAll()
    };
  }

  reset() {
    this.initializeDefaultTopology();
    this.eventStore = [];
  }
}

// Global In-Memory Singleton instance
export const store = new TemporalKnowledgeGraph();
