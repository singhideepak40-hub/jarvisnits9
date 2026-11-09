import { z } from 'zod';
import crypto from 'crypto';

export const NormalizedLogSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  timestamp: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid ISO timestamp"
  }),
  service: z.string().min(1),
  severity: z.enum(['INFO', 'WARN', 'ERROR', 'CRITICAL']),
  user_id: z.string().default('sys-daemon'),
  message: z.string().min(1),
  trace_id: z.string().default(() => crypto.randomUUID()),
  type: z.enum(['metric', 'exception', 'timeout', 'access', 'dependency', 'network']).default('exception'),
  metric_value: z.number().optional().nullable()
});

/**
 * Normalizes an arbitrary log event object into the standard schema.
 */
export function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Raw event must be an object');
  }

  // Derive timestamp
  let timestamp = raw.timestamp || raw.time || raw['@timestamp'] || new Date().toISOString();
  if (typeof timestamp === 'number') {
    timestamp = new Date(timestamp).toISOString();
  }

  // Normalize service name
  let service = (raw.service || raw.app || raw.component || raw.source || 'unknown-service').toLowerCase().trim();
  // Map common synonyms to standard topology
  if (service.includes('auth') && (service.includes('db') || service.includes('database'))) service = 'auth-db';
  else if (service.includes('core') && (service.includes('db') || service.includes('database') || service.includes('postgres') || service.includes('sql'))) service = 'core-db';
  else if (service.includes('auth')) service = 'auth-service';
  else if (service.includes('pay') && service.includes('gate')) service = 'payment-gateway';
  else if (service.includes('pay')) service = 'payment-service';
  else if (service.includes('notif')) service = 'notification-service';
  else if (service.includes('gate') || service.includes('kong') || service.includes('envoy')) service = 'api-gateway';
  else if (service.includes('web') || service.includes('ui') || service.includes('front')) service = 'web-portal';

  // Normalize severity
  let rawSev = (raw.severity || raw.level || raw.loglevel || 'INFO').toUpperCase().trim();
  let severity = 'INFO';
  if (['CRIT', 'CRITICAL', 'FATAL', 'EMERGENCY'].includes(rawSev)) severity = 'CRITICAL';
  else if (['ERR', 'ERROR', 'FAIL', 'SEVERE'].includes(rawSev)) severity = 'ERROR';
  else if (['WARN', 'WARNING'].includes(rawSev)) severity = 'WARN';
  else severity = 'INFO';

  // Trace ID & User ID
  const trace_id = raw.trace_id || raw.traceId || raw.trace || raw.span_id || crypto.randomUUID();
  const user_id = raw.user_id || raw.userId || raw.user || `usr_${Math.floor(1000 + Math.random() * 9000)}`;

  // Message & Type
  const message = raw.message || raw.msg || raw.error || raw.log || 'System telemetry notification';
  let type = raw.type || 'exception';
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out') || lowerMsg.includes('deadline')) type = 'timeout';
  else if (lowerMsg.includes('pool') || lowerMsg.includes('connection') || lowerMsg.includes('deadlock')) type = 'dependency';
  else if (lowerMsg.includes('cpu') || lowerMsg.includes('memory') || lowerMsg.includes('latency') || lowerMsg.includes('%')) type = 'metric';
  else if (lowerMsg.includes('http') || lowerMsg.includes('auth') || lowerMsg.includes('login')) type = 'access';
  else if (lowerMsg.includes('socket') || lowerMsg.includes('reset') || lowerMsg.includes('504')) type = 'network';

  const metric_value = typeof raw.metric_value === 'number' ? raw.metric_value : (
    typeof raw.value === 'number' ? raw.value : null
  );

  return NormalizedLogSchema.parse({
    id: raw.id || crypto.randomUUID(),
    timestamp,
    service,
    severity,
    user_id,
    message,
    trace_id,
    type,
    metric_value
  });
}

/**
 * Parses raw plain text log line (syslog, apache, standard format)
 */
export function parseLogLine(line) {
  line = line.trim();
  if (!line) return null;

  // JSON Line
  if (line.startsWith('{') && line.endsWith('}')) {
    try {
      return normalizeEvent(JSON.parse(line));
    } catch {
      // Fall through to regex parser
    }
  }

  // Regex format: [ISO_TIMESTAMP] [SEVERITY] [SERVICE] [TRACE_ID]: message
  const match = line.match(/^\[?([0-9T:\-\.Z]+)\]?\s+\[?(INFO|WARN|ERROR|CRITICAL|FATAL|DEBUG)\]?\s+\[?([\w\.\-]+)\]?(?:\s+\[?([a-f0-9\-]+)\]?)?:?\s*(.*)$/i);
  if (match) {
    const [, timestamp, level, service, trace_id, message] = match;
    return normalizeEvent({
      timestamp,
      severity: level,
      service,
      trace_id: trace_id || crypto.randomUUID(),
      message
    });
  }

  // Fallback generic parsing
  return normalizeEvent({
    timestamp: new Date().toISOString(),
    severity: line.includes('ERROR') ? 'ERROR' : (line.includes('WARN') ? 'WARN' : 'INFO'),
    service: 'syslog-stream',
    message: line
  });
}

/**
 * Parses CSV string with header
 */
export function parseCSV(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < headers.length) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx];
    });
    try {
      results.push(normalizeEvent(obj));
    } catch {
      // ignore invalid rows
    }
  }
  return results;
}
