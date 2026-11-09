import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SERVICES, INITIAL_EDGES } from '../data/defaultServices';

const JarvisContext = createContext(null);

export function JarvisProvider({ children }) {
  const [nodes, setNodes] = useState(INITIAL_SERVICES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [systemStatus, setSystemStatus] = useState('INCIDENT_DETECTED'); // 'ONLINE' | 'INCIDENT_DETECTED'
  
  // Clean tab navigation
  // 'overview' | 'predictions' | 'investigation' | 'logs' | 'report'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Interactive Modals
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Scenarios
  const [currentScenarioPreset, setCurrentScenarioPreset] = useState('db_pool'); // 'db_pool' | 'stripe_down' | 'healthy'
  
  // Timeline replay
  const [timeScrubberValue, setTimeScrubberValue] = useState(100);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const wsRef = useRef(null);

  // 1. Establish WebSocket & REST Sync with Backend
  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connectWS = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsBackendConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'EVENT') {
              setEvents(prev => [msg.data, ...prev.slice(0, 149)]);
              if (['ERROR', 'CRITICAL'].includes(msg.data.severity)) {
                setSystemStatus('INCIDENT_DETECTED');
              }
            } else if (msg.type === 'TELEMETRY_TICK') {
              if (msg.graph?.nodes) {
                setNodes(prev => prev.map(pNode => {
                  const updated = msg.graph.nodes.find(n => n.id === pNode.id);
                  return updated ? { ...pNode, ...updated, position: pNode.position } : pNode;
                }));
              }
            }
          } catch (e) {
            console.error('WS parse error', e);
          }
        };

        ws.onclose = () => {
          setIsBackendConnected(false);
          reconnectTimer = setTimeout(connectWS, 4000);
        };

        ws.onerror = () => {
          setIsBackendConnected(false);
        };
      } catch (err) {
        setIsBackendConnected(false);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // Fetch Incidents & State
  const refreshIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        if (data.incidents && data.incidents.length > 0) {
          const firstInc = data.incidents[0];
          setSelectedIncident(firstInc);
          fetchIncidentDetails(firstInc.id);
          setSystemStatus('INCIDENT_DETECTED');
        } else {
          setSystemStatus('ONLINE');
        }
      } else {
        runLocalScenario(currentScenarioPreset);
      }
    } catch {
      runLocalScenario(currentScenarioPreset);
    }
  };

  const fetchIncidentDetails = async (id) => {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (res.ok) {
        const details = await res.json();
        setIncidentDetails(details);
        if (details.predictions?.forecasts) {
          setPredictions(details.predictions.forecasts);
        }
      }
    } catch {}
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/predictions');
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.forecasts || []);
      }
    } catch {}
  };

  useEffect(() => {
    refreshIncidents();
    fetchPredictions();
    const interval = setInterval(() => {
      refreshIncidents();
      fetchPredictions();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Preset Scenario Handler
  const loadScenario = (presetKey) => {
    setCurrentScenarioPreset(presetKey);
    runLocalScenario(presetKey);
  };

  // Seeded Banking Telemetry & Scenarios
  const runLocalScenario = (preset) => {
    if (preset === 'healthy') {
      setNodes(INITIAL_SERVICES.map(s => ({
        ...s,
        health: 100,
        status: 'healthy',
        activeAlerts: 0,
        predictedFailure: null,
        metrics: { ...s.metrics, latency: 18, errorRate: 0.01 }
      })));
      setEvents([]);
      setIncidents([]);
      setSelectedIncident(null);
      setIncidentDetails(null);
      setPredictions([]);
      setSystemStatus('ONLINE');
      return;
    }

    if (preset === 'stripe_down') {
      const mockEvents = [
        {
          id: 'ev-stripe-01',
          timestamp: new Date(Date.now() - 45000).toISOString(),
          service: 'payment-gateway',
          severity: 'CRITICAL',
          message: 'HTTP 503 Service Unavailable: Stripe Bank Ingress TLS Handshake Reset',
          type: 'network',
          trace_id: 'trace-stripe-9901',
          signalScore: 0.98
        },
        {
          id: 'ev-stripe-02',
          timestamp: new Date(Date.now() - 25000).toISOString(),
          service: 'payment-service',
          severity: 'ERROR',
          message: 'CircuitBreakerOpen: Payment gateway error threshold exceeded (94% failure rate)',
          type: 'exception',
          trace_id: 'trace-stripe-9901',
          signalScore: 0.92
        }
      ];

      setEvents(mockEvents);
      const inc = {
        id: 'INC-2026-002',
        title: 'External Payment Gateway Outage & Circuit Breaker Trip',
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        startTime: mockEvents[0].timestamp,
        lastTime: mockEvents[1].timestamp,
        eventCount: 14,
        rawNoiseFiltered: 82,
        servicesInvolved: ['payment-gateway', 'payment-service'],
        events: mockEvents
      };
      setIncidents([inc]);
      setSelectedIncident(inc);
      setSystemStatus('INCIDENT_DETECTED');

      setNodes(prev => prev.map(n => {
        if (n.id === 'payment-gateway') return { ...n, health: 15, status: 'failing', activeAlerts: 12 };
        if (n.id === 'payment-service') return { ...n, health: 40, status: 'degraded', activeAlerts: 6 };
        return { ...n, health: 100, status: 'healthy', activeAlerts: 0, predictedFailure: null };
      }));
      return;
    }

    // Default: 'db_pool' (Digital Banking Platform Scenario)
    const mockEvents = [
      {
        id: 'ev-01',
        timestamp: new Date(Date.now() - 140000).toISOString(),
        service: 'core-db',
        severity: 'CRITICAL',
        message: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending checkout transactions: 42',
        type: 'dependency',
        trace_id: 'trace-bank-8819',
        signalScore: 0.96
      },
      {
        id: 'ev-02',
        timestamp: new Date(Date.now() - 110000).toISOString(),
        service: 'auth-service',
        severity: 'ERROR',
        message: 'PoolWaitTimeout: Unable to acquire DB session for token validation within 5000ms',
        type: 'timeout',
        trace_id: 'trace-bank-8819',
        signalScore: 0.91
      },
      {
        id: 'ev-03',
        timestamp: new Date(Date.now() - 80000).toISOString(),
        service: 'api-gateway',
        severity: 'CRITICAL',
        message: 'HTTP 504 Gateway Timeout: Upstream /auth/verify and /checkout endpoints took >10000ms',
        type: 'network',
        trace_id: 'trace-bank-8819',
        signalScore: 0.88
      },
      {
        id: 'ev-04',
        timestamp: new Date(Date.now() - 50000).toISOString(),
        service: 'payment-service',
        severity: 'CRITICAL',
        message: 'PaymentTransactionException: Core DB write lock timed out. Transaction rolled back for customer.',
        type: 'exception',
        trace_id: 'trace-bank-8819',
        signalScore: 0.89
      },
      {
        id: 'ev-05',
        timestamp: new Date(Date.now() - 20000).toISOString(),
        service: 'notification-service',
        severity: 'WARN',
        message: 'DeadLetterQueueOverflow: 1,200 payment failed alerts pending retry buffer',
        type: 'dependency',
        trace_id: 'trace-bank-8819',
        signalScore: 0.74
      },
      {
        id: 'ev-decoy-01',
        timestamp: new Date(Date.now() - 95000).toISOString(),
        service: 'notification-service',
        severity: 'WARN',
        message: 'NotificationWorkerGC: Major garbage collection pause took 420ms (background worker)',
        type: 'metric',
        trace_id: 'decoy-gc-991',
        signalScore: 0.22,
        rejectionReason: 'Isolated background memory reclamation; zero impact on transaction pipeline'
      }
    ];

    setEvents(mockEvents);

    const mockInc = {
      id: 'INC-2026-001',
      title: 'Core DB Connection Exhaustion & Downstream Payment Cascade',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      startTime: mockEvents[0].timestamp,
      lastTime: mockEvents[4].timestamp,
      eventCount: 38,
      rawNoiseFiltered: 209,
      servicesInvolved: ['core-db', 'auth-service', 'api-gateway', 'payment-service', 'notification-service'],
      events: mockEvents.filter(e => e.signalScore >= 0.5)
    };

    setIncidents([mockInc]);
    setSelectedIncident(mockInc);
    setSystemStatus('INCIDENT_DETECTED');

    // Update node health
    setNodes(prev => prev.map(n => {
      if (n.id === 'core-db') return { ...n, health: 12, status: 'failing', activeAlerts: 14 };
      if (['auth-service', 'api-gateway', 'payment-service'].includes(n.id)) return { ...n, health: 30, status: 'failing', activeAlerts: 8 };
      if (n.id === 'notification-service') return { ...n, health: 65, status: 'degraded', activeAlerts: 2 };
      return { ...n, health: 100, status: 'healthy', activeAlerts: 0, predictedFailure: null };
    }));
  };

  // 1-Click Heal specific service
  const healService = (serviceId) => {
    setNodes(prev => prev.map(n => {
      if (n.id === serviceId) {
        return {
          ...n,
          health: 100,
          status: 'healthy',
          activeAlerts: 0,
          predictedFailure: null,
          metrics: { ...n.metrics, latency: 18, errorRate: 0.01 }
        };
      }
      return n;
    }));
  };

  // 1-Click Resolve & Heal All
  const healAllServices = () => {
    setNodes(INITIAL_SERVICES.map(s => ({
      ...s,
      health: 100,
      status: 'healthy',
      activeAlerts: 0,
      predictedFailure: null
    })));
    setIncidents([]);
    setSelectedIncident(null);
    setIncidentDetails(null);
    setPredictions([]);
    setSystemStatus('ONLINE');
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <JarvisContext.Provider value={{
      nodes,
      setNodes,
      edges,
      setEdges,
      events,
      setEvents,
      incidents,
      selectedIncident,
      setSelectedIncident,
      incidentDetails,
      predictions,
      setPredictions,
      systemStatus,
      setSystemStatus,
      activeTab,
      setActiveTab,
      selectedNodeId,
      setSelectedNodeId,
      selectedNode,
      healService,
      healAllServices,
      selectedLog,
      setSelectedLog,
      isChatOpen,
      setIsChatOpen,
      currentScenarioPreset,
      loadScenario,
      timeScrubberValue,
      setTimeScrubberValue,
      isBackendConnected
    }}>
      {children}
    </JarvisContext.Provider>
  );
}

export function useJarvis() {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error('useJarvis must be used within JarvisProvider');
  return ctx;
}
