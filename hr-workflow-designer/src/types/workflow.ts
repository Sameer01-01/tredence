import type { Node, Edge } from '@xyflow/react';

export interface BaseNodeData extends Record<string, unknown> {
  title: string;
  groupLabel?: string;
  groupColor?: string;
}

export interface StartNodeData extends BaseNodeData {
  metadata?: Record<string, string>;
}

export interface TaskNodeData extends BaseNodeData {
  assignee?: string;
  dueDate?: string;
}

export interface ApprovalNodeData extends BaseNodeData {
  approverRole?: string;
  autoApproveThreshold?: number;
}

export interface AutomatedNodeData extends BaseNodeData {
  action?: string;
}

export interface EndNodeData extends BaseNodeData {
  endMessage?: string;
}

// ----- New node types -----
export interface ConditionNodeData extends BaseNodeData {
  field?: string;
  operator?: '>' | '<' | '==' | '!=';
  value?: string | number;
}

export interface DelayNodeData extends BaseNodeData {
  delayMs?: number;
}

export interface ParallelNodeData extends BaseNodeData {
  label?: string;
}

export interface MergeNodeData extends BaseNodeData {
  strategy?: 'all' | 'any';
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData
  | ConditionNodeData
  | DelayNodeData
  | ParallelNodeData
  | MergeNodeData;

export type WorkflowNodeType =
  | 'start' | 'task' | 'approval' | 'automated' | 'end'
  | 'condition' | 'delay' | 'parallel' | 'merge';

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;
