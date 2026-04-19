import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const ConditionNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node condition-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} />
      <div className="node-header">
        <GitBranch size={16} />
        <span>{data.title || 'Condition'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>If:</small>
          <span>{data.field || '—'} {data.operator || '=='} {data.value ?? '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--node-start)', fontWeight: 600 }}>✓ true</span>
          <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>✗ false</span>
        </div>
      </div>
      {/* Two output handles: true (left) and false (right) */}
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} />
    </div>
  );
};
