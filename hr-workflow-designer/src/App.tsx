import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { SimulationPanel } from './components/SimulationPanel';
import { TemplatePanel } from './components/TemplatePanel';
import { Sun, Moon, Download, Upload, Undo, Redo, Copy, LayoutTemplate } from 'lucide-react';
import { useWorkflowStore } from './store/workflowStore';

function App() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightMode]);

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
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "workflow_export.json");
    dlAnchorElem.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          if (window.confirm(`Preview: Import ${json.nodes.length} nodes and ${json.edges.length} connections? This will overwrite the current canvas.`)) {
            setNodes(json.nodes);
            setEdges(json.edges);
          }
        } else {
          alert("Invalid JSON format: missing nodes or edges.");
        }
      } catch (err) {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyJson = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      alert("JSON copied to clipboard!");
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>HR Workflow Designer</h1>
        <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="theme-toggle" onClick={() => useWorkflowStore.temporal.getState().undo()} aria-label="Undo">
            <Undo size={16} /> 
          </button>
          <button className="theme-toggle" onClick={() => useWorkflowStore.temporal.getState().redo()} aria-label="Redo">
            <Redo size={16} /> 
          </button>
          
          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

          <button
            className="theme-toggle"
            onClick={() => setShowTemplates(true)}
            aria-label="Templates"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutTemplate size={16} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Templates</span>
          </button>

          <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

          <button className="theme-toggle" onClick={() => fileInputRef.current?.click()} aria-label="Import JSON">
            <Upload size={16} /> <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '500' }}>Import</span>
          </button>
          <button className="theme-toggle" onClick={handleExport} aria-label="Export JSON">
            <Download size={16} /> <span style={{ marginLeft: '6px', fontSize: '14px', fontWeight: '500' }}>Export</span>
          </button>
          <button className="theme-toggle" onClick={handleCopyJson} aria-label="Copy JSON">
            <Copy size={16} /> 
          </button>
          <button 
            className="theme-toggle" 
            onClick={() => setIsLightMode(!isLightMode)}
            aria-label="Toggle theme"
          >
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
}

export default App;
