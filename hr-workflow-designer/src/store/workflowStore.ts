import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  type Connection,
  type EdgeChange,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type { WorkflowNode, WorkflowEdge } from '../types/workflow';
import type { WorkflowTemplate } from '../templates/workflowTemplates';

// Define the state for the workflow builder
interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  nodeStatus: Record<string, 'idle' | 'running' | 'completed'>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, data: any) => void;
  setSelectedNodeId: (id: string | null) => void;
  setNodeStatus: (id: string, status: 'idle' | 'running' | 'completed') => void;
  resetAllStatuses: () => void;
  loadTemplate: (template: WorkflowTemplate) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      nodeStatus: {},

      // Called by React Flow when nodes change (e.g. dragging)
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
        });
      },

      // Called by React Flow when edges change
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      // Called when connecting two nodes
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },

      setNodes: (nodes: WorkflowNode[]) => set({ nodes }),
      setEdges: (edges: WorkflowEdge[]) => set({ edges }),
      
      addNode: (node: WorkflowNode) => {
        set({ nodes: [...get().nodes, node] });
      },

      updateNodeData: (id: string, data: any) => {
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        });
      },

      setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),

      setNodeStatus: (id, status) => {
        set({ nodeStatus: { ...get().nodeStatus, [id]: status } });
      },

      resetAllStatuses: () => {
        set({ nodeStatus: {} });
      },

      loadTemplate: (template: WorkflowTemplate) => {
        set({
          nodes: template.nodes,
          edges: template.edges,
          selectedNodeId: null,
          nodeStatus: {},
        });
      },
    }),
    {
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
