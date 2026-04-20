import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { NodeConfigPanel } from '../components/NodeConfigPanel';
import { SimulationPanel } from '../components/SimulationPanel';
import { TemplatePanel } from '../components/TemplatePanel';
import { Sun, Moon, Download, Upload, Undo, Redo, Copy, LayoutTemplate, LayoutDashboard, Save } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { useToast } from '../context/ToastContext';

interface EditorProps {
  isLightMode: boolean;
  toggleTheme: () => void;
}

export const Editor: React.FC<EditorProps> = ({ isLightMode, toggleTheme }) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    nodes, edges,
    setNodes, setEdges,
    saveCurrentWorkflow, currentWorkflowId, workflows,
  } = useWorkflowStore();

  const currentName = workflows.find((w) => w.id === currentWorkflowId)?.name;

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            useWorkflowStore.temporal.getState().redo();
          } else {
            useWorkflowStore.temporal.getState().undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          useWorkflowStore.temporal.getState().redo();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (useWorkflowStore.getState().currentWorkflowId) {
        useWorkflowStore.getState().saveCurrentWorkflow();
      }
    };
  }, []);

  const handleSave = () => {
    saveCurrentWorkflow();
    toast('Workflow saved!', 'success');
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ nodes, edges }));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${currentName ?? 'workflow'}_export.json`);
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          if (window.confirm(`Import ${json.nodes.length} nodes and ${json.edges.length} connections? This will overwrite the current canvas.`)) {
            setNodes(json.nodes);
            setEdges(json.edges);
            toast('Workflow imported!', 'info');
          }
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

  const handleCopyJson = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      toast('JSON copied to clipboard!', 'info');
    });
  };

  const handleDashboard = () => {
    saveCurrentWorkflow();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        {/* Left: Dashboard nav + workflow name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="theme-toggle"
            onClick={handleDashboard}
            aria-label="Dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
          >
            <LayoutDashboard size={16} />
            <span style={{ fontSize: '13px' }}>Dashboard</span>
          </button>
          <span style={{ color: 'var(--border-color)' }}>/</span>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.3px' }}>
            {currentName ?? 'HR Workflow Designer'}
          </h1>
        </div>

        {/* Right: Actions */}
        <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={() => useWorkflowStore.temporal.getState().undo()} aria-label="Undo">
            <Undo size={16} />
          </button>
          <button className="theme-toggle" onClick={() => useWorkflowStore.temporal.getState().redo()} aria-label="Redo">
            <Redo size={16} />
          </button>

          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 2px', height: '20px' }} />

          <button
            className="theme-toggle"
            onClick={() => setShowTemplates(true)}
            aria-label="Templates"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutTemplate size={16} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Templates</span>
          </button>

          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 2px', height: '20px' }} />

          <button className="theme-toggle" onClick={handleSave} aria-label="Save" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6ee7b7' }}>
            <Save size={16} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Save</span>
          </button>
          <button className="theme-toggle" onClick={() => fileInputRef.current?.click()} aria-label="Import JSON">
            <Upload size={16} />
            <span style={{ marginLeft: '5px', fontSize: '13px', fontWeight: 500 }}>Import</span>
          </button>
          <button className="theme-toggle" onClick={handleExport} aria-label="Export JSON">
            <Download size={16} />
            <span style={{ marginLeft: '5px', fontSize: '13px', fontWeight: 500 }}>Export</span>
          </button>
          <button className="theme-toggle" onClick={handleCopyJson} aria-label="Copy JSON">
            <Copy size={16} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      <div className="main-layout">
        <Sidebar />
        <main className="canvas-area">
          <Canvas />
          <SimulationPanel />
        </main>
        <NodeConfigPanel />
      </div>

      {showTemplates && <TemplatePanel onClose={() => setShowTemplates(false)} />}
    </div>
  );
};
