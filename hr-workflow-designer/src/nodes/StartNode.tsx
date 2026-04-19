import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const StartNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node start-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <div className="node-header">
        <Play size={16} />
        <span>{data.title || 'Start Node'}</span>
      </div>
      <div className="node-content">
        <small>Initiates Workflow</small>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
    </div>
  );
};
