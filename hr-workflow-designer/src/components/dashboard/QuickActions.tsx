import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../store/workflowStore';
import { useToast } from '../../context/ToastContext';
import { FilePlus, Upload } from 'lucide-react';

interface QuickActionsProps {
  onScrollToTemplates: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onScrollToTemplates }) => {
  const { createWorkflow, setNodes, setEdges } = useWorkflowStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkflow(newName.trim());
    toast(`"${newName.trim()}" created!`, 'success');
    navigate('/editor');
    setNewName('');
    setCreating(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.nodes && json.edges) {
          const id = createWorkflow(file.name.replace('.json', ''));
          useWorkflowStore.setState((state) => ({
            workflowDataMap: { ...state.workflowDataMap, [id]: { nodes: json.nodes, edges: json.edges } },
            nodes: json.nodes,
            edges: json.edges,
          }));
          toast(`"${file.name}" imported!`, 'info');
          navigate('/editor');
        } else {
          toast('Invalid JSON: missing nodes or edges.', 'error');
        }
      } catch {
        toast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Create New */}
      {creating ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Workflow name…"
            style={{
              padding: '9px 14px', borderRadius: '8px',
              background: 'var(--bg-primary)', border: '1px solid #6366f1',
              color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none',
              fontFamily: 'Inter, sans-serif', width: '220px',
            }}
          />
          <button onClick={handleCreate} style={primaryBtnStyle}>Create</button>
          <button onClick={() => setCreating(false)} style={ghostBtnStyle}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setCreating(true)} style={primaryBtnStyle}>
          <FilePlus size={15} />
          Create New Workflow
        </button>
      )}

      {/* Import */}
      <label style={{ ...ghostBtnStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Upload size={15} />
        Import JSON
        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      </label>

      {/* Templates shortcut */}
      <button onClick={onScrollToTemplates} style={ghostBtnStyle}>
        Browse Templates ↓
      </button>
    </div>
  );
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '9px 18px', borderRadius: '8px',
  background: '#6366f1', border: 'none',
  color: '#fff', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  transition: 'background 0.2s',
};

const ghostBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '9px 16px', borderRadius: '8px',
  background: 'transparent', border: '1px solid var(--border-color)',
  color: 'var(--text-muted)', cursor: 'pointer',
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, color 0.2s',
};
