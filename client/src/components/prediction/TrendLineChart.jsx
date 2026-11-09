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
import { Clock, TrendingUp } from 'lucide-react';

export default function TrendLineChart() {
  const chartData = [
    { time: '10:35', actual: 34, projected: null, threshold: 95 },
    { time: '10:36', actual: 42, projected: null, threshold: 95 },
    { time: '10:37', actual: 48, projected: null, threshold: 95 },
    { time: '10:38', actual: 56, projected: null, threshold: 95 },
    { time: '10:39', actual: 64, projected: null, threshold: 95 },
    { time: '10:40', actual: 72, projected: null, threshold: 95 },
    { time: '10:41', actual: 82, projected: null, threshold: 95 },
    { time: '10:42', actual: 91, projected: 91, threshold: 95 }, // Current Hand-off
    { time: '10:43 (P)', actual: null, projected: 94, threshold: 95 },
    { time: '10:44 (P)', actual: null, projected: 98, threshold: 95 }, // Breach
    { time: '10:45 (P)', actual: null, projected: 100, threshold: 95 },
    { time: '10:46 (P)', actual: null, projected: 100, threshold: 95 }
  ];

  return (
    <div className="calm-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-surface-border gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Connection Pool Utilization & Projected Breach
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Linear slope analysis over rolling 60-point ring buffer for Core PostgreSQL DB.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Threshold breach estimated in 04:12</span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#202D42" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" domain={[20, 105]} fontSize={11} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#172236',
                borderColor: '#263650',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#F8FAFC'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Threshold line */}
            <ReferenceLine
              y={95}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              label={{ value: 'SLA Danger Limit (95%)', fill: '#F43F5E', fontSize: 11, position: 'top' }}
            />

            {/* Actual telemetry */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Historical Telemetry (%)"
              stroke="#38BDF8"
              strokeWidth={2.5}
              dot={{ fill: '#38BDF8', r: 3 }}
            />

            {/* Projected */}
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected Trend (Future Forecast)"
              stroke="#F59E0B"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ fill: '#F59E0B', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
