export const INITIAL_SERVICES = [
  {
    id: 'web-portal',
    label: 'Web Portal',
    type: 'frontend',
    tier: 'Tier 0 Ingress',
    position: { x: 450, y: 30 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 22, memory: 44, latency: 28, errorRate: 0.02, connections: 80 }
  },
  {
    id: 'api-gateway',
    label: 'API Gateway (Kong/Envoy)',
    type: 'gateway',
    tier: 'Tier 1 Gateway',
    position: { x: 450, y: 170 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 34, memory: 52, latency: 45, errorRate: 0.05, connections: 120 }
  },
  {
    id: 'auth-service',
    label: 'Auth Service',
    type: 'service',
    tier: 'Tier 2 Core Logic',
    position: { x: 230, y: 310 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 28, memory: 48, latency: 38, errorRate: 0.03, connections: 25 }
  },
  {
    id: 'payment-service',
    label: 'Payment Service',
    type: 'service',
    tier: 'Tier 2 Core Logic',
    position: { x: 670, y: 310 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 32, memory: 58, latency: 55, errorRate: 0.04, connections: 35 }
  },
  {
    id: 'auth-db',
    label: 'Auth DB (Replica)',
    type: 'database',
    tier: 'Tier 3 Storage',
    position: { x: 90, y: 470 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 18, memory: 35, latency: 12, errorRate: 0.0, connections: 18 }
  },
  {
    id: 'core-db',
    label: 'Core PostgreSQL DB',
    type: 'database',
    tier: 'Tier 3 Storage [Primary]',
    position: { x: 450, y: 470 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 38, memory: 64, latency: 16, errorRate: 0.01, connections: 42 }
  },
  {
    id: 'payment-gateway',
    label: 'External Bank / Stripe Gateway',
    type: 'external',
    tier: 'Tier 3 External SaaS',
    position: { x: 740, y: 470 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 15, memory: 30, latency: 110, errorRate: 0.02, connections: 10 }
  },
  {
    id: 'notification-service',
    label: 'Notification Service',
    type: 'worker',
    tier: 'Tier 3 Worker',
    position: { x: 960, y: 360 },
    health: 100,
    status: 'healthy',
    activeAlerts: 0,
    metrics: { cpu: 20, memory: 39, latency: 40, errorRate: 0.01, connections: 8 }
  }
];

export const INITIAL_EDGES = [
  { id: 'e-web-gateway', source: 'web-portal', target: 'api-gateway', animated: true, label: 'depends_on (0.95)' },
  { id: 'e-gateway-auth', source: 'api-gateway', target: 'auth-service', animated: true, label: 'depends_on (0.90)' },
  { id: 'e-gateway-payment', source: 'api-gateway', target: 'payment-service', animated: true, label: 'depends_on (0.90)' },
  { id: 'e-auth-authdb', source: 'auth-service', target: 'auth-db', animated: false, label: 'depends_on (0.60)' },
  { id: 'e-auth-coredb', source: 'auth-service', target: 'core-db', animated: true, label: 'depends_on (0.95)' },
  { id: 'e-payment-coredb', source: 'payment-service', target: 'core-db', animated: true, label: 'depends_on (0.98)' },
  { id: 'e-payment-ext', source: 'payment-service', target: 'payment-gateway', animated: false, label: 'depends_on (0.85)' },
  { id: 'e-payment-notif', source: 'payment-service', target: 'notification-service', animated: false, label: 'affects (0.65)' }
];
