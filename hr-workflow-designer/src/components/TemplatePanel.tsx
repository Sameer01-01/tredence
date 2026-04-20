import React, { useState } from 'react';
import { X, Layers, ChevronRight, AlertTriangle } from 'lucide-react';
import { workflowTemplates, type WorkflowTemplate } from '../templates/workflowTemplates';
import { useWorkflowStore } from '../store/workflowStore';

interface TemplatePanelProps {
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'HR Operations': '#3b82f6',
  'Approvals':     '#10b981',
  'Compliance':    '#f97316',
  'Reviews':       '#a855f7',
};

export const TemplatePanel: React.FC<TemplatePanelProps> = ({ onClose }) => {
  const { loadTemplate, nodes } = useWorkflowStore();
  const [selected, setSelected] = useState<WorkflowTemplate | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);

  const canvasHasContent = nodes.length > 0;

  const handleUseTemplate = (template: WorkflowTemplate) => {
    if (canvasHasContent) {
      setSelected(template);
      setConfirmPending(true);
    } else {
      applyTemplate(template);
    }
  };

  const applyTemplate = (template: WorkflowTemplate) => {
    loadTemplate(template);
    onClose();
  };

  // Group templates by category
  const grouped = workflowTemplates.reduce<Record<string, WorkflowTemplate[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    // Backdrop overlay
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '780px',
        maxHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-panel)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(99,102,241,0.15)', borderRadius: '10px',
              padding: '8px', display: 'flex', alignItems: 'center',
            }}>
              <Layers size={20} color="var(--accent-color)" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Workflow Templates
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                {workflowTemplates.length} templates ready to use
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '6px', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Confirmation banner */}
        {confirmPending && selected && (
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            borderBottom: '1px solid rgba(251,191,36,0.3)',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          }}>
            <AlertTriangle size={18} color="#fbbf24" />
            <span style={{ fontSize: '13px', color: 'var(--text-main)', flex: 1 }}>
              Loading <strong>"{selected.name}"</strong> will replace your current canvas ({nodes.length} nodes).
            </span>
            <button
              onClick={() => setConfirmPending(false)}
              style={{
                background: 'transparent', border: '1px solid var(--border-color)',
                borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '13px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setConfirmPending(false); applyTemplate(selected); }}
              style={{
                background: 'var(--accent-color)', border: 'none',
                borderRadius: '6px', padding: '6px 16px', cursor: 'pointer',
                color: '#fff', fontSize: '13px', fontWeight: 600,
              }}
            >
              Replace &amp; Load
            </button>
          </div>
        )}

        {/* Template list */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).map(([category, templates]) => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: CATEGORY_COLORS[category] || 'var(--accent-color)',
                }} />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)' }}>
                  {category}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      background: 'var(--bg-panel)',
                      border: `1px solid ${selected?.id === template.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '28px', lineHeight: 1 }}>{template.icon}</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {template.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Node count summary */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Array.from(new Set(template.nodes.map(n => n.type))).map(type => (
                        <span key={type} style={{
                          fontSize: '10px', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '999px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          textTransform: 'capitalize',
                        }}>
                          {type}
                        </span>
                      ))}
                      <span style={{
                        fontSize: '10px', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '999px',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: 'var(--accent-color)',
                      }}>
                        {template.nodes.length} nodes · {template.edges.length} edges
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => handleUseTemplate(template)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                        background: 'var(--accent-color)', border: 'none',
                        color: '#fff', fontWeight: 600, fontSize: '13px',
                        transition: 'background 0.2s', marginTop: 'auto',
                      }}
                    >
                      Use Template <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
