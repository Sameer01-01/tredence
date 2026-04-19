import { Handle, Position } from '@xyflow/react';
import { SquareSquare } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const EndNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node end-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-header">
        <SquareSquare size={16} />
        <span>{data.title || 'End Node'}</span>
      </div>
      <div className="node-content">
        <small>{data.endMessage || 'Terminates workflow'}</small>
      </div>
    </div>
  );
};
