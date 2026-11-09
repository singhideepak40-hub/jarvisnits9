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
import { Network, Filter } from 'lucide-react';

const nodeTypes = {
  customService: CustomServiceNode
};

export default function ServiceGraph({ onSelectNode }) {
  const { nodes: contextNodes, edges: contextEdges, incidentDetails, setSelectedNodeId } = useJarvis();
  const [filterMode, setFilterMode] = useState('ALL');

  const affectedServices = incidentDetails?.impactAnalysis?.affectedServices || [
    'core-db', 'auth-service', 'api-gateway', 'payment-service', 'notification-service'
  ];

  const filteredContextNodes = useMemo(() => {
    if (filterMode === 'BLAST') {
      return contextNodes.filter(n => affectedServices.includes(n.id));
    }
    if (filterMode === 'FAILING') {
      return contextNodes.filter(n => n.health < 80 || n.status === 'failing');
    }
    return contextNodes;
  }, [contextNodes, filterMode, affectedServices]);

  const rfNodes = useMemo(() => {
    return filteredContextNodes.map(n => ({
      id: n.id,
      type: 'customService',
      position: n.position || { x: 300, y: 200 },
      data: { ...n }
    }));
  }, [filteredContextNodes]);

  const rfEdges = useMemo(() => {
    return contextEdges.map(e => {
      const isCascade = affectedServices.includes(e.source) && affectedServices.includes(e.target);
      return {
        ...e,
        animated: isCascade,
        style: {
          stroke: isCascade ? '#F43F5E' : '#475569',
          strokeWidth: isCascade ? 2.2 : 1.5
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCascade ? '#F43F5E' : '#475569',
          width: 14,
          height: 14
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
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node.id);
  }, [onSelectNode, setSelectedNodeId]);

  return (
    <div className="relative w-full h-[480px] rounded-xl calm-card overflow-hidden">
      {/* Clean Top Bar */}
      <div className="absolute top-3 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-panel/90 border border-surface-border">
          <Network className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-medium text-slate-200">
            Service Dependency Map
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 text-xs bg-surface-panel/90 p-0.5 rounded-lg border border-surface-border">
          {[
            { id: 'ALL', label: `All Services (${contextNodes.length})` },
            { id: 'BLAST', label: `Blast Radius (${affectedServices.length})` },
            { id: 'FAILING', label: 'Degraded Only' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterMode === f.id
                  ? 'bg-surface-card text-white font-medium border border-surface-border'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Legend */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center space-x-3 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-surface-panel/90 border border-surface-border">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Degraded</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Failing (Cascade)</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
