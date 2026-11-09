import { store } from './store.js';
import { normalizeEvent } from './normalizer.js';
import crypto from 'crypto';

/**
 * Procedural Seeded Scenario Generator & Chaos Injection Engine
 */
export class IncidentSimulator {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.tickCount = 0;
    this.activeChaos = null; // 'kill_db' | 'cpu_spike' | 'memory_leak' | 'net_delay' | 'payment_gateway_down' | 'traffic_surge'
    this.chaosStep = 0;
    this.subscribers = new Set(); // WebSocket/SSE callbacks
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcast(event) {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch {
        // ignore subscriber error
      }
    }
  }

  start(tickMs = 2500) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), tickMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  injectChaos(scenario = 'kill_db') {
    this.activeChaos = scenario;
    this.chaosStep = 0;
    // Broadcast chaos injection event
    const injectEvent = normalizeEvent({
      service: scenario === 'kill_db' ? 'core-db' : (scenario === 'cpu_spike' ? 'payment-service' : 'auth-service'),
      severity: 'CRITICAL',
      message: `[CHAOS INJECTION: ${scenario.toUpperCase()}] Fault simulated by operator`,
      type: 'metric'
    });
    store.addEvent(injectEvent);
    this.broadcast({ type: 'EVENT', data: injectEvent });
    this.tick(); // immediately execute step
  }

  reset() {
    this.activeChaos = null;
    this.chaosStep = 0;
    this.tickCount = 0;
    store.reset();
    this.broadcast({ type: 'RESET' });
  }

  tick() {
    this.tickCount++;
    const now = new Date().toISOString();

    if (this.activeChaos === 'kill_db') {
      this.runCoreDbCascade(now);
    } else if (this.activeChaos === 'cpu_spike') {
      this.runCpuSpikeCascade(now);
    } else if (this.activeChaos === 'memory_leak') {
      this.runMemoryLeakCascade(now);
    } else {
      this.runHealthyTelemetry(now);
    }

    // Occasionally generate an isolated decoy alert (noise vs signal separation)
    if (this.tickCount % 4 === 0) {
      this.generateDecoyAlert(now);
    }
  }

  runHealthyTelemetry(timestamp) {
    for (const [id, node] of store.nodes.entries()) {
      node.health = Math.min(100, node.health + 2);
      node.status = 'healthy';
      node.activeAlerts = 0;

      // Gentle random jitter
      const cpu = +(18 + Math.random() * 8).toFixed(1);
      const memory = +(42 + Math.random() * 6).toFixed(1);
      const latency = +(22 + Math.random() * 12).toFixed(1);
      const errorRate = +(Math.random() * 0.05).toFixed(2);
      const dbConnections = +(14 + Math.random() * 5).toFixed(0);

      store.pushMetric(id, 'cpu', cpu, timestamp);
      store.pushMetric(id, 'memory', memory, timestamp);
      store.pushMetric(id, 'latency', latency, timestamp);
      store.pushMetric(id, 'errorRate', errorRate, timestamp);
      store.pushMetric(id, 'dbConnections', dbConnections, timestamp);
    }

    // Broadcast standard telemetry ping
    this.broadcast({
      type: 'TELEMETRY_TICK',
      graph: store.getGraphData()
    });
  }

  generateDecoyAlert(timestamp) {
    const decoyLogs = [
      {
        service: 'notification-service',
        severity: 'WARN',
        message: 'NotificationWorkerGC: Major garbage collection pause took 420ms (Heap: 1.1GB)',
        type: 'metric'
      },
      {
        service: 'web-portal',
        severity: 'INFO',
        message: 'AnalyticsBeacon: Client beacon timed out for inactive session',
        type: 'access'
      },
      {
        service: 'auth-db',
        severity: 'WARN',
        message: 'ReadReplicaCheckpoint: WAL synchronization lag momentarily 120ms',
        type: 'metric'
      }
    ];

    const chosen = decoyLogs[Math.floor(Math.random() * decoyLogs.length)];
    const event = normalizeEvent({
      ...chosen,
      timestamp,
      trace_id: crypto.randomUUID()
    });
    store.addEvent(event);
    this.broadcast({ type: 'EVENT', data: event });
  }

  runCoreDbCascade(timestamp) {
    this.chaosStep++;
    const step = this.chaosStep;
    const traceId = `trace-cascade-${Math.floor(this.chaosStep / 3)}`;

    // Step 1: Root service Core DB saturates connection pool
    if (step >= 1) {
      const conn = Math.min(100, 75 + step * 5);
      store.pushMetric('core-db', 'dbConnections', conn, timestamp);
      store.pushMetric('core-db', 'latency', 1200 + step * 600, timestamp);
      store.pushMetric('core-db', 'cpu', 85 + step * 2, timestamp);

      const dbNode = store.nodes.get('core-db');
      if (dbNode) {
        dbNode.health = Math.max(5, 100 - step * 18);
        dbNode.status = dbNode.health < 30 ? 'failing' : 'degraded';
      }

      if (step === 1 || step === 2) {
        const ev = normalizeEvent({
          timestamp,
          service: 'core-db',
          severity: step === 1 ? 'WARN' : 'CRITICAL',
          message: `HikariPool-1 - Connection pool exhausted! Active: ${conn}/100, Pending requests: ${step * 24}, maxWait=5000ms`,
          trace_id: traceId,
          type: 'dependency',
          metric_value: conn
        });
        store.addEvent(ev);
        this.broadcast({ type: 'EVENT', data: ev });
      }
    }

    // Step 2 (T+1): Auth Service stalls on user lookup
    if (step >= 2) {
      store.pushMetric('auth-service', 'latency', 2400 + step * 400, timestamp);
      store.pushMetric('auth-service', 'errorRate', 12 + step * 8, timestamp);
      const authNode = store.nodes.get('auth-service');
      if (authNode) {
        authNode.health = Math.max(10, 100 - (step - 1) * 22);
        authNode.status = 'failing';
      }

      const ev = normalizeEvent({
        timestamp,
        service: 'auth-service',
        severity: 'ERROR',
        message: 'PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms',
        trace_id: traceId,
        type: 'timeout'
      });
      store.addEvent(ev);
      this.broadcast({ type: 'EVENT', data: ev });
    }

    // Step 3 (T+2): API Gateway starts returning 504 Gateway Timeouts
    if (step >= 3) {
      store.pushMetric('api-gateway', 'errorRate', 35 + step * 6, timestamp);
      store.pushMetric('api-gateway', 'latency', 3200 + step * 300, timestamp);
      const gwNode = store.nodes.get('api-gateway');
      if (gwNode) {
        gwNode.health = Math.max(15, 100 - (step - 2) * 25);
        gwNode.status = 'failing';
      }

      const ev = normalizeEvent({
        timestamp,
        service: 'api-gateway',
        severity: 'CRITICAL',
        message: 'HTTP 504 Gateway Timeout: Upstream /auth/verify and /checkout took >10000ms',
        trace_id: traceId,
        type: 'network'
      });
      store.addEvent(ev);
      this.broadcast({ type: 'EVENT', data: ev });
    }

    // Step 4 (T+3): Payment Service transactions rollback
    if (step >= 4) {
      store.pushMetric('payment-service', 'errorRate', 65 + step * 5, timestamp);
      const payNode = store.nodes.get('payment-service');
      if (payNode) {
        payNode.health = Math.max(10, 100 - (step - 3) * 28);
        payNode.status = 'failing';
      }

      const ev = normalizeEvent({
        timestamp,
        service: 'payment-service',
        severity: 'CRITICAL',
        message: 'PaymentTransactionException: Core DB write lock acquisition timed out. Transaction rolled back for checkout.',
        trace_id: traceId,
        type: 'exception'
      });
      store.addEvent(ev);
      this.broadcast({ type: 'EVENT', data: ev });
    }

    // Step 5 (T+4): Notification Service retries saturate
    if (step >= 5) {
      const ev = normalizeEvent({
        timestamp,
        service: 'notification-service',
        severity: 'WARN',
        message: 'DeadLetterQueueOverflow: 1200 payment failed alerts pending retry buffer',
        trace_id: traceId,
        type: 'dependency'
      });
      store.addEvent(ev);
      this.broadcast({ type: 'EVENT', data: ev });
    }

    // Broadcast graph update with updated node states
    this.broadcast({
      type: 'TELEMETRY_TICK',
      graph: store.getGraphData()
    });
  }

  runCpuSpikeCascade(timestamp) {
    this.chaosStep++;
    store.pushMetric('payment-service', 'cpu', 99.4, timestamp);
    store.pushMetric('payment-service', 'latency', 4500, timestamp);
    const payNode = store.nodes.get('payment-service');
    if (payNode) {
      payNode.health = 15;
      payNode.status = 'failing';
    }

    const ev = normalizeEvent({
      timestamp,
      service: 'payment-service',
      severity: 'CRITICAL',
      message: 'CPUThrottlingAlert: Payment worker threads pinned at 99.8% due to cryptographic key rotation storm',
      type: 'metric'
    });
    store.addEvent(ev);
    this.broadcast({ type: 'EVENT', data: ev });
    this.broadcast({ type: 'TELEMETRY_TICK', graph: store.getGraphData() });
  }

  runMemoryLeakCascade(timestamp) {
    this.chaosStep++;
    store.pushMetric('auth-service', 'memory', 96.8, timestamp);
    const authNode = store.nodes.get('auth-service');
    if (authNode) {
      authNode.health = 20;
      authNode.status = 'failing';
    }

    const ev = normalizeEvent({
      timestamp,
      service: 'auth-service',
      severity: 'CRITICAL',
      message: 'java.lang.OutOfMemoryError: Java heap space saturated by leaked JWT session cache',
      type: 'exception'
    });
    store.addEvent(ev);
    this.broadcast({ type: 'EVENT', data: ev });
    this.broadcast({ type: 'TELEMETRY_TICK', graph: store.getGraphData() });
  }
}

export const simulator = new IncidentSimulator();
