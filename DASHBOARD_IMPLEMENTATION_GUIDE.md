# Role-Based Dashboard Implementation Guide

## Overview
This document outlines the comprehensive implementation of role-based dashboards for the KAL Engineering Management System.

## ✅ Completed Components

### 1. Theme System
- **File**: `src/utils/roleTheme.ts`
- Role-specific theme colors (blue for admin, green for technical team, orange for project manager, purple for finance, gray for auditor)

### 2. Reusable Components
- **File**: `src/components/common/UpdateTimeline.tsx` - Vertical timeline for progress updates
- **File**: `src/components/common/MetricCard.tsx` - Reusable metric display cards

### 3. Technical Member Dashboard
- **File**: `src/pages/dashboards/TechnicalMemberDashboard.tsx`
- Displays only assigned tasks and projects
- Green-themed interface
- Quick actions for logging progress and expenses

## 🚧 Components To Be Implemented

### 1. Project Manager Dashboard
**File**: `src/pages/dashboards/ProjectManagerDashboard.tsx`

**Features**:
- View ONLY assigned projects
- Orange-themed interface
- Assign technical team members to projects
- Create tasks within assigned projects
- Monitor team progress
- View project timelines and updates
- Cannot mark projects as complete (only technical team can)

**Key Metrics**:
- Active Projects (assigned to them)
- Total Tasks (in their projects)
- Completed Tasks
- Budget for their projects

**Sections**:
- My Projects (with team member assignment)
- Team Tasks Overview
- Project Progress Timeline
- Quick Actions (Assign Team Members, Create Task, View Reports)

### 2. Finance Officer Dashboard
**File**: `src/pages/dashboards/FinanceOfficerDashboard.tsx`

**Features**:
- Purple-themed interface
- View all projects with financial data
- Review and approve/reject expense submissions
- Track budget utilization per project
- Generate financial reports

**Key Metrics**:
- Total Budget Allocated
- Total Spent
- Pending Approvals
- Budget Remaining
- Budget vs Spent by project

**Sections**:
- Financial Overview Charts
- Pending Expense Approvals
- Budget Utilization by Project
- Recent Financial Activity
- Expense Categories Breakdown

### 3. Auditor Dashboard
**File**: `src/pages/dashboards/AuditorDashboard.tsx`

**Features**:
- Gray-themed interface
- READ-ONLY access to all projects and tasks
- View comprehensive audit trail
- Access all financial data
- View user activity logs
- Flag concerns (comments visible to admin)
- Export data for compliance

**Key Metrics**:
- Total Projects
- Total Budget
- Compliance Status
- Audit Flags

**Sections**:
- System-wide Activity Overview
- All Projects (read-only)
- All Tasks (read-only)
- Financial Audit Trail
- User Activity Logs
- Flagged Items

### 4. Enhanced Admin Dashboard
**File**: `src/pages/AdminDashboard.tsx` (enhance existing)

**Features** (beyond current implementation):
- Blue-themed interface
- Full system oversight
- Approval queue for completed tasks
- System health monitoring
- User management quick access
- Notification center

**Additional Sections Needed**:
- Pending Approvals Queue (tasks marked complete by users)
- System Health Indicators
- User Activity Summary
- Overdue Items Alert
- Budget Alerts

## 📋 Additional Components Needed

### 1. Approval Modal
**File**: `src/components/admin/ApprovalModal.tsx`

**Purpose**: Allow admin to approve completed tasks

**Features**:
- View task/project details
- See completion notes and documentation
- Approve or reject with comments
- Mark as officially complete (turns green)

### 2. Expense Manager Component
**File**: `src/components/finance/ExpenseManager.tsx`

**Purpose**: Manage expenses across projects

**Features**:
- Add new expenses with receipt upload
- View all expenses
- Approve/reject expenses (finance role)
- Filter by project, category, status
- Export expense reports

### 3. Team Assignment Component
**File**: `src/components/projects/TeamAssignmentComponent.tsx`

**Purpose**: Allow project managers to assign team members

**Features**:
- View available technical team members
- Add/remove team members from projects
- Set roles within project team
- Track team member workload

