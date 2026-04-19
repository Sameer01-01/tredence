import { Handle, Position } from '@xyflow/react';
import { Merge } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const MergeNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node merge-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <Merge size={16} />
        <span>{data.title || 'Merge'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>Strategy:</small>
          <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>
            {data.strategy || 'all'}
          </span>
        </div>
        <small style={{ opacity: 0.7 }}>
          {data.strategy === 'any' ? 'Continue on first branch' : 'Wait for all branches'}
        </small>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
