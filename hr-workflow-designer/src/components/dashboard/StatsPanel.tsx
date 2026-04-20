import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { BarChart3, GitBranch, Layers } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { workflows, nodes, edges, currentWorkflowId } = useWorkflowStore();

  const stats = [
    {
      label: 'Total Workflows',
      value: workflows.length,
      icon: <Layers size={20} />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Nodes in Current',
      value: currentWorkflowId ? nodes.length : '—',
      icon: <BarChart3 size={20} />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Edges in Current',
      value: currentWorkflowId ? edges.length : '—',
      icon: <GitBranch size={20} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: '1 1 160px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: s.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: s.color,
              flexShrink: 0,
            }}
          >
            {s.icon}
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
