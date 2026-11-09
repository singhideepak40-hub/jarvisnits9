import React, { useMemo, useCallback } from 'react';
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
import { Activity, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

const nodeTypes = {
  customService: CustomServiceNode
};

export default function ServiceGraph({ onSelectNode }) {
  const { nodes: contextNodes, edges: contextEdges, incidentDetails } = useJarvis();

  // Convert context nodes to React Flow format
  const rfNodes = useMemo(() => {
    return contextNodes.map(n => ({
      id: n.id,
      type: 'customService',
      position: n.position || { x: 300, y: 200 },
      data: { ...n }
    }));
  }, [contextNodes]);

  // Convert context edges with dynamic styling based on cascade
  const rfEdges = useMemo(() => {
    const affectedServices = incidentDetails?.impactAnalysis?.affectedServices || ['core-db', 'auth-service', 'api-gateway', 'payment-service'];

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
  }, [contextEdges, incidentDetails]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync with context updates
  React.useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  React.useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    soundEffects.playClick();
    if (onSelectNode) onSelectNode(node.id);
  }, [onSelectNode]);

  return (
    <div className="relative w-full h-[540px] rounded-xl hud-panel border border-cyber-border overflow-hidden">
      {/* HUD Header Bar */}
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-3 pointer-events-none">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-bg/90 border border-cyber-border/80 backdrop-blur-md">
          <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-wider">
            Temporal Service Mesh Graph
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-cyber-muted px-2.5 py-1 rounded bg-cyber-card/80 border border-cyber-border">
          <span className="w-2 h-2 rounded-full bg-cyber-green inline-block" /> Healthy
          <span className="w-2 h-2 rounded-full bg-cyber-amber inline-block ml-2" /> Degraded
          <span className="w-2 h-2 rounded-full bg-cyber-red inline-block ml-2" /> Critical
          <span className="w-2 h-2 rounded-full border border-dashed border-cyber-amber inline-block ml-2" /> Predicted
        </div>
      </div>

      {/* Ripple Wave Speed Banner (I4) */}
      <div className="absolute top-3 right-4 z-10 hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyber-red/15 border border-cyber-red/40 text-cyber-red text-xs font-mono pointer-events-none">
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
