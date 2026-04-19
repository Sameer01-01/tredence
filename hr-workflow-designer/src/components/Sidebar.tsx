import React from 'react';

const NODE_ITEMS = [
  { type: 'start',     label: 'Start Node',      icon: '▶', desc: 'Begin workflow' },
  { type: 'task',      label: 'Task Node',        icon: '✓', desc: 'Manual assignment' },
  { type: 'approval',  label: 'Approval Node',    icon: '👤', desc: 'Gate check' },
  { type: 'automated', label: 'Automated Node',   icon: '⚡', desc: 'Trigger action' },
  { type: 'end',       label: 'End Node',         icon: '⏹', desc: 'Finish workflow' },
  // --- new ---
  { type: 'condition', label: 'Condition Node',   icon: '⑂', desc: 'Branch on logic' },
  { type: 'delay',     label: 'Delay Node',       icon: '⏱', desc: 'Wait duration' },
  { type: 'parallel',  label: 'Parallel Split',   icon: '⇉', desc: 'Fan-out branches' },
  { type: 'merge',     label: 'Merge Node',       icon: '⇊', desc: 'Fan-in sync' },
];

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <h2>Nodes</h2>
      <div className="nodes-list">
        {NODE_ITEMS.map(({ type, label, icon, desc }) => (
          <div
            key={type}
            className={`dnd-node ${type}`}
            onDragStart={(e) => onDragStart(e, type)}
            draggable
            title={desc}
          >
            <span style={{ marginRight: '8px', fontSize: '14px' }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
};