### 4. File Uploader Component
**File**: `src/components/common/FileUploader.tsx`

**Purpose**: Multi-file upload with preview

**Features**:
- Drag and drop interface
- File type validation
- Preview for images
- Progress indicators
- Firebase Storage integration

### 5. Notification Center
**File**: `src/components/common/NotificationCenter.tsx`

**Purpose**: Real-time notifications

**Features**:
- Dropdown notification list
- Real-time updates using Firestore listeners
- Mark as read functionality
- Notification types: task assigned, project update, approval needed, expense submitted
- Role-specific notifications

### 6. Status Update Component
**File**: `src/components/tasks/StatusUpdateComponent.tsx`

**Purpose**: Log progress updates for tasks/projects

**Features**:
- Status dropdown with predefined options:
  - Project Started
  - In Progress
  - Awaiting Finances
  - Materials Ordered
  - On Hold
  - Testing Phase
  - Ready for Review
  - Completed
- Custom message input
- File attachments
- Timestamp tracking
- Display in UpdateTimeline component

## 🔧 Database Schema Updates Needed

### Tasks Collection
```typescript
{
  // ...existing fields...
  statusUpdates: [
    {
      id: string;
      status: string;
      message: string;
      timestamp: Timestamp;
      userId: string;
      userName: string;
      attachments: string[];
    }
  ],
  pendingApproval: boolean, // true when marked complete, awaiting admin approval
  approvedBy: string | null, // admin who approved
  approvedAt: Timestamp | null,
  rejectionReason: string | null,
}
```

### Projects Collection
```typescript
{
  // ...existing fields...
  teamMembers: string[], // array of user IDs
  managerId: string, // project manager ID
  statusUpdates: UpdateItem[],
  pendingApproval: boolean,
  approvedBy: string | null,
  approvedAt: Timestamp | null,
}
```

### Expenses Collection (new)
```typescript
{
  id: string;
  projectId: string;
  taskId: string | null;
  amount: number;
  category: string;
  description: string;
  receiptUrl: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: Timestamp | null;
  reviewNotes: string | null;
}
```

### Notifications Collection (new)
```typescript
{
  id: string;
  userId: string; // recipient
  type: 'task_assigned' | 'project_update' | 'approval_needed' | 'expense_submitted' | 'task_completed' | 'approval_granted' | 'approval_rejected';
  title: string;
  message: string;
  link: string; // URL to navigate to
  read: boolean;
  createdAt: Timestamp;
  relatedId: string; // task/project/expense ID
}
```

## 🎯 Implementation Priority

1. **Phase 1** (Critical):
   - Complete StatusUpdateComponent
   - Implement Approval Modal for Admin
   - Add pending approval status to tasks
   - Update AdminDashboard with approval queue

2. **Phase 2** (High Priority):
   - Project Manager Dashboard
   - Team Assignment Component
   - Enhanced task filtering by assignee

3. **Phase 3** (Medium Priority):
   - Finance Officer Dashboard
   - Expense Manager Component
   - Budget tracking improvements

4. **Phase 4** (Lower Priority):
   - Auditor Dashboard (read-only views)
   - Notification Center
   - File Uploader Component

5. **Phase 5** (Polish):
   - Real-time updates with Firestore listeners
   - Export functionality
   - Advanced reporting

## 🚀 Next Steps

1. Review this implementation guide
2. Prioritize which dashboards to implement first
3. Create placeholder components for missing dashboards
4. Implement database schema updates
5. Build components in priority order
6. Test with different user roles
7. Add real-time updates
8. Polish UI/UX

## 📝 Notes

- All dashboards use Framer Motion for animations
- React Hot Toast for notifications
- Tailwind CSS for styling
- Firebase Firestore for data
- Role-based access control enforced at component level
- Real-time updates using Firestore `onSnapshot` listeners

---

**Current Status**: Technical Member Dashboard completed. Other dashboards need implementation.
**Estimated Time**: 40-60 hours for full implementation
**Complexity**: High (role-based permissions, real-time updates, file uploads, approval workflows)
