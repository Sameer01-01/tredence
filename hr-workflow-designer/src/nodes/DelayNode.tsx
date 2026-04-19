import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const DelayNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  const ms = data.delayMs ?? 0;
  const display = ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`;
  return (
    <div className={`custom-node delay-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <Clock size={16} />
        <span>{data.title || 'Delay'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>Wait:</small>
          <span style={{ fontWeight: 600, color: 'var(--node-delay)' }}>{ms ? display : '—'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
