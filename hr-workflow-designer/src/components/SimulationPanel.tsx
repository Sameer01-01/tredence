import React, { useState, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { simulateWorkflowAdvanced, type SimulationStep } from '../utils/simulationEngine';
import { validateWorkflow } from '../utils/graphValidation';
import { PlayCircle, GripHorizontal, XSquare, Clock } from 'lucide-react';

export const SimulationPanel: React.FC = () => {
  const { nodes, edges, setEdges, setNodeStatus, resetAllStatuses } = useWorkflowStore();
  const [logs, setLogs] = useState<SimulationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragBounds = useRef({ minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity });

  const handleRun = async () => {
    setIsRunning(true);
    setLogs([]);
    
    resetAllStatuses();
    setEdges(edges.map(e => ({ ...e, animated: false, style: {} })));

    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      setLogs([{ log: 'Validation Failed. Cannot run simulation:', status: 'completed' }]);
      validation.errors.forEach(e => setLogs(p => [...p, { log: `! ${e}`, status: 'completed' }]));
      setIsRunning(false);
      return;
    }

    try {
      for await (const step of simulateWorkflowAdvanced(nodes, edges)) {
        setLogs(prev => [...prev, step]);
        
        if (step.activeNodeId && step.status) {
           setNodeStatus(step.activeNodeId, step.status);
           setEdges(useWorkflowStore.getState().edges.map(e => {
             if (e.source === step.activeNodeId) {
               return { ...e, animated: step.status === 'running', style: step.status === 'running' ? { stroke: '#3b82f6', strokeWidth: 3 } : {} };
             }
             return e;
           }));
        }
      }
    } catch (err) {
      setLogs(prev => [...prev, { log: 'Error executing simulation', status: 'completed' }]);
    } finally {
      setIsRunning(false);
      setEdges(useWorkflowStore.getState().edges.map(e => ({ ...e, animated: false, style: {} })));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.drag-handle')) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    const panel = e.currentTarget;
    const canvasArea = panel.parentElement;
    if (canvasArea) {
      const panelRect = panel.getBoundingClientRect();
      const canvasRect = canvasArea.getBoundingClientRect();
      
      const baseTop = panelRect.top - position.y;
      const baseLeft = panelRect.left - position.x;
      
      dragBounds.current = {
        minY: canvasRect.top - baseTop,
        maxY: canvasRect.bottom - baseTop - panelRect.height,
        minX: canvasRect.left - baseLeft,
        maxX: canvasRect.right - baseLeft - panelRect.width
      };
    } else {
      dragBounds.current = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    let nextX = e.clientX - dragStartPos.current.x;
    let nextY = e.clientY - dragStartPos.current.y;
    
    const { minX, maxX, minY, maxY } = dragBounds.current;
    
    if (nextY > maxY) nextY = maxY;
    if (nextY < minY) nextY = minY;
    
    if (nextX > maxX) nextX = maxX;
    if (nextX < minX) nextX = minX;

    setPosition({
      x: nextX,
      y: nextY
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const closeDetails = () => {
    setLogs([]);
    resetAllStatuses();
    setEdges(useWorkflowStore.getState().edges.map(e => ({ ...e, animated: false, style: {} })));
  };

  return (
    <div 
      className="simulation-panel"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`, 
        zIndex: isDragging ? 100 : 10,
        boxShadow: isDragging ? '0 20px 40px -10px rgba(0, 0, 0, 0.7)' : undefined
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="panel-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div 
          className="drag-handle" 
          style={{ 
             cursor: isDragging ? 'grabbing' : 'grab', 
             display: 'flex', 
             justifyContent: 'center', 
             opacity: 0.5, 
             padding: '4px',
             borderRadius: '4px'
          }}
          title="Drag to move"
        >
           <GripHorizontal size={20} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleRun} disabled={isRunning} className="run-btn" style={{ flex: 1 }}>
            <PlayCircle size={16} />
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
          {logs.length > 0 && (
            <button 
              onClick={closeDetails} 
              className="close-btn" 
              title="Close Logs"
              style={{ 
                padding: '8px 12px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                color: 'var(--text-main)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
               <XSquare size={20} color="#ef4444" />
            </button>
          )}
        </div>
      </div>
      <div className="logs-container">
        {logs.length === 0 ? (
          <p className="no-logs">Press "Run Workflow" to see execution timeline</p>
        ) : (
          logs.map((step, index) => (
            <div key={index} className={`log-entry ${step.log.startsWith('!') ? 'log-error' : ''}`} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Clock size={12} style={{ color: step.status === 'running' ? '#3b82f6' : 'var(--text-muted)' }} />
              <span>{step.log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
