import { Handle, Position } from '@xyflow/react';
import { UserCheck } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { GroupBadge } from './GroupBadge';

export const ApprovalNode = ({ id, data }: any) => {
  const status = useWorkflowStore(state => state.nodeStatus[id]);
  return (
    <div className={`custom-node approval-node ${status ? `status-${status}` : ''}`} style={{ position: 'relative' }}>
      <GroupBadge data={data} />
      <Handle type="target" position={Position.Top} className="handle-target" />
      <div className="node-header">
        <UserCheck size={16} />
        <span>{data.title || 'Approval Task'}</span>
      </div>
      <div className="node-content">
        <div className="node-row">
          <small>Role:</small> <span>{data.approverRole || 'Manager'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle-source" />
    </div>
  );
};
