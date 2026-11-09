import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomServiceNode from './CustomServiceNode';
import { useJarvis } from '../../context/JarvisContext';
import { Activity, ShieldAlert, Sparkles, Filter, Layers, ZoomIn } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

const nodeTypes = {
  customService: CustomServiceNode
};

export default function ServiceGraph({ onSelectNode }) {
  const { nodes: contextNodes, edges: contextEdges, incidentDetails, setSelectedNodeId } = useJarvis();
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'BLAST' | 'CRITICAL' | 'STORAGE'

  const affectedServices = incidentDetails?.impactAnalysis?.affectedServices || ['core-db', 'auth-service', 'api-gateway', 'payment-service', 'notification-service'];

  // Filter nodes interactively
  const filteredContextNodes = useMemo(() => {
    if (filterMode === 'BLAST') {
      return contextNodes.filter(n => affectedServices.includes(n.id));
    }
    if (filterMode === 'CRITICAL') {
      return contextNodes.filter(n => n.health < 40 || n.status === 'failing');
    }
    if (filterMode === 'STORAGE') {
      return contextNodes.filter(n => n.type === 'database');
    }
    return contextNodes;
  }, [contextNodes, filterMode, affectedServices]);

  // Convert context nodes to React Flow format
  const rfNodes = useMemo(() => {
    return filteredContextNodes.map(n => ({
      id: n.id,
      type: 'customService',
      position: n.position || { x: 300, y: 200 },
      data: { ...n }
    }));
  }, [filteredContextNodes]);

  // Convert context edges with dynamic styling based on cascade
  const rfEdges = useMemo(() => {
    return contextEdges.map(e => {
      const isCascadePath = affectedServices.includes(e.source) && affectedServices.includes(e.target);
      return {
        ...e,
        animated: true,
        style: {
          stroke: isCascadePath ? '#FF2A55' : '#00F2FE',
          strokeWidth: isCascadePath ? 3 : 1.8,
          strokeDasharray: isCascadePath ? '6 3' : undefined
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCascadePath ? '#FF2A55' : '#00F2FE',
          width: 16,
          height: 16
        }
      };
    });
  }, [contextEdges, affectedServices]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  React.useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  React.useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    soundEffects.playClick();
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node.id);
  }, [onSelectNode, setSelectedNodeId]);

  return (
    <div className="relative w-full h-[540px] rounded-xl hud-panel border border-cyber-border overflow-hidden select-none">
      {/* Top Left Title & Interactive Filter Pills */}
      <div className="absolute top-3 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-bg/90 border border-cyber-border/80 backdrop-blur-md">
          <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-wider">
            Service Mesh Graph (Click Node to Inspect)
          </span>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center space-x-1 font-mono text-[10px] bg-cyber-card/90 p-0.5 rounded-lg border border-cyber-border">
          {[
            { id: 'ALL', label: `All (${contextNodes.length})` },
            { id: 'BLAST', label: `Blast Radius (${affectedServices.length})` },
            { id: 'CRITICAL', label: 'Failing Only' },
            { id: 'STORAGE', label: 'Databases' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundEffects.playClick();
                setFilterMode(f.id);
              }}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                filterMode === f.id
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40 shadow-neon-cyan'
                  : 'text-cyber-muted hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ripple Wave Speed Banner (I4) */}
      <div className="absolute top-3 right-4 z-10 hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-red/15 border border-cyber-red/40 text-cyber-red text-xs font-mono pointer-events-none">
        <ShieldAlert className="w-4 h-4 animate-pulse" />
        <span>Wave Speed: <strong>5 services in 4.2m (1.2 hops/min)</strong></span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background color="#152445" gap={24} size={1.2} />
        <Controls className="!bg-cyber-card !border-cyber-border !text-cyber-cyan !fill-cyber-cyan" />
      </ReactFlow>
    </div>
  );
}
