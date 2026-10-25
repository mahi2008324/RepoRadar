import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './CustomNode';
import { GraphControls } from './GraphControls';
import { GraphLegend } from './GraphLegend';
import { GraphDetailsPanel } from './GraphDetailsPanel';
import { EmptyState } from '../common/EmptyState';
import { Layers } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

/**
 * Calculates hierarchical layered layout positions for graph nodes
 */
function calculateGraphLayout(rawNodes, rawEdges) {
  if (!rawNodes || rawNodes.length === 0) return [];

  // Build adjacency
  const inMap = new Map();
  const outMap = new Map();
  for (const n of rawNodes) {
    inMap.set(n.id, 0);
    outMap.set(n.id, []);
  }

  for (const e of rawEdges) {
    if (inMap.has(e.target)) {
      inMap.set(e.target, inMap.get(e.target) + 1);
    }
    if (outMap.has(e.source)) {
      outMap.get(e.source).push(e.target);
    }
  }

  // Calculate topological tier / rank for each node
  const ranks = new Map();
  const visited = new Set();

  function assignRank(nodeId, currentRank) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const prevRank = ranks.get(nodeId) || 0;
    ranks.set(nodeId, Math.max(prevRank, currentRank));

    const children = outMap.get(nodeId) || [];
    for (const childId of children) {
      assignRank(childId, currentRank + 1);
    }
  }

  // Start with root/entry nodes (inDegree === 0)
  const roots = rawNodes.filter((n) => (inMap.get(n.id) || 0) === 0);
  for (const root of roots) {
    assignRank(root.id, 0);
  }

  // Handle any remaining unvisited nodes
  for (const n of rawNodes) {
    if (!visited.has(n.id)) {
      assignRank(n.id, 0);
    }
  }

  // Group nodes by their tier/rank
  const tiers = new Map();
  for (const n of rawNodes) {
    const rank = ranks.get(n.id) || 0;
    if (!tiers.has(rank)) {
      tiers.set(rank, []);
    }
    tiers.get(rank).push(n);
  }

  // Assign x, y coordinates
  const positionedNodes = [];
  const X_SPACING = 270;
  const Y_SPACING = 160;

  for (const [rank, tierNodes] of tiers.entries()) {
    const totalWidth = (tierNodes.length - 1) * X_SPACING;
    const startX = -totalWidth / 2;

    tierNodes.forEach((node, idx) => {
      positionedNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: startX + idx * X_SPACING,
          y: rank * Y_SPACING
        },
        data: {
          ...node,
          label: node.label,
          path: node.path,
          inDegree: node.inDegree || 0,
          outDegree: node.outDegree || 0
        }
      });
    });
  }

  return positionedNodes;
}

