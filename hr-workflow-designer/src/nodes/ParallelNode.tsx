import { Handle, Position } from '@xyflow/react';
import { Split } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const ParallelNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node parallel-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <Split size={16} />
        <span>{data.title || 'Parallel Split'}</span>
      </div>
      <div className="node-content">
        <small>{data.label || 'Fan-out all branches simultaneously'}</small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
