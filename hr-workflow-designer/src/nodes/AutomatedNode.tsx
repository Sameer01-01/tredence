import { Handle, Position } from '@xyflow/react';
import { Settings } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const AutomatedNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node automated-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-header">
        <Settings size={16} />
        <span>{data.title || 'Automated Action'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>Action:</small> <span>{data.action || 'None selected'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
    </div>
  );
};
