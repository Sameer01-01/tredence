import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore, type WorkflowMeta } from '../../store/workflowStore';
import { useToast } from '../../context/ToastContext';
import { FolderOpen, Copy, Trash2, Clock, FileText } from 'lucide-react';

interface WorkflowListProps {
  onShowCreate?: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onShowCreate }) => {
  const { workflows, loadWorkflow, deleteWorkflow, duplicateWorkflow } = useWorkflowStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleOpen = (id: string) => {
    loadWorkflow(id);
    navigate('/editor');
  };

  const handleDuplicate = (id: string, name: string) => {
    duplicateWorkflow(id);
    toast(`"${name}" duplicated`, 'success');
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    const wf = workflows.find((w) => w.id === confirmDeleteId);
    deleteWorkflow(confirmDeleteId);
    toast(`"${wf?.name}" deleted`, 'error');
    setConfirmDeleteId(null);
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  if (workflows.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: 'var(--bg-panel)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <FileText size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No workflows yet.</p>
        <p style={{ fontSize: '0.85rem' }}>
          Create one below or{' '}
          <button
            onClick={onShowCreate}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            use a template
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {workflows.map((wf: WorkflowMeta) => (
          <div
            key={wf.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px 20px',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          >
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                {wf.name}
              </div>
              {wf.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {wf.description}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={11} />
                <span>Updated {formatDate(wf.updatedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                title="Open in Editor"
                onClick={() => handleOpen(wf.id)}
                style={actionBtnStyle('#6366f1', 'rgba(99,102,241,0.1)')}
              >
                <FolderOpen size={15} />
                <span>Open</span>
              </button>
              <button
                title="Duplicate"
                onClick={() => handleDuplicate(wf.id, wf.name)}
                style={actionBtnStyle('#10b981', 'rgba(16,185,129,0.1)')}
              >
                <Copy size={15} />
              </button>
              <button
                title="Delete"
                onClick={() => handleDelete(wf.id)}
                style={actionBtnStyle('#ef4444', 'rgba(239,68,68,0.1)')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Delete Workflow?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={secondaryBtnStyle}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={dangerBtnStyle}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Inline style helpers ──────────────────────────────────────────────────────
const actionBtnStyle = (color: string, bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '7px 12px',
  background: bg,
  border: `1px solid ${color}33`,
  borderRadius: '8px',
  color,
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 500,
  transition: 'background 0.2s',
  fontFamily: 'Inter, sans-serif',
});

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '14px',
  padding: '28px 32px',
  minWidth: '320px',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '9px 20px', borderRadius: '8px',
  background: 'transparent', border: '1px solid var(--border-color)',
  color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
};

const dangerBtnStyle: React.CSSProperties = {
  padding: '9px 20px', borderRadius: '8px',
  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
  color: '#fca5a5', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
};
