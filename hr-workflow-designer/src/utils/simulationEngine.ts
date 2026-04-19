import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export type SimulationStep = {
  log: string;
  activeNodeId?: string;
  nextNodeIds?: string[];
  status?: 'running' | 'completed';
};

// Helper: evaluate a condition node's expression against mock context
function evaluateCondition(node: WorkflowNode): boolean {
  const { field, operator, value } = node.data as any;
  // Mock context values for demonstration
  const mockContext: Record<string, number | string> = {
    salary: 6000, level: 3, score: 85, department: 'HR',
    experience: 4, age: 30, rating: 4.5,
  };
  const actual = mockContext[field] ?? 0;
  const expected = isNaN(Number(value)) ? String(value) : Number(value);
  switch (operator) {
    case '>':  return Number(actual) > Number(expected);
    case '<':  return Number(actual) < Number(expected);
    case '==': return String(actual) === String(expected);
    case '!=': return String(actual) !== String(expected);
    default:   return false;
  }
}

export async function* simulateWorkflowAdvanced(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): AsyncGenerator<SimulationStep> {

  const startNode = nodes.find(n => n.type === 'start');
  if (!startNode) return;

  // Build adjacency list (source → targets), keeping edge data for labels
  const adj = new Map<string, WorkflowEdge[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (adj.has(e.source)) adj.get(e.source)!.push(e);
  });

  // Track how many incoming edges each merge node has received
  const mergeIncoming = new Map<string, number>();
  nodes.filter(n => n.type === 'merge').forEach(n => {
    mergeIncoming.set(n.id, 0);
  });

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  visited.add(startNode.id);

  yield { log: '▶ Advanced execution engine started...' };

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const node = nodes.find(n => n.id === currentId);
    if (!node) continue;

    const outEdges = adj.get(currentId) || [];
    const neighborIds = outEdges.map(e => e.target);

    // Mark node as running
    yield {
      log: `⚙ [${node.type!.toUpperCase()}] → ${node.data.title || 'Untitled'}`,
      activeNodeId: currentId,
      status: 'running',
      nextNodeIds: neighborIds,
    };

    await new Promise(r => setTimeout(r, 700));

    let actionLog = '';

    switch (node.type) {
      case 'start':
        actionLog = `  → Workflow context initialized.`;
        break;

      case 'task':
        actionLog = `  → Task assigned to "${node.data.assignee || 'Unassigned'}" (Due: ${node.data.dueDate || 'N/A'})`;
        break;

      case 'approval':
        actionLog = `  → Sent for approval to "${node.data.approverRole || 'Manager'}" (threshold: ${node.data.autoApproveThreshold ?? 0} days)`;
        break;

      case 'automated':
        actionLog = `  → Automation triggered: [${node.data.action || 'none'}]`;
        break;

      case 'end':
        actionLog = `  → ✅ Branch ended. "${node.data.endMessage || ''}"`;
        break;

      // ---- CONDITION: route to true or false edge ----
      case 'condition': {
        const result = evaluateCondition(node);
        const branch = result ? 'true' : 'false';
        const targetEdge = outEdges.find(e => (e.label as string)?.toLowerCase() === branch || e.sourceHandle === branch);
        actionLog = `  → Condition evaluated: [${node.data.field} ${node.data.operator} ${node.data.value}] = ${result ? '✅ TRUE' : '❌ FALSE'} → routing to "${branch}" branch`;

        yield { log: actionLog, activeNodeId: currentId, status: 'completed' };
        await new Promise(r => setTimeout(r, 400));

        if (targetEdge && !visited.has(targetEdge.target)) {
          visited.add(targetEdge.target);
          queue.push(targetEdge.target);
        } else if (!targetEdge) {
          // Fallback: if no labelled edge, take first outgoing
          const fallback = outEdges[result ? 0 : 1] ?? outEdges[0];
          if (fallback && !visited.has(fallback.target)) {
            visited.add(fallback.target);
            queue.push(fallback.target);
          }
        }
        continue; // Skip normal neighbor queuing below
      }

      // ---- DELAY: wait for delayMs ----
      case 'delay': {
        const ms = (node.data.delayMs as number) || 1000;
        actionLog = `  → ⏱ Waiting ${ms}ms (${ms / 1000}s)...`;
        yield { log: actionLog, activeNodeId: currentId, status: 'running' };
        await new Promise(r => setTimeout(r, Math.min(ms, 3000))); // cap at 3s for UX
        actionLog = `  → ✔ Delay of ${ms}ms completed.`;
        break;
      }

      // ---- PARALLEL: push all neighbors simultaneously ----
      case 'parallel': {
        actionLog = `  → ⇉ Fanning out to ${outEdges.length} parallel branches simultaneously`;
        yield { log: actionLog, activeNodeId: currentId, status: 'completed' };
        await new Promise(r => setTimeout(r, 400));
        for (const edge of outEdges) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            queue.push(edge.target); // push all at once → BFS runs them in order
          }
        }
        continue;
      }

      // ---- MERGE: wait for all/any incoming ----
      case 'merge': {
        const strategy = (node.data.strategy as string) || 'all';
        const totalIncoming = edges.filter(e => e.target === currentId).length;
        const arrived = (mergeIncoming.get(currentId) || 0) + 1;
        mergeIncoming.set(currentId, arrived);

        if (strategy === 'all' && arrived < totalIncoming) {
          actionLog = `  → ⇊ Merge waiting (${arrived}/${totalIncoming} branches arrived)...`;
          yield { log: actionLog, activeNodeId: currentId, status: 'running' };
          // Requeue — will be picked up again when other branches arrive
          queue.push(currentId);
          await new Promise(r => setTimeout(r, 500));
          continue;
        } else {
          actionLog = `  → ✔ Merge satisfied (strategy: ${strategy}, ${arrived}/${totalIncoming} branches) — continuing.`;
        }
        break;
      }

      default:
        actionLog = `  → Step processed.`;
    }

    yield { log: actionLog, activeNodeId: currentId, status: 'completed' };
    await new Promise(r => setTimeout(r, 400));

    // Normal BFS: queue unvisited neighbors
    for (const edge of outEdges) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  yield { log: '🏁 Workflow execution complete.' };
}
