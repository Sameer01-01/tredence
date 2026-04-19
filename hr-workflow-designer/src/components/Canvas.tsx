import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  MiniMap,
  Panel,
  SelectionMode,
  useReactFlow,
  type Connection,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowStore } from '../store/workflowStore';
import { autoLayout } from '../utils/autoLayout';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';
import { MousePointer2, Hand, Trash2, Tag } from 'lucide-react';
import type { NodeChange } from '@xyflow/react';

// Custom nodes
import { StartNode } from '../nodes/StartNode';
import { TaskNode } from '../nodes/TaskNode';
import { ApprovalNode } from '../nodes/ApprovalNode';
import { AutomatedNode } from '../nodes/AutomatedNode';
import { EndNode } from '../nodes/EndNode';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const CanvasInner = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { fitView, setNodes } = useReactFlow();
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes: storeSetNodes,
    setEdges,
    setSelectedNodeId,
  } = useWorkflowStore();

  // Intercept node changes to track selected
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // After applying changes, recalculate selected
      const selectedAfter = nodes
        .map(n => {
          const change = changes.find(c => c.type === 'select' && c.id === n.id);
          if (change && change.type === 'select') return { ...n, selected: change.selected };
          return n;
        })
        .filter(n => n.selected);
      setSelectedNodes(selectedAfter);
    },
    [nodes, onNodesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = wrapperRef.current?.getBoundingClientRect();
      
      const position = reactFlowBounds ? {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      } : { x: 0, y: 0 };

      const newNode = {
        id: uuidv4(),
        type: type as any,
        position,
        data: { title: `New ${type} node` } as any,
      } as WorkflowNode;

      addNode(newNode);
    },
    [addNode]
  );

  const isValidConnection = useCallback(
    (connection: WorkflowEdge | Connection) => {
      // Prevent self connections
      if (connection.source === connection.target) return false;
      
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return false;
      
      // Validation rules
      if (targetNode.type === 'start') return false; // Start cannot be a target
      if (sourceNode.type === 'end') return false; // End cannot be a source
      
      return true;
    },
    [nodes]
  );

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes = autoLayout(nodes, edges);
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
  }, [nodes, edges, setNodes, fitView]);

  // Delete all currently selected nodes (and their connected edges)
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    storeSetNodes(nodes.filter(n => !selectedIds.has(n.id)) as WorkflowNode[]);
    setEdges(edges.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
    setSelectedNodes([]);
  }, [selectedNodes, nodes, edges, storeSetNodes, setEdges]);

  // Tag selected nodes with a shared group color via data label
  const handleGroupSelected = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const groupLabel = prompt('Enter a group name for these nodes:', 'Group 1');
    if (!groupLabel) return;
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    const groupColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    storeSetNodes(
      nodes.map(n =>
        selectedIds.has(n.id)
          ? { ...n, data: { ...n.data, groupLabel, groupColor } } as WorkflowNode
          : n
      )
    );
  }, [selectedNodes, nodes, storeSetNodes]);

  return (
    <div className="canvas-wrapper" ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => console.log('Flow loaded:', instance)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => { setSelectedNodeId(null); setSelectedNodes([]); }}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        selectionOnDrag={isSelectMode}
        selectionMode={SelectionMode.Partial}
        panOnDrag={!isSelectMode}
        multiSelectionKeyCode="Shift"
        deleteKeyCode="Delete"
        fitView
      >
        <Background gap={16} size={1} color="#333" />
        <Controls position="top-right" />
        
        {/* Top-center toolbar */}
        <Panel position="top-center" className="canvas-tools-panel">
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-panel)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', alignItems: 'center' }}>
            {/* Mode toggle */}
            <button
              title={isSelectMode ? 'Switch to Pan mode' : 'Switch to Select mode'}
              onClick={() => setIsSelectMode(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px', border: '1px solid',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: isSelectMode ? 'var(--accent-color)' : 'transparent',
                color: isSelectMode ? '#fff' : 'var(--text-main)',
                borderColor: isSelectMode ? 'var(--accent-color)' : 'var(--border-color)',
                transition: 'all 0.2s',
              }}
            >
              {isSelectMode ? <MousePointer2 size={14} /> : <Hand size={14} />}
              {isSelectMode ? 'Select' : 'Pan'}
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

            <button className="del-btn" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)', background: 'transparent' }} onClick={handleAutoLayout}>Auto Arrange</button>
            <button className="del-btn" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)', background: 'transparent' }} onClick={() => fitView({ duration: 800 })}>Zoom Fit</button>
            <button className="del-btn" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)', background: 'transparent' }} onClick={() => setShowMiniMap(!showMiniMap)}>
              {showMiniMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </Panel>

        {/* Selection actions floating bubble */}
        {selectedNodes.length > 1 && (
          <Panel position="bottom-center">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg-panel)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)', borderRadius: '12px',
              padding: '8px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' }}>
                {selectedNodes.length} nodes selected
              </span>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
              <button
                onClick={handleGroupSelected}
                title="Tag into group"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '6px',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid var(--accent-color)',
                  color: 'var(--accent-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                }}
              >
                <Tag size={14} /> Group
              </button>
              <button
                onClick={handleDeleteSelected}
                title="Delete selected nodes"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '6px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#fca5a5', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </Panel>
        )}

        {showMiniMap && (
          <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'start') return 'var(--node-start)';
            if (n.type === 'task') return 'var(--node-task)';
            if (n.type === 'approval') return 'var(--node-approval)';
            if (n.type === 'automated') return 'var(--node-automated)';
            if (n.type === 'end') return 'var(--node-end)';
            return '#eee';
          }}
          nodeStrokeWidth={3}
          style={{ 
            backgroundColor: 'var(--bg-panel)', 
            border: '1px solid var(--border-color)',
            borderRadius: '8px'
          }}
          maskColor="rgba(0,0,0, 0.2)"
        />
        )}
      </ReactFlow>
    </div>
  );
};

export const Canvas: React.FC = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
);
