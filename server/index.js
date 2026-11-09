import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { store } from './store.js';
import { normalizeEvent, parseLogLine, parseCSV } from './normalizer.js';
import { correlateEvents } from './correlator.js';
import { analyzeRootCause } from './rootcause.js';
import { calculateImpact } from './impact.js';
import { generatePredictions } from './predictor.js';
import { simulateCounterfactual } from './counterfactual.js';
import { computeIncidentFingerprint } from './fingerprint.js';
import { generateIncidentStory, handleAIChat } from './narrator.js';
import { simulator } from './simulator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.text({ limit: '20mb', type: ['text/*', 'application/x-ndjson'] }));

// Create HTTP server + WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Forward simulator events to all connected WebSocket clients
simulator.subscribe((msg) => {
  const payload = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
});

wss.on('connection', (ws) => {
  // Send current state on connect
  ws.send(JSON.stringify({
    type: 'INIT',
    graph: store.getGraphData(),
    eventCount: store.eventStore.length
  }));
});

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Ingest API (Batch Events)
app.post('/api/ingest/api', (req, res) => {
  try {
    const rawEvents = Array.isArray(req.body) ? req.body : [req.body];
    const normalized = rawEvents.map(normalizeEvent);
    normalized.forEach(e => {
      store.addEvent(e);
      simulator.broadcast({ type: 'EVENT', data: e });
    });
    res.json({ success: true, ingestedCount: normalized.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Ingest Upload (File Upload: JSON, CSV, Syslog plain text)
app.post('/api/ingest/upload', (req, res) => {
  try {
    let text = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const filename = req.headers['x-filename'] || 'upload.log';
    let normalized = [];

    if (filename.endsWith('.csv') || text.includes(',') && text.split('\n')[0].includes('service')) {
      normalized = parseCSV(text);
    } else if (filename.endsWith('.json') || (text.trim().startsWith('[') || text.trim().startsWith('{'))) {
      try {
        const parsed = JSON.parse(text);
        normalized = (Array.isArray(parsed) ? parsed : [parsed]).map(normalizeEvent);
      } catch {
        // Line-by-line JSON or syslog
        const lines = text.split(/\r?\n/);
        lines.forEach(l => {
          const ev = parseLogLine(l);
          if (ev) normalized.push(ev);
        });
      }
    } else {
      const lines = text.split(/\r?\n/);
      lines.forEach(l => {
        const ev = parseLogLine(l);
        if (ev) normalized.push(ev);
      });
    }

    normalized.forEach(e => {
      store.addEvent(e);
      simulator.broadcast({ type: 'EVENT', data: e });
    });

    res.json({
      success: true,
      filename,
      ingestedCount: normalized.length,
      sample: normalized.slice(0, 3)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Simulator Controls & Chaos Injection
app.post('/api/simulate/start', (req, res) => {
  const speed = req.body?.speed || 2500;
  simulator.start(speed);
  res.json({ success: true, running: true, speed });
});

app.post('/api/simulate/stop', (req, res) => {
  simulator.stop();
  res.json({ success: true, running: false });
});

app.post('/api/simulate/reset', (req, res) => {
  simulator.reset();
  res.json({ success: true, reset: true });
});

app.post('/api/simulate/inject', (req, res) => {
  const scenario = req.body?.scenario || 'kill_db';
  simulator.injectChaos(scenario);
  res.json({ success: true, scenario, message: `Chaos injected: ${scenario}` });
});

// 4. Correlated Incidents List & Multi-Signal Reduction
app.get('/api/incidents', (req, res) => {
  const correlation = correlateEvents();
  res.json(correlation);
});

// 5. Deep Incident Details (Root Cause, Evidence, Impact, DNA, Playbook)
app.get('/api/incidents/:id', (req, res) => {
  const correlation = correlateEvents();
  const incident = correlation.incidents.find(i => i.id === req.params.id) || correlation.incidents[0];

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const rootCauseAnalysis = analyzeRootCause(incident);
  const impactAnalysis = calculateImpact(rootCauseAnalysis?.rootCause?.service || 'core-db', incident.events);
  const predictions = generatePredictions();
  const fingerprint = computeIncidentFingerprint(incident);
  const story = generateIncidentStory(incident, rootCauseAnalysis?.rootCause, impactAnalysis);

  res.json({
    incident,
    rootCauseAnalysis,
    impactAnalysis,
    predictions,
    fingerprint,
    story
  });
});

// 6. Predictive Failure Cone & Early Warnings
app.get('/api/predictions', (req, res) => {
  const preds = generatePredictions();
  res.json(preds);
});

// 7. Counterfactual "Rewind & Fix"
app.post('/api/counterfactual', (req, res) => {
  const { fixAction, rewindTimestamp } = req.body || {};
  const result = simulateCounterfactual(fixAction, rewindTimestamp);
  res.json(result);
});

// 8. Digital Twin "What-If" Lab
app.post('/api/whatif', (req, res) => {
  const { targetService, failureMode } = req.body || {};
  const svc = targetService || 'payment-gateway';
  const descendants = store.getDescendants(svc);
  const affected = [svc, ...descendants];
  const totalUsers = affected.length * 950;

  res.json({
    targetService: svc,
    failureMode: failureMode || 'latency_surge',
    predictedBlastRadius: affected,
    predictedUsersAffected: totalUsers,
    predictedRevenueRiskUSD: Math.round(totalUsers * 42.5),
    timeToCascadeMinutes: 3.5,
    recommendation: `Pre-provision circuit breakers on ${svc} callers to isolate failure.`
  });
});

// 9. Full Post-Mortem Incident Report Data
app.get('/api/report/:id', (req, res) => {
  const correlation = correlateEvents();
  const incident = correlation.incidents.find(i => i.id === req.params.id) || correlation.incidents[0];
  const root = analyzeRootCause(incident);
  const impact = calculateImpact(root?.rootCause?.service || 'core-db', incident?.events || []);
  const story = generateIncidentStory(incident, root?.rootCause, impact);
  const fp = computeIncidentFingerprint(incident);

  res.json({
    id: incident?.id || 'INC-2026-001',
    generatedAt: new Date().toISOString(),
    title: incident?.title || 'Core DB Outage',
    severity: incident?.severity || 'CRITICAL',
    rootCause: root?.rootCause,
    explainability: root?.explainability,
    impact,
    playbook: root?.playbook,
    story,
    dnaMatch: fp?.topMatch,
    lessonsLearned: [
      'Increase HikariCP pool idle timeout buffer and set alerting at 80% saturation threshold.',
      'Enforce circuit breaking on Auth Service user session queries to prevent cascading gateway timeouts.',
      'Implement distributed query tracing with OpenTelemetry to track P99 lock contention automatically.'
    ]
  });
});

// 10. AI Chat Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    const correlation = correlateEvents();
    const incident = correlation.incidents[0];
    const root = analyzeRootCause(incident);
    const impact = calculateImpact(root?.rootCause?.service || 'core-db', incident?.events || []);

    const reply = await handleAIChat(question, {
      incident,
      rootCause: root?.rootCause,
      impact,
      reduction: correlation.reductionPercentage
    });

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({
      reply: 'Sir, diagnostic telemetry is operational. Core DB connection exhaustion is identified as the root anomaly with 91% confidence.',
      error: err.message
    });
  }
});

// 11. Graph & Telemetry Teleport
app.get('/api/graph', (req, res) => {
  res.json(store.getGraphData());
});

app.get('/api/events', (req, res) => {
  res.json(store.eventStore.slice(-100));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'J.A.R.V.I.S.',
    version: '2.0.0-PROD',
    activeNodes: store.nodes.size,
    storedEvents: store.eventStore.length
  });
});

// Start listening
server.listen(PORT, () => {
  console.log(`[J.A.R.V.I.S. SERVER ONLINE] Listening on port ${PORT}`);
  console.log(`[J.A.R.V.I.S. WS STREAM] ws://localhost:${PORT}/ws`);
  // Seed demo scenario by default
  simulator.injectChaos('kill_db');
  simulator.start(3000);
});
