import type { WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ─────────────────────────────────────────────
// TEMPLATE 1 — Employee Onboarding
// ─────────────────────────────────────────────
const onboardingTemplate: WorkflowTemplate = {
  id: 'employee-onboarding',
  name: 'Employee Onboarding',
  description: 'Full onboarding flow: collect documents, get manager approval, then send welcome email automatically.',
  category: 'HR Operations',
  icon: '🧑‍💼',
  nodes: [
    { id: 'on-1', type: 'start',     position: { x: 300, y: 40  }, data: { title: 'New Hire Starts' } },
    { id: 'on-2', type: 'task',      position: { x: 300, y: 160 }, data: { title: 'Collect Documents', assignee: 'HR Coordinator', dueDate: '' } },
    { id: 'on-3', type: 'approval',  position: { x: 300, y: 300 }, data: { title: 'Manager Approval', approverRole: 'Hiring Manager', autoApproveThreshold: 3 } },
    { id: 'on-4', type: 'automated', position: { x: 300, y: 440 }, data: { title: 'Send Welcome Email', action: 'send_email' } },
    { id: 'on-5', type: 'task',      position: { x: 300, y: 580 }, data: { title: 'IT Setup', assignee: 'IT Support', dueDate: '' } },
    { id: 'on-6', type: 'end',       position: { x: 300, y: 720 }, data: { title: 'Onboarding Complete', endMessage: 'Employee successfully onboarded.' } },
  ] as WorkflowNode[],
  edges: [
    { id: 'on-e1', source: 'on-1', target: 'on-2' },
    { id: 'on-e2', source: 'on-2', target: 'on-3' },
    { id: 'on-e3', source: 'on-3', target: 'on-4' },
    { id: 'on-e4', source: 'on-4', target: 'on-5' },
    { id: 'on-e5', source: 'on-5', target: 'on-6' },
  ],
};

// ─────────────────────────────────────────────
// TEMPLATE 2 — Leave Approval
// ─────────────────────────────────────────────
const leaveApprovalTemplate: WorkflowTemplate = {
  id: 'leave-approval',
  name: 'Leave Approval',
  description: 'Employee applies for leave, a manager reviews it, HR is notified, and the request is closed.',
  category: 'Approvals',
  icon: '📅',
  nodes: [
    { id: 'lv-1', type: 'start',     position: { x: 300, y: 40  }, data: { title: 'Leave Requested' } },
    { id: 'lv-2', type: 'task',      position: { x: 300, y: 160 }, data: { title: 'Fill Leave Form', assignee: 'Employee', dueDate: '' } },
    { id: 'lv-3', type: 'approval',  position: { x: 300, y: 300 }, data: { title: 'Manager Review', approverRole: 'Direct Manager', autoApproveThreshold: 2 } },
    { id: 'lv-4', type: 'automated', position: { x: 300, y: 440 }, data: { title: 'Update HR System', action: 'update_db' } },
    { id: 'lv-5', type: 'automated', position: { x: 300, y: 560 }, data: { title: 'Notify Employee', action: 'send_email' } },
    { id: 'lv-6', type: 'end',       position: { x: 300, y: 700 }, data: { title: 'Leave Approved', endMessage: 'Leave request processed successfully.' } },
  ] as WorkflowNode[],
  edges: [
    { id: 'lv-e1', source: 'lv-1', target: 'lv-2' },
    { id: 'lv-e2', source: 'lv-2', target: 'lv-3' },
    { id: 'lv-e3', source: 'lv-3', target: 'lv-4' },
    { id: 'lv-e4', source: 'lv-4', target: 'lv-5' },
    { id: 'lv-e5', source: 'lv-5', target: 'lv-6' },
  ],
};

// ─────────────────────────────────────────────
// TEMPLATE 3 — Document Verification (Condition branch)
// ─────────────────────────────────────────────
const documentVerificationTemplate: WorkflowTemplate = {
  id: 'document-verification',
  name: 'Document Verification',
  description: 'Checks if submitted documents pass a score threshold. Routes to re-submission or final approval.',
  category: 'Compliance',
  icon: '📋',
  nodes: [
    { id: 'dv-1', type: 'start',     position: { x: 280, y: 40  }, data: { title: 'Documents Submitted' } },
    { id: 'dv-2', type: 'task',      position: { x: 280, y: 160 }, data: { title: 'Initial Review', assignee: 'Compliance Officer', dueDate: '' } },
    { id: 'dv-3', type: 'condition', position: { x: 280, y: 300 }, data: { title: 'Docs Valid?', field: 'score', operator: '>', value: '70' } },
    { id: 'dv-4', type: 'automated', position: { x: 100, y: 460 }, data: { title: 'Request Re-submission', action: 'send_email' } },
    { id: 'dv-5', type: 'task',      position: { x: 100, y: 600 }, data: { title: 'Re-submit Documents', assignee: 'Employee', dueDate: '' } },
    { id: 'dv-6', type: 'approval',  position: { x: 480, y: 460 }, data: { title: 'Final Approval', approverRole: 'HR Director', autoApproveThreshold: 5 } },
    { id: 'dv-7', type: 'end',       position: { x: 480, y: 620 }, data: { title: 'Verification Complete', endMessage: 'Documents verified and approved.' } },
  ] as WorkflowNode[],
  edges: [
    { id: 'dv-e1', source: 'dv-1', target: 'dv-2' },
    { id: 'dv-e2', source: 'dv-2', target: 'dv-3' },
    { id: 'dv-e3', source: 'dv-3', target: 'dv-4', sourceHandle: 'false', label: 'false' },
    { id: 'dv-e4', source: 'dv-3', target: 'dv-6', sourceHandle: 'true',  label: 'true'  },
    { id: 'dv-e5', source: 'dv-4', target: 'dv-5' },
    { id: 'dv-e6', source: 'dv-5', target: 'dv-3' },
    { id: 'dv-e7', source: 'dv-6', target: 'dv-7' },
  ],
};

// ─────────────────────────────────────────────
// TEMPLATE 4 — Parallel HR Process (fan-out)
// ─────────────────────────────────────────────
const parallelHRTemplate: WorkflowTemplate = {
  id: 'parallel-hr-process',
  name: 'Parallel HR Process',
  description: 'Background check and document verification run simultaneously, then merge before final approval.',
  category: 'HR Operations',
  icon: '⇉',
  nodes: [
    { id: 'ph-1', type: 'start',    position: { x: 300, y: 40  }, data: { title: 'Candidate Accepted' } },
    { id: 'ph-2', type: 'parallel', position: { x: 300, y: 160 }, data: { title: 'Start Parallel Checks', label: 'Background & Documents' } },
    { id: 'ph-3', type: 'task',     position: { x: 120, y: 320 }, data: { title: 'Background Check', assignee: 'HR Analyst', dueDate: '' } },
    { id: 'ph-4', type: 'task',     position: { x: 480, y: 320 }, data: { title: 'Document Verification', assignee: 'Compliance Officer', dueDate: '' } },
    { id: 'ph-5', type: 'merge',    position: { x: 300, y: 500 }, data: { title: 'Sync Results', strategy: 'all' } },
    { id: 'ph-6', type: 'approval', position: { x: 300, y: 640 }, data: { title: 'Final HR Approval', approverRole: 'HR Director', autoApproveThreshold: 7 } },
    { id: 'ph-7', type: 'end',      position: { x: 300, y: 780 }, data: { title: 'Process Complete', endMessage: 'All checks passed. Candidate cleared.' } },
  ] as WorkflowNode[],
  edges: [
    { id: 'ph-e1', source: 'ph-1', target: 'ph-2' },
    { id: 'ph-e2', source: 'ph-2', target: 'ph-3' },
    { id: 'ph-e3', source: 'ph-2', target: 'ph-4' },
    { id: 'ph-e4', source: 'ph-3', target: 'ph-5' },
    { id: 'ph-e5', source: 'ph-4', target: 'ph-5' },
    { id: 'ph-e6', source: 'ph-5', target: 'ph-6' },
    { id: 'ph-e7', source: 'ph-6', target: 'ph-7' },
  ],
};

// ─────────────────────────────────────────────
// TEMPLATE 5 — Performance Review
// ─────────────────────────────────────────────
const performanceReviewTemplate: WorkflowTemplate = {
  id: 'performance-review',
  name: 'Performance Review',
  description: 'Annual review cycle: self-assessment, manager scoring, conditional outcome routing, and HR archival.',
  category: 'Reviews',
  icon: '📊',
  nodes: [
    { id: 'pr-1', type: 'start',     position: { x: 300, y: 40  }, data: { title: 'Review Cycle Begins' } },
    { id: 'pr-2', type: 'task',      position: { x: 300, y: 160 }, data: { title: 'Self Assessment', assignee: 'Employee', dueDate: '' } },
    { id: 'pr-3', type: 'task',      position: { x: 300, y: 300 }, data: { title: 'Manager Scoring', assignee: 'Direct Manager', dueDate: '' } },
    { id: 'pr-4', type: 'delay',     position: { x: 300, y: 440 }, data: { title: 'Calibration Period', delayMs: 3000 } },
    { id: 'pr-5', type: 'condition', position: { x: 300, y: 580 }, data: { title: 'Rating >= 4?', field: 'rating', operator: '>=', value: '4' } },
    { id: 'pr-6', type: 'automated', position: { x: 100, y: 740 }, data: { title: 'Flag for PIP', action: 'notify_slack' } },
    { id: 'pr-7', type: 'automated', position: { x: 480, y: 740 }, data: { title: 'Send Commendation', action: 'send_email' } },
    { id: 'pr-8', type: 'automated', position: { x: 300, y: 880 }, data: { title: 'Archive to HR System', action: 'update_db' } },
    { id: 'pr-9', type: 'end',       position: { x: 300, y: 1020 }, data: { title: 'Review Closed', endMessage: 'Performance review cycle completed.' } },
  ] as WorkflowNode[],
  edges: [
    { id: 'pr-e1', source: 'pr-1', target: 'pr-2' },
    { id: 'pr-e2', source: 'pr-2', target: 'pr-3' },
    { id: 'pr-e3', source: 'pr-3', target: 'pr-4' },
    { id: 'pr-e4', source: 'pr-4', target: 'pr-5' },
    { id: 'pr-e5', source: 'pr-5', target: 'pr-6', sourceHandle: 'false', label: 'false' },
    { id: 'pr-e6', source: 'pr-5', target: 'pr-7', sourceHandle: 'true',  label: 'true'  },
    { id: 'pr-e7', source: 'pr-6', target: 'pr-8' },
    { id: 'pr-e8', source: 'pr-7', target: 'pr-8' },
    { id: 'pr-e9', source: 'pr-8', target: 'pr-9' },
  ],
};

export const workflowTemplates: WorkflowTemplate[] = [
  onboardingTemplate,
  leaveApprovalTemplate,
  documentVerificationTemplate,
  parallelHRTemplate,
  performanceReviewTemplate,
];