export function DependencyGraph({
  nodes: rawNodes = [],
  edges: rawEdges = [],
  initialSelectedId = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDir, setSelectedDir] = useState('all');
  const [hideDisconnected, setHideDisconnected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(initialSelectedId);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Extract unique directories for filter
  const directories = useMemo(() => {
    const dirs = new Set();
    for (const n of rawNodes) {
      const parts = n.path.split('/');
      if (parts.length > 1) {
        dirs.add(parts[0]);
      }
    }
    return Array.from(dirs).sort();
  }, [rawNodes]);

  // Compute positioned nodes
  const initialPositionedNodes = useMemo(() => {
    return calculateGraphLayout(rawNodes, rawEdges);
  }, [rawNodes, rawEdges]);

  // Formatted edges with styled directional arrows
  const initialEdges = useMemo(() => {
    return rawEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'default',
      animated: false,
      style: { stroke: '#475569', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: '#475569'
      }
    }));
  }, [rawEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialPositionedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when selectedNodeId or search query changes
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    // Direct dependencies of selected node
    const directDependencies = new Set(
      rawEdges.filter((e) => e.source === selectedNodeId).map((e) => e.target)
    );

    // Direct dependents of selected node
    const directDependents = new Set(
      rawEdges.filter((e) => e.target === selectedNodeId).map((e) => e.source)
    );

    // Filter nodes by search, directory, and disconnected state
    const updatedNodes = initialPositionedNodes
      .filter((n) => {
        if (hideDisconnected && n.data.inDegree === 0 && n.data.outDegree === 0) {
          return false;
        }
        if (selectedDir !== 'all') {
          if (!n.data.path.startsWith(selectedDir + '/')) {
            return false;
          }
        }
        return true;
      })
      .map((node) => {
        const isMatch = query && (
          node.data.label.toLowerCase().includes(query) ||
          node.data.path.toLowerCase().includes(query)
        );

        const isSelected = node.id === selectedNodeId;
        const isDep = directDependencies.has(node.id);
        const isDepend = directDependents.has(node.id);

        return {
          ...node,
          selected: isSelected,
          data: {
            ...node.data,
            isHighlighted: isMatch,
            isDirectDependency: isDep,
            isDirectDependent: isDepend
          }
        };
      });

    setNodes(updatedNodes);

    // Update edges styling based on selection
    const visibleNodeIds = new Set(updatedNodes.map((n) => n.id));

    const updatedEdges = initialEdges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((edge) => {
        const isOutgoingFromSelected = edge.source === selectedNodeId;
        const isIncomingToSelected = edge.target === selectedNodeId;

        if (isOutgoingFromSelected) {
          return {
            ...edge,
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#06b6d4' }
          };
        }

        if (isIncomingToSelected) {
          return {
            ...edge,
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#a855f7' }
          };
        }

        return {
          ...edge,
          animated: false,
          style: { stroke: selectedNodeId ? '#1e293b' : '#475569', strokeWidth: 1.5, opacity: selectedNodeId ? 0.4 : 0.8 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: selectedNodeId ? '#1e293b' : '#475569' }
        };
      });

    setEdges(updatedEdges);
  }, [selectedNodeId, searchQuery, selectedDir, hideDisconnected, initialPositionedNodes, initialEdges]);

  // Center on node when initialSelectedId is supplied or selected
  const handleSelectNode = useCallback(
    (nodeId) => {
      setSelectedNodeId(nodeId);
      if (reactFlowInstance) {
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (targetNode) {
          reactFlowInstance.setCenter(targetNode.position.x + 100, targetNode.position.y + 40, {
            zoom: 1.1,
            duration: 800
          });
        }
      }
    },
    [nodes, reactFlowInstance]
  );

  const onNodeClick = useCallback(
    (_, node) => {
      handleSelectNode(node.id);
    },
    [handleSelectNode]
  );

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
    }
  }, [reactFlowInstance]);

  const handleResetSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSearchQuery('');
    setSelectedDir('all');
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
    }
  }, [reactFlowInstance]);

  const activeSelectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  if (!rawNodes || rawNodes.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-12 h-12 text-indigo-400" />}
        title="No Supported Dependencies Discovered"
        description="The analyzed repository did not contain internal JavaScript or TypeScript source files with import relationships."
      />
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[600px] bg-[#0c101a] border border-radar-border rounded-xl overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="p-3 bg-radar-bg/95 border-b border-radar-border z-10">
        <GraphControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          directories={directories}
          selectedDir={selectedDir}
          onDirChange={setSelectedDir}
          hideDisconnected={hideDisconnected}
          onToggleHideDisconnected={() => setHideDisconnected(!hideDisconnected)}
          onResetSelection={handleResetSelection}
          onFitView={handleFitView}
          hasSelection={Boolean(selectedNodeId || searchQuery || selectedDir !== 'all')}
        />
      </div>

      {/* React Flow Canvas */}
      <div className="relative flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2.5}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bottom-4 !left-4" />
          <MiniMap
            nodeColor={(n) => {
              if (n.selected) return '#6366f1';
              if (n.data?.isDirectDependency) return '#06b6d4';
              if (n.data?.isDirectDependent) return '#a855f7';
              return '#334155';
            }}
            maskColor="rgba(10, 13, 20, 0.7)"
            className="!bottom-4 !right-4 !hidden sm:!block"
          />
        </ReactFlow>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <GraphLegend />
        </div>

        {/* Details Panel Drawer */}
        {activeSelectedNode && (
          <GraphDetailsPanel
            node={activeSelectedNode}
            edges={rawEdges}
            onClose={() => setSelectedNodeId(null)}
            onSelectNode={handleSelectNode}
          />
        )}
      </div>
    </div>
  );
}
