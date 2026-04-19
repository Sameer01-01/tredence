import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export function detectCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const adjList = new Map<string, string[]>();
  nodes.forEach(n => adjList.set(n.id, []));
  edges.forEach(e => {
    if (adjList.has(e.source)) {
      adjList.get(e.source)!.push(e.target);
    }
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cycleNodes: string[] = [];
  
  function dfs(nodeId: string): boolean {
    if (recStack.has(nodeId)) {
      cycleNodes.push(nodeId);
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        cycleNodes.push(nodeId);
        return true;
      }
    }
    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        break; // Return early if one cycle is found
      }
    }
  }

  return cycleNodes;
}

export function findDisconnectedNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  if (nodes.length === 0) return [];
  
  // Build undirectional graph for connectivity
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  
  edges.forEach(e => {
    if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    if (adj.has(e.target)) adj.get(e.target)!.push(e.source); // undirected tracking
  });

  // BFS to find all connected visually from the first node
  const visited = new Set<string>();
  const queue = [nodes[0].id];
  visited.add(nodes[0].id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return nodes.filter(n => !visited.has(n.id)).map(n => n.data.title || n.id);
}

export function validateStartEndRules(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const errors: string[] = [];
  const startNodes = nodes.filter(n => n.type === 'start');
  const endNodes = nodes.filter(n => n.type === 'end');

  if (startNodes.length === 0) {
    errors.push('Workflow must have exactly one Start node.');
  } else if (startNodes.length > 1) {
    errors.push('Workflow cannot have multiple Start nodes.');
  } else {
    // Check if start node has incoming edges
    const startId = startNodes[0].id;
    if (edges.some(e => e.target === startId)) {
      errors.push('Start node cannot have incoming connections.');
    }
  }

  if (endNodes.length === 0) {
    errors.push('Workflow must have at least one End node.');
  } else {
    for (const endNode of endNodes) {
      if (edges.some(e => e.source === endNode.id)) {
        errors.push(`End node "${endNode.data.title}" cannot have outgoing connections.`);
      }
    }
  }

  return errors;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateNewNodeRules(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const errors: string[] = [];

  for (const node of nodes) {
    const outgoing = edges.filter(e => e.source === node.id);
    const incoming = edges.filter(e => e.target === node.id);

    if (node.type === 'condition') {
      if (outgoing.length !== 2) {
        errors.push(`Condition node "${node.data.title}" must have exactly 2 outgoing edges (true/false).`);
      }
    }
    if (node.type === 'parallel') {
      if (outgoing.length < 2) {
        errors.push(`Parallel node "${node.data.title}" must have at least 2 outgoing edges.`);
      }
    }
    if (node.type === 'merge') {
      if (incoming.length < 2) {
        errors.push(`Merge node "${node.data.title}" must have at least 2 incoming edges.`);
      }
    }
    if (node.type === 'delay') {
      const ms = node.data.delayMs as number | undefined;
      if (!ms || ms <= 0) {
        errors.push(`Delay node "${node.data.title}" must have a delay greater than 0ms.`);
      }
    }
  }

  return errors;
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const errors: string[] = [];

  const layoutErrors = validateStartEndRules(nodes, edges);
  errors.push(...layoutErrors);

  const structureErrors = validateNewNodeRules(nodes, edges);
  errors.push(...structureErrors);

  const cycle = detectCycle(nodes, edges);
  if (cycle.length > 0) {
    errors.push('Workflow contains a circular dependency (cycle) which is not allowed.');
  }

  const disconnected = findDisconnectedNodes(nodes, edges);
  if (disconnected.length > 0) {
    errors.push(`There are disconnected nodes: ${disconnected.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
