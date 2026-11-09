import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Server, Globe, Cpu, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';

const iconMap = {
  frontend: Globe,
  gateway: Server,
  service: Cpu,
  database: Database,
  external: Server,
  worker: Bell
};

function CustomServiceNode({ data, selected }) {
  const Icon = iconMap[data.type] || Server;
  const isFailing = data.status === 'failing' || data.health < 40;
  const isDegraded = data.status === 'degraded' || (data.health >= 40 && data.health < 80);

  let borderClass = 'border-surface-border bg-surface-card hover:border-slate-600 shadow-sm';
  let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let statusText = 'Healthy';

  if (isFailing) {
    borderClass = 'border-rose-500/40 bg-rose-950/20 shadow-md shadow-rose-950/30';
    badgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    statusText = 'Failing';
  } else if (isDegraded) {
    borderClass = 'border-amber-500/40 bg-amber-950/20 shadow-sm';
    badgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    statusText = 'Degraded';
  }

  return (
    <div
      className={`px-3.5 py-3 rounded-xl border transition-all duration-200 min-w-[200px] select-none ${borderClass} ${
        selected ? 'ring-2 ring-brand-400' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2 !border-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-surface-panel text-slate-300">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100">{data.label}</div>
            <div className="text-[10px] text-slate-400">{data.tier || data.type}</div>
          </div>
        </div>

        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badgeClass}`}>
          {statusText}
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-surface-bg/70 px-2 py-1 rounded border border-surface-border/60">
          <span className="text-slate-400 block text-[9px]">P99 Latency</span>
          <span className={`font-medium ${
            (data.metrics?.latency || 24) > 1000 ? 'text-rose-400 font-semibold' : 'text-slate-200'
          }`}>
            {data.metrics?.latency || 24}ms
          </span>
        </div>

        <div className="bg-surface-bg/70 px-2 py-1 rounded border border-surface-border/60">
          <span className="text-slate-400 block text-[9px]">SLA Health</span>
          <span className={`font-medium ${
            data.health < 40 ? 'text-rose-400 font-semibold' : (data.health < 80 ? 'text-amber-400' : 'text-emerald-400')
          }`}>
            {data.health}%
          </span>
        </div>
      </div>

      {/* Kubernetes Pod Health Footer */}
      <div className="mt-2 pt-1.5 border-t border-surface-border/50 flex items-center justify-between text-[10px] text-slate-400">
        <span>Pods: {isFailing ? '2/4 Ready' : '4/4 Ready'}</span>
        <span>TPS: {data.metrics?.connections ? data.metrics.connections * 18 : 340}</span>
      </div>

      {/* Alert Pill if any */}
      {data.activeAlerts > 0 && (
        <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-semibold shadow">
          {data.activeAlerts} alerts
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2 !border-none" />
    </div>
  );
}

export default memo(CustomServiceNode);
