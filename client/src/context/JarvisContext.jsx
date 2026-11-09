import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_SERVICES, INITIAL_EDGES } from '../data/defaultServices';
import { soundEffects } from '../engine/soundEffects';
import confetti from 'canvas-confetti';

const JarvisContext = createContext(null);

export function JarvisProvider({ children }) {
  const [nodes, setNodes] = useState(INITIAL_SERVICES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [systemStatus, setSystemStatus] = useState('INCIDENT_DETECTED'); // 'ONLINE' | 'INCIDENT_DETECTED' | 'PREDICTIVE_WARNING'
  const [ecgStatus, setEcgStatus] = useState('alarm'); // 'steady' | 'irregular' | 'alarm'
  const [isMuted, setIsMuted] = useState(false);
  const [showBootAnimation, setShowBootAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Interactive Modals & Drawers
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Preset Scenarios
  const [currentScenarioPreset, setCurrentScenarioPreset] = useState('db_pool'); // 'db_pool' | 'stripe_down' | 'auth_oom' | 'healthy'
  
  // Time Travel Scrubber
  const [timeScrubberValue, setTimeScrubberValue] = useState(100); // 0 to 100%
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Backend connection status
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const wsRef = useRef(null);

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(prev => {
      soundEffects.setMuted(!prev);
      return !prev;
    });
  };

  // Cycle ECG State manually when clicked
  const cycleEcgStatus = () => {
    soundEffects.playClick();
    setEcgStatus(prev => {
      if (prev === 'steady') return 'irregular';
      if (prev === 'irregular') return 'alarm';
      return 'steady';
    });
  };

  // 1. Establish WebSocket & Polling with Backend
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
            handleIncomingServerMessage(msg);
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
          setEcgStatus('alarm');
        } else {
          setSystemStatus('ONLINE');
          setEcgStatus('steady');
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
    } catch {
      // Local fallback
    }
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

  const handleIncomingServerMessage = (msg) => {
    if (msg.type === 'EVENT') {
      setEvents(prev => [msg.data, ...prev.slice(0, 199)]);
      if (['ERROR', 'CRITICAL'].includes(msg.data.severity)) {
        soundEffects.playAlert();
        setSystemStatus('INCIDENT_DETECTED');
        setEcgStatus('alarm');
      }
    } else if (msg.type === 'TELEMETRY_TICK') {
      if (msg.graph?.nodes) {
        setNodes(prev => prev.map(pNode => {
          const updated = msg.graph.nodes.find(n => n.id === pNode.id);
          return updated ? { ...pNode, ...updated, position: pNode.position } : pNode;
        }));
      }
    }
  };

  // Chaos Injection Trigger
  const triggerChaos = async (scenario) => {
    soundEffects.playAlert();
    try {
      await fetch('/api/simulate/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      setTimeout(() => {
        refreshIncidents();
        fetchPredictions();
      }, 500);
    } catch {}
    runLocalScenario(scenario);
  };

  // Instant Scenario Presets Switcher
  const loadScenario = (presetKey) => {
    soundEffects.playClick();
    setCurrentScenarioPreset(presetKey);
    runLocalScenario(presetKey);
  };

  // Local Scenario State Builder
  const runLocalScenario = (preset) => {
    if (preset === 'healthy') {
      setNodes(INITIAL_SERVICES.map(s => ({ ...s, health: 100, status: 'healthy', activeAlerts: 0 })));
      setEvents([]);
      setIncidents([]);
      setSelectedIncident(null);
      setIncidentDetails(null);
      setPredictions([]);
      setSystemStatus('ONLINE');
      setEcgStatus('steady');
      return;
    }

    if (preset === 'stripe_down' || preset === 'payment_gateway_down') {
      const mockEvents = [
        {
          id: 'ev-stripe-01',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          service: 'payment-gateway',
          severity: 'CRITICAL',
          message: 'HTTP 503 Service Unavailable: Stripe Bank Ingress TLS Handshake Reset',
          type: 'network',
          trace_id: 'trace-stripe-9901',
          signalScore: 0.98
        },
        {
          id: 'ev-stripe-02',
          timestamp: new Date(Date.now() - 40000).toISOString(),
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
        eventCount: 22,
        rawNoiseFiltered: 94,
        servicesInvolved: ['payment-gateway', 'payment-service'],
        events: mockEvents
      };
      setIncidents([inc]);
      setSelectedIncident(inc);
      setSystemStatus('INCIDENT_DETECTED');
      setEcgStatus('alarm');

      setNodes(prev => prev.map(n => {
        if (n.id === 'payment-gateway') return { ...n, health: 10, status: 'failing', activeAlerts: 18 };
        if (n.id === 'payment-service') return { ...n, health: 35, status: 'degraded', activeAlerts: 8 };
        return { ...n, health: 100, status: 'healthy', activeAlerts: 0 };
      }));
      return;
    }

    // Default: 'db_pool' / 'kill_db'
    const mockEvents = [
      {
        id: 'ev-01',
        timestamp: new Date(Date.now() - 140000).toISOString(),
        service: 'core-db',
        severity: 'CRITICAL',
        message: 'HikariPool-1 - Connection pool exhausted! Active: 98/100, pending=42',
        type: 'dependency',
        trace_id: 'trace-core-8819',
        signalScore: 0.96
      },
      {
        id: 'ev-02',
        timestamp: new Date(Date.now() - 110000).toISOString(),
        service: 'auth-service',
        severity: 'ERROR',
        message: 'PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms',
        type: 'timeout',
        trace_id: 'trace-core-8819',
        signalScore: 0.91
      },
      {
        id: 'ev-03',
        timestamp: new Date(Date.now() - 80000).toISOString(),
        service: 'api-gateway',
        severity: 'CRITICAL',
        message: 'HTTP 504 Gateway Timeout: Upstream /auth/verify took >10000ms',
        type: 'network',
        trace_id: 'trace-core-8819',
        signalScore: 0.88
      },
      {
        id: 'ev-04',
        timestamp: new Date(Date.now() - 50000).toISOString(),
        service: 'payment-service',
        severity: 'CRITICAL',
        message: 'PaymentTransactionException: Core DB write lock acquisition timed out. Transaction rolled back.',
        type: 'exception',
        trace_id: 'trace-core-8819',
        signalScore: 0.89
      },
      {
        id: 'ev-05',
        timestamp: new Date(Date.now() - 20000).toISOString(),
        service: 'notification-service',
        severity: 'WARN',
        message: 'DeadLetterQueueOverflow: 1200 payment failed alerts pending retry buffer',
        type: 'dependency',
        trace_id: 'trace-core-8819',
        signalScore: 0.74
      },
      {
        id: 'ev-decoy-01',
        timestamp: new Date(Date.now() - 95000).toISOString(),
        service: 'notification-service',
        severity: 'WARN',
        message: 'NotificationWorkerGC: Major garbage collection pause took 420ms',
        type: 'metric',
        trace_id: 'decoy-gc-991',
        signalScore: 0.22,
        rejectionReason: 'Isolated background GC latency; zero causal impact'
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
    setEcgStatus('alarm');

    setNodes(prev => prev.map(n => {
      if (n.id === 'core-db') return { ...n, health: 10, status: 'failing', activeAlerts: 14 };
      if (['auth-service', 'api-gateway', 'payment-service'].includes(n.id)) return { ...n, health: 25, status: 'failing', activeAlerts: 8 };
      if (n.id === 'notification-service') return { ...n, health: 60, status: 'degraded', activeAlerts: 2 };
      return { ...n, health: 100, status: 'healthy', activeAlerts: 0 };
    }));
  };

  // Heal an individual microservice live
  const healService = (serviceId) => {
    soundEffects.playSuccess();
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

  // Heal entire platform with Confetti
  const healAllServices = () => {
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

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
    setEcgStatus('steady');
  };

  // Reset Simulation State
  const resetSimulation = async () => {
    soundEffects.playSuccess();
    try {
      await fetch('/api/simulate/reset', { method: 'POST' });
    } catch {}
    loadScenario('healthy');
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
      ecgStatus,
      setEcgStatus,
      cycleEcgStatus,
      isMuted,
      toggleMute,
      showBootAnimation,
      setShowBootAnimation,
      activeTab,
      setActiveTab,
      selectedNodeId,
      setSelectedNodeId,
      selectedNode,
      healService,
      healAllServices,
      selectedLog,
      setSelectedLog,
      isRiskModalOpen,
      setIsRiskModalOpen,
      isTerminalOpen,
      setIsTerminalOpen,
      isWarRoomOpen,
      setIsWarRoomOpen,
      isChatOpen,
      setIsChatOpen,
      isVoiceListening,
      setIsVoiceListening,
      isSimulating,
      setIsSimulating,
      currentScenarioPreset,
      loadScenario,
      triggerChaos,
      resetSimulation,
      timeScrubberValue,
      setTimeScrubberValue,
      isScrubbing,
      setIsScrubbing,
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
