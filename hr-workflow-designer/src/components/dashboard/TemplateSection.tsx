import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowTemplates } from '../../templates/workflowTemplates';
import { useWorkflowStore } from '../../store/workflowStore';
import { useToast } from '../../context/ToastContext';
import { Wand2 } from 'lucide-react';

const categoryColors: Record<string, { bg: string; color: string }> = {
  'HR Operations': { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
  'Approvals':     { bg: 'rgba(234,179,8,0.12)',   color: '#fde68a' },
  'Compliance':    { bg: 'rgba(16,185,129,0.12)',   color: '#6ee7b7' },
  'Reviews':       { bg: 'rgba(59,130,246,0.12)',   color: '#93c5fd' },
};

export const TemplateSection: React.FC = () => {
  const { createWorkflow, loadWorkflow, workflowDataMap } = useWorkflowStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUseTemplate = (templateId: string) => {
    const template = workflowTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Create a new workflow
    const newId = createWorkflow(template.name, template.description);

    // Inject template nodes/edges into the newly created slot in workflowDataMap
    // We do this via a small store patch after createWorkflow sets up the slot
    useWorkflowStore.setState((state) => ({
      workflowDataMap: {
        ...state.workflowDataMap,
        [newId]: { nodes: template.nodes, edges: template.edges },
      },
      // Also put them on the canvas right away since this is "currentWorkflowId"
      nodes: template.nodes,
      edges: template.edges,
    }));

    toast(`Template "${template.name}" loaded!`, 'success');
    navigate('/editor');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '14px',
      }}
    >
      {workflowTemplates.map((tpl) => {
        const palette = categoryColors[tpl.category] ?? { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' };
        return (
          <div
            key={tpl.id}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s, transform 0.15s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Emoji + Category badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.6rem' }}>{tpl.icon}</span>
              <span
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px',
                  padding: '3px 10px', borderRadius: '20px',
                  background: palette.bg, color: palette.color,
                  textTransform: 'uppercase',
                }}
              >
                {tpl.category}
              </span>
            </div>

            {/* Name + description */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                {tpl.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {tpl.description}
              </div>
            </div>

            {/* Metadata row */}
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{tpl.nodes.length} nodes</span>
              <span>·</span>
              <span>{tpl.edges.length} connections</span>
            </div>

            {/* CTA */}
            <button
              onClick={() => handleUseTemplate(tpl.id)}
              style={{
                marginTop: 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '8px',
                color: '#a5b4fc',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.28)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
            >
              <Wand2 size={13} />
              Use Template
            </button>
          </div>
        );
      })}
    </div>
  );
};
