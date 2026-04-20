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
import { v4 as uuidv4 } from 'uuid';

// ─── Workflow Meta ──────────────────────────────────────────────────────────
export interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─── Full State Interface ───────────────────────────────────────────────────
interface WorkflowState {
  // Canvas state (current active workflow)
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  nodeStatus: Record<string, 'idle' | 'running' | 'completed'>;

  // Multi-workflow management
  workflows: WorkflowMeta[];
  workflowDataMap: Record<string, WorkflowData>;
  currentWorkflowId: string | null;

  // React Flow handlers
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Canvas setters
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  setSelectedNodeId: (id: string | null) => void;
  setNodeStatus: (id: string, status: 'idle' | 'running' | 'completed') => void;
  resetAllStatuses: () => void;
  loadTemplate: (template: WorkflowTemplate) => void;

  // Workflow management
  createWorkflow: (name: string, description?: string) => string;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => string;
  loadWorkflow: (id: string) => void;
  saveCurrentWorkflow: () => void;
  updateWorkflowMeta: (id: string, patch: Partial<Pick<WorkflowMeta, 'name' | 'description'>>) => void;
}

// ─── Helper ─────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();

// ─── Store ──────────────────────────────────────────────────────────────────
export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      // ── Canvas defaults ──
      nodes: [],
      edges: [],
      selectedNodeId: null,
      nodeStatus: {},

      // ── Multi-workflow defaults ──
      workflows: [],
      workflowDataMap: {},
      currentWorkflowId: null,

      // ── React Flow Handlers ──
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },

      // ── Canvas setters ──
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) => set({ nodes: [...get().nodes, node] }),

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        });
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      setNodeStatus: (id, status) => {
        set({ nodeStatus: { ...get().nodeStatus, [id]: status } });
      },

      resetAllStatuses: () => set({ nodeStatus: {} }),

      loadTemplate: (template) => {
        set({
          nodes: template.nodes,
          edges: template.edges,
          selectedNodeId: null,
          nodeStatus: {},
        });
      },

      // ── Workflow Management ──

      /**
       * Creates a new blank workflow entry and sets it as current.
       * Returns the new workflow ID.
       */
      createWorkflow: (name, description = '') => {
        const id = uuidv4();
        const meta: WorkflowMeta = {
          id,
          name,
          description,
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({
          workflows: [meta, ...state.workflows],
          workflowDataMap: { ...state.workflowDataMap, [id]: { nodes: [], edges: [] } },
          currentWorkflowId: id,
          nodes: [],
          edges: [],
          selectedNodeId: null,
          nodeStatus: {},
        }));
        return id;
      },

      /**
       * Deletes a workflow by ID. If it is the current workflow,
       * the canvas is cleared and currentWorkflowId is set to null.
       */
      deleteWorkflow: (id) => {
        const { currentWorkflowId, workflowDataMap, workflows } = get();
        const newMap = { ...workflowDataMap };
        delete newMap[id];
        const newList = workflows.filter((w) => w.id !== id);
        const isActive = currentWorkflowId === id;
        set({
          workflows: newList,
          workflowDataMap: newMap,
          ...(isActive
            ? { currentWorkflowId: null, nodes: [], edges: [], selectedNodeId: null, nodeStatus: {} }
            : {}),
        });
      },

      /**
       * Duplicates a workflow (deep clone of nodes + edges with new IDs).
       * Returns the new cloned workflow ID.
       */
      duplicateWorkflow: (id) => {
        const { workflows, workflowDataMap } = get();
        const original = workflows.find((w) => w.id === id);
        const originalData = workflowDataMap[id];
        if (!original || !originalData) return '';

        const newId = uuidv4();
        const meta: WorkflowMeta = {
          id: newId,
          name: `${original.name} (Copy)`,
          description: original.description,
          createdAt: now(),
          updatedAt: now(),
        };

        // Remap node IDs so they are unique
        const idMap: Record<string, string> = {};
        const clonedNodes: WorkflowNode[] = originalData.nodes.map((n) => {
          const newNodeId = uuidv4();
          idMap[n.id] = newNodeId;
          return { ...n, id: newNodeId };
        });
        const clonedEdges: WorkflowEdge[] = originalData.edges.map((e) => ({
          ...e,
          id: uuidv4(),
          source: idMap[e.source] ?? e.source,
          target: idMap[e.target] ?? e.target,
        }));

        set((state) => ({
          workflows: [meta, ...state.workflows],
          workflowDataMap: {
            ...state.workflowDataMap,
            [newId]: { nodes: clonedNodes, edges: clonedEdges },
          },
        }));
        return newId;
      },

      /**
       * Loads a workflow's nodes/edges onto the canvas
       * and marks it as the current workflow.
       * Auto-saves the previously active workflow first.
       */
      loadWorkflow: (id) => {
        const { currentWorkflowId, nodes, edges, workflowDataMap, workflows } = get();

        // Auto-save previous workflow before switching
        if (currentWorkflowId && currentWorkflowId !== id) {
          const updatedMeta = workflows.map((w) =>
            w.id === currentWorkflowId ? { ...w, updatedAt: now() } : w
          );
          set({
            workflowDataMap: { ...workflowDataMap, [currentWorkflowId]: { nodes, edges } },
            workflows: updatedMeta,
          });
        }

        const data = workflowDataMap[id] ?? { nodes: [], edges: [] };
        set({
          currentWorkflowId: id,
          nodes: data.nodes,
          edges: data.edges,
          selectedNodeId: null,
          nodeStatus: {},
        });
      },

      /**
       * Saves the current canvas state back into the workflowDataMap.
       */
      saveCurrentWorkflow: () => {
        const { currentWorkflowId, nodes, edges, workflowDataMap, workflows } = get();
        if (!currentWorkflowId) return;
        const updatedMeta = workflows.map((w) =>
          w.id === currentWorkflowId ? { ...w, updatedAt: now() } : w
        );
        set({
          workflowDataMap: { ...workflowDataMap, [currentWorkflowId]: { nodes, edges } },
          workflows: updatedMeta,
        });
      },

      /** Patches name/description on a workflow. */
      updateWorkflowMeta: (id, patch) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...patch, updatedAt: now() } : w
          ),
        }));
      },
    }),
    {
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
