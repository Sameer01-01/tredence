import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { getAutomations, type Automation } from '../api/workflowApi';

export const NodeConfigPanel: React.FC = () => {
  const { nodes, selectedNodeId, updateNodeData, setNodes } = useWorkflowStore();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getAutomations().then(setAutomations);
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="config-panel empty-panel">
        <p>Select a node to configure</p>
      </aside>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let errorMsg = '';

    if (name === 'title' && value.trim() === '') {
      errorMsg = 'Title is required';
    }
    if (name === 'autoApproveThreshold') {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        errorMsg = 'Must be a positive number';
        setErrors({ ...errors, [name]: errorMsg });
        return;
      }
    }
    if (name === 'delayMs') {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        errorMsg = 'Delay must be greater than 0';
        setErrors({ ...errors, [name]: errorMsg });
        return;
      }
    }
    if ((name === 'field' || name === 'value') && value.trim() === '') {
      errorMsg = `${name} cannot be empty`;
    }

    setErrors({ ...errors, [name]: errorMsg });
    const numericFields = ['autoApproveThreshold', 'delayMs'];
    updateNodeData(selectedNode.id, {
      [name]: numericFields.includes(name) ? Number(value) : value
    });
  };

  const handleDelete = () => {
    setNodes(nodes.filter(n => n.id !== selectedNode.id));
  };

  return (
    <aside className="config-panel">
      <div className="config-header">
        <h3>Configure Node</h3>
        <button className="del-btn" onClick={handleDelete}>Delete Node</button>
      </div>

      <div className="config-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={String(selectedNode.data?.title || '')}
            onChange={handleChange}
            placeholder="Node Title"
            className={errors.title ? 'invalid-input' : ''}
          />
          {errors.title && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.title}</span>}
        </div>

        {selectedNode.type === 'start' && (
          <div className="form-group">
            <label>Metadata Key-Value Pairs</label>
            <input
              type="text"
              name="metadata"
              value={String(selectedNode.data?.metadata || '')}
              onChange={handleChange}
              placeholder="e.g. source: web"
            />
          </div>
        )}

        {selectedNode.type === 'task' && (
          <>
            <div className="form-group">
              <label>Assignee</label>
              <input
                type="text"
                name="assignee"
                value={String(selectedNode.data?.assignee || '')}
                onChange={handleChange}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={String(selectedNode.data?.dueDate || '')}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {selectedNode.type === 'approval' && (
          <>
            <div className="form-group">
              <label>Approver Role</label>
              <input
                type="text"
                name="approverRole"
                value={String(selectedNode.data?.approverRole || '')}
                onChange={handleChange}
                placeholder="e.g. HR Manager"
              />
            </div>
            <div className="form-group">
              <label>Auto-Approve Threshold (Days)</label>
              <input
                type="number"
                name="autoApproveThreshold"
                value={String(selectedNode.data?.autoApproveThreshold || '')}
                onChange={handleChange}
                className={errors.autoApproveThreshold ? 'invalid-input' : ''}
              />
              {errors.autoApproveThreshold && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.autoApproveThreshold}</span>}
            </div>
          </>
        )}

        {selectedNode.type === 'automated' && (
          <div className="form-group">
            <label>Action</label>
            <select name="action" value={String(selectedNode.data?.action || '')} onChange={handleChange}>
              <option value="">Select Action</option>
              {automations.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedNode.type === 'end' && (
          <div className="form-group">
            <label>End Message</label>
            <input
              type="text"
              name="endMessage"
              value={String(selectedNode.data?.endMessage || '')}
              onChange={handleChange}
              placeholder="e.g. HR Onboarding Complete"
            />
          </div>
        )}

        {/* ---- CONDITION NODE ---- */}
        {selectedNode.type === 'condition' && (
          <>
            <div className="form-group">
              <label>Field</label>
              <input
                type="text"
                name="field"
                value={String(selectedNode.data?.field || '')}
                onChange={handleChange}
                placeholder="e.g. salary, level, score"
                className={errors.field ? 'invalid-input' : ''}
              />
              {errors.field && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.field}</span>}
            </div>
            <div className="form-group">
              <label>Operator</label>
              <select name="operator" value={String(selectedNode.data?.operator || '==')} onChange={handleChange}>
                <option value="==">== (equals)</option>
                <option value="!=">!= (not equals)</option>
                <option value=">">&gt; (greater than)</option>
                <option value="<">&lt; (less than)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="text"
                name="value"
                value={String(selectedNode.data?.value ?? '')}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className={errors.value ? 'invalid-input' : ''}
              />
              {errors.value && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.value}</span>}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              ⚠️ Connect two edges from this node — label one <strong>true</strong> and one <strong>false</strong>.
            </p>
          </>
        )}

        {/* ---- DELAY NODE ---- */}
        {selectedNode.type === 'delay' && (
          <div className="form-group">
            <label>Delay Duration (ms)</label>
            <input
              type="number"
              name="delayMs"
              value={String(selectedNode.data?.delayMs || '')}
              onChange={handleChange}
              placeholder="e.g. 2000"
              className={errors.delayMs ? 'invalid-input' : ''}
            />
            {errors.delayMs && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errors.delayMs}</span>}
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              {selectedNode.data?.delayMs ? `= ${Number(selectedNode.data.delayMs) / 1000}s wait` : ''}
            </small>
          </div>
        )}

        {/* ---- PARALLEL NODE ---- */}
        {selectedNode.type === 'parallel' && (
          <div className="form-group">
            <label>Label (optional)</label>
            <input
              type="text"
              name="label"
              value={String(selectedNode.data?.label || '')}
              onChange={handleChange}
              placeholder="e.g. Notify & Archive"
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Connect multiple outgoing edges — all branches run simultaneously.
            </small>
          </div>
        )}

        {/* ---- MERGE NODE ---- */}
        {selectedNode.type === 'merge' && (
          <div className="form-group">
            <label>Merge Strategy</label>
            <select name="strategy" value={String(selectedNode.data?.strategy || 'all')} onChange={handleChange}>
              <option value="all">all — wait for every branch</option>
              <option value="any">any — continue on first branch</option>
            </select>
          </div>
        )}

      </div>
    </aside>
  );
};
