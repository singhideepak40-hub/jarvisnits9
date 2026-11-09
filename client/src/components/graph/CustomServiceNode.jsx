import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Server, Globe, Cpu, Bell, ShieldCheck, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

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
  const isPredicted = Boolean(data.predictedFailure);

  // Border & Glow styling
  let borderStyle = 'border-cyber-green/50 bg-cyber-card/90 text-cyber-text';
  let badgeColor = 'bg-cyber-green/20 text-cyber-green border-cyber-green/40';
  let statusText = 'HEALTHY';

  if (isFailing) {
    borderStyle = 'border-cyber-red bg-cyber-red/10 text-white shadow-neon-red animate-pulse';
    badgeColor = 'bg-cyber-red/30 text-cyber-red border-cyber-red';
    statusText = 'CRITICAL FAIL';
  } else if (isDegraded) {
    borderStyle = 'border-cyber-amber bg-cyber-amber/10 text-white shadow-neon-amber';
    badgeColor = 'bg-cyber-amber/30 text-cyber-amber border-cyber-amber';
    statusText = 'DEGRADED';
  } else if (isPredicted) {
    borderStyle = 'border-2 border-dashed border-cyber-amber bg-cyber-card/90 shadow-neon-amber';
    badgeColor = 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber/50';
    statusText = `PREDICTED (${data.predictedFailure.probability}%)`;
  }

  return (
    <div className={`relative px-4 py-3 rounded-xl border hud-panel transition-all duration-300 min-w-[210px] ${borderStyle} ${
      selected ? 'ring-2 ring-cyber-cyan scale-105' : ''
    }`}>
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="!bg-cyber-cyan !w-2.5 !h-2.5 !border-none" />
      
      {/* Node Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border/60">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isFailing ? 'bg-cyber-red/20 text-cyber-red' : (isPredicted ? 'bg-cyber-amber/20 text-cyber-amber' : 'bg-cyber-cyan/15 text-cyber-cyan')}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white">{data.label}</div>
            <div className="text-[9px] font-mono text-cyber-muted">{data.tier || data.type}</div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {/* Node Telemetry Sparkline / Metrics */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-cyber-bg/80 p-1.5 rounded border border-cyber-border/70">
          <span className="text-cyber-muted block text-[8px] uppercase">Health Score</span>
          <span className={`font-bold text-xs ${
            data.health < 40 ? 'text-cyber-red' : (data.health < 80 ? 'text-cyber-amber' : 'text-cyber-green')
          }`}>
            {data.health}%
          </span>
        </div>

        <div className="bg-cyber-bg/80 p-1.5 rounded border border-cyber-border/70">
          <span className="text-cyber-muted block text-[8px] uppercase">Latency</span>
          <span className={`font-bold text-xs ${
            (data.metrics?.latency || 24) > 1000 ? 'text-cyber-red' : 'text-cyber-cyan'
          }`}>
            {data.metrics?.latency || 24}ms
          </span>
        </div>
      </div>

      {/* Predictive Warning Banner if active */}
      {isPredicted && (
        <div className="mt-2 text-[9px] font-mono bg-cyber-amber/15 border border-cyber-amber/40 rounded p-1 text-cyber-amber flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 animate-spin" />
            <span>ETA Failure:</span>
          </div>
          <span className="font-bold">+{data.predictedFailure.etaMinutes}m</span>
        </div>
      )}

      {/* Active Alerts Pill */}
      {data.activeAlerts > 0 && (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-cyber-red text-white text-[9px] font-mono font-bold shadow-neon-red">
          {data.activeAlerts} alerts
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-cyber-cyan !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}

export default memo(CustomServiceNode);
