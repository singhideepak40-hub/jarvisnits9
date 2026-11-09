import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity, Clock } from 'lucide-react';

export default function TrendLineChart() {
  // 15 historical points + 7 projected points crossing threshold at 95%
  const chartData = [
    { time: '10:35', actual: 34, projected: null, threshold: 95 },
    { time: '10:36', actual: 42, projected: null, threshold: 95 },
    { time: '10:37', actual: 48, projected: null, threshold: 95 },
    { time: '10:38', actual: 56, projected: null, threshold: 95 },
    { time: '10:39', actual: 64, projected: null, threshold: 95 },
    { time: '10:40', actual: 72, projected: null, threshold: 95 },
    { time: '10:41', actual: 82, projected: null, threshold: 95 },
    { time: '10:42', actual: 91, projected: 91, threshold: 95 }, // Hand-off point
    { time: '10:43 (P)', actual: null, projected: 94, threshold: 95 },
    { time: '10:44 (P)', actual: null, projected: 98, threshold: 95 }, // Breach!
    { time: '10:45 (P)', actual: null, projected: 100, threshold: 95 },
    { time: '10:46 (P)', actual: null, projected: 100, threshold: 95 }
  ];

  return (
    <div className="rounded-xl hud-panel p-4 border border-cyber-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-cyber-border/70 mb-3 gap-2">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Activity className="w-4 h-4 text-cyber-amber" />
          <span>PROJECTED METRIC BREACH (CORE DB CONNECTION POOL %)</span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-cyber-red/20 border border-cyber-red text-cyber-red font-mono text-xs font-bold animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          <span>THRESHOLD BREACH IN 04:12</span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#152445" />
            <XAxis dataKey="time" stroke="#8A99AD" fontSize={10} fontStyle="mono" />
            <YAxis stroke="#8A99AD" domain={[20, 105]} fontSize={10} fontStyle="mono" unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090F1E',
                borderColor: '#00F2FE',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            {/* Threshold line */}
            <ReferenceLine y={95} stroke="#FF2A55" strokeDasharray="5 5" label={{ value: 'CRITICAL SLA THRESHOLD (95%)', fill: '#FF2A55', fontSize: 10, position: 'top' }} />

            {/* Actual telemetry line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Historical Telemetry"
              stroke="#00F2FE"
              strokeWidth={3}
              dot={{ fill: '#00F2FE', r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Projected regression line (dotted amber) */}
            <Line
              type="monotone"
              dataKey="projected"
              name="Predictive Failure Cone (Projected)"
              stroke="#FF9F1C"
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={{ fill: '#FF9F1C', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
