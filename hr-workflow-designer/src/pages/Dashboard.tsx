import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { WorkflowList } from '../components/dashboard/WorkflowList';
import { TemplateSection } from '../components/dashboard/TemplateSection';
import { QuickActions } from '../components/dashboard/QuickActions';
import { LayoutDashboard, GitFork, Sun, Moon } from 'lucide-react';

interface DashboardProps {
  isLightMode: boolean;
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isLightMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { workflows, currentWorkflowId, loadWorkflow } = useWorkflowStore();
  const templateRef = useRef<HTMLDivElement>(null);

  const scrollToTemplates = () => {
    templateRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Recent = top 5 workflows sorted by updatedAt desc
  const recentWorkflows = [...workflows]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const handleOpenRecent = (id: string) => {
    loadWorkflow(id);
    navigate('/editor');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard size={20} color="#6366f1" />
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6366f1', letterSpacing: '0.3px' }}>
            Workflow Dashboard
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Go to Editor */}
          {currentWorkflowId && (
            <button
              onClick={() => navigate('/editor')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <GitFork size={15} />
              Back to Editor
            </button>
          )}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', borderRadius: '8px', padding: '8px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            aria-label="Toggle theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* ── Scrollable Content ───────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>

          {/* Stats */}
          <section>
            <SectionLabel>Overview</SectionLabel>
            <StatsPanel />
          </section>

          {/* Quick Actions */}
          <section>
            <SectionLabel>Quick Actions</SectionLabel>
            <QuickActions onScrollToTemplates={scrollToTemplates} />
          </section>

          {/* Recent Workflows */}
          {recentWorkflows.length > 0 && (
            <section>
              <SectionLabel>Recent Workflows</SectionLabel>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {recentWorkflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => handleOpenRecent(wf.id)}
                    style={{
                      padding: '10px 18px', borderRadius: '10px',
                      background: wf.id === currentWorkflowId ? 'rgba(99,102,241,0.2)' : 'var(--bg-panel)',
                      border: `1px solid ${wf.id === currentWorkflowId ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`,
                      color: wf.id === currentWorkflowId ? '#a5b4fc' : 'var(--text-main)',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s',
                    }}
                  >
                    {wf.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* All Workflows */}
          <section>
            <SectionLabel>All Workflows</SectionLabel>
            <WorkflowList onShowCreate={scrollToTemplates} />
          </section>

          {/* Templates */}
          <section ref={templateRef}>
            <SectionLabel>Templates</SectionLabel>
            <TemplateSection />
          </section>

        </div>
      </div>
    </div>
  );
};

// ── Section Label helper ──────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      marginBottom: '12px',
    }}
  >
    {children}
  </div>
);
