import { Handle, Position } from '@xyflow/react';
import { ClipboardList } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const TaskNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node task-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-header">
        <ClipboardList size={16} />
        <span>{data.title || 'Manual Task'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>Assignee:</small> <span>{data.assignee || 'Unassigned'}</span>
        </div>
        <div className="node-row">
          <small>Due:</small> <span>{data.dueDate || '-'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
    </div>
  );
};
