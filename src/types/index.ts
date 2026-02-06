// User Roles
export type UserRole = 'admin' | 'project_manager' | 'technical_team' | 'finance' | 'finance_officer' | 'auditor';

// User Interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  position?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  lastLogin?: Date;
}

// Task Status
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'verified';

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  projectId?: string;
  projectName?: string;
  dueDate: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments: Attachment[];
  comments: Comment[];
  subtasks?: Subtask[];
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: Date;
  updatedAt: Date;
  isLocked?: boolean;
}

// Subtask Interface
export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

// Recurring Pattern
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
}

// Comment Interface
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
}

// Attachment Interface
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  category?: 'document' | 'image' | 'drawing' | 'report' | 'receipt' | 'other';
  version?: number;
  previousVersions?: AttachmentVersion[];
}

// Attachment Version
export interface AttachmentVersion {
  id: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Project Status
export type ProjectStatus = 'not_started' | 'active' | 'on_hold' | 'delayed' | 'completed' | 'cancelled';

// Project Interface
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  actualEndDate?: Date;
  budget: number;
  actualSpent: number;
  clientName?: string;
  clientContact?: string;
  location?: string;
  managerId: string;
  managerName: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  attachments: Attachment[];
  tags?: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// Team Member
export interface TeamMember {
  userId: string;
  userName: string;
  role: string;
  assignedAt: Date;
}

// Milestone Interface
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  deliverables?: string[];
}

// Expenditure Status
export type ExpenditureStatus = 'pending' | 'team_lead_approved' | 'pm_approved' | 'accounts_approved' | 'rejected';

// Expenditure Category
export type ExpenditureCategory = 'fuel' | 'materials' | 'labour' | 'equipment' | 'transport' | 'utilities' | 'petty_cash' | 'other';

// Expenditure Interface
export interface Expenditure {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: ExpenditureCategory;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  status: ExpenditureStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  approvals: Approval[];
  attachments: Attachment[];
  paymentMethod?: string;
  vendor?: string;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Budget Interface
export interface Budget {
  id: string;
  name: string;
  projectId: string;
  projectName?: string;
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  fiscalYear: string;
  categories: BudgetCategory[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  notes?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

// Budget Category
export interface BudgetCategory {
  category: ExpenditureCategory;
  allocatedAmount: number;
  spentAmount: number;
}

// Approval Status
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Approval Interface
export interface Approval {
  id: string;
  level: string;
  status: ApprovalStatus;
  approverId: string;
  approverName: string;
  approvedAt?: Date;
  comments?: string;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  entityType: 'task' | 'project' | 'expenditure' | 'user' | 'document' | 'budget';
  entityId?: string;
  entityName?: string;
  action: string;
  description?: string;
  userId: string;
  userName?: string;
  timestamp: Date;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Document Interface
export interface Document {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: string;
  size: number;
  category: string;
  tags: string[];
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  updatedAt: Date;
  version: number;
  previousVersions: AttachmentVersion[];
  accessRoles: UserRole[];
}

// Notification Interface
export interface Notification {
  id: string;
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'approval_required' | 'approval_completed' | 'budget_alert' | 'comment_added' | 'mention' | 'system';
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalBudget: number;
  totalSpent: number;
  pendingApprovals: number;
  teamMembers: number;
}

// Report Types
export type ReportType = 'task_summary' | 'project_progress' | 'expenditure_summary' | 'audit_report' | 'team_performance';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: Record<string, unknown>;
  generatedBy: string;
  generatedAt: Date;
  format: 'pdf' | 'excel';
  url?: string;
}

// Asset / Inventory
export interface Asset {
  id: string;
  name: string;
  assetTag?: string;
  description?: string;
  category: 'equipment' | 'vehicle' | 'it_hardware' | 'furniture' | 'other';
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  assignedTo?: string;
  assignedToName?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  location?: string;
  warranty?: {
    expiryDate?: Date;
    provider?: string;
  };
  maintenanceSchedule?: string;
  notes?: string;
  attachments?: Attachment[];
  createdBy?: string;
  createdAt: any;
  updatedAt: any;
}

// Filter Options
export interface FilterOptions {
  status?: string[];
  priority?: string[];
  assignee?: string[];
  project?: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  tags?: string[];
  category?: string[];
}

// Update/Activity Types for Progress Tracking
export interface Update {
  id: string;
  title: string;
  content: string;
  type: 'status_change' | 'comment' | 'progress_update' | 'document_upload' | 'milestone' | 'system';
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
  previousValue?: any;
  newValue?: any;
  metadata?: {
    [key: string]: any;
  };
}

// Progress Entry
export interface ProgressEntry {
  id: string;
  percentage: number;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  milestone?: string;
  hoursWorked?: number;
}

// Next Action Item
export interface NextAction {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: Date;
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  createdBy: string;
  createdAt: Date;
}

// Document Category for better organization
export type DocumentCategory = 'specification' | 'drawing' | 'report' | 'invoice' | 'contract' | 'certificate' | 'photo' | 'other';

// Extended Task and Project interfaces with updates
export interface TaskWithUpdates extends Task {
  updates: Update[];
  progressEntries: ProgressEntry[];
  nextActions: NextAction[];
}

export interface ProjectWithUpdates extends Project {
  updates: Update[];
  progressEntries: ProgressEntry[];
  nextActions: NextAction[];
}

// ==================== PERMISSIONS SYSTEM ====================

// Permission Actions
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'manage';

// Permission Resources
export type PermissionResource = 
  | 'tasks' 
  | 'projects' 
  | 'expenditures' 
  | 'documents' 
  | 'users' 
  | 'reports' 
  | 'budgets'
  | 'audit_logs'
  | 'settings'
  | 'assets'
  | 'team';

// Single Permission
export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

// Role-based Permissions Configuration
export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// User-specific Permission Override
export interface UserPermissionOverride {
  userId: string;
  resource: PermissionResource;
  actions: PermissionAction[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  reason?: string;
}

// ==================== APPROVAL WORKFLOWS ====================

// Approval Status Extended
export type ApprovalWorkflowStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

// Approval Levels
export type ApprovalLevel = 'team_lead' | 'project_manager' | 'finance_officer' | 'admin';

// Approval Request
export interface ApprovalRequest {
  id: string;
  entityType: 'task' | 'project' | 'expenditure' | 'budget' | 'document';
  entityId: string;
  entityName: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  currentLevel: ApprovalLevel;
  requiredLevels: ApprovalLevel[];
  status: ApprovalWorkflowStatus;
  approvals: ApprovalStep[];
  comments?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Approval Step in Workflow
export interface ApprovalStep {
  level: ApprovalLevel;
  approverId?: string;
  approverName?: string;
  status: ApprovalWorkflowStatus;
  action?: 'approved' | 'rejected';
  comments?: string;
  timestamp?: Date;
  notifiedAt?: Date;
}

// Task Verification (Admin Sign-off)
export interface TaskVerification extends ApprovalRequest {
  taskId: string;
  completedBy: string;
  completedByName: string;
  completedAt: Date;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: Date;
}

// Expenditure Approval Workflow
export interface ExpenditureApprovalWorkflow {
  expenditureId: string;
  currentStage: 'team_lead' | 'project_manager' | 'accounts' | 'completed' | 'rejected';
  stages: {
    team_lead: ApprovalStep;
    project_manager: ApprovalStep;
    accounts: ApprovalStep;
  };
  finalStatus: 'pending' | 'approved' | 'rejected';
  completedAt?: Date;
}

// ==================== USER INVITATION & MANAGEMENT ====================

// User Invitation
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  invitedBy: string;
  invitedByName: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  tempPassword?: string;
  acceptedAt?: Date;
  metadata?: Record<string, any>;
}

// User Creation by Admin
export interface AdminUserCreation {
  email: string;
  displayName: string;
  tempPassword: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  mustChangePassword: boolean;
  sendWelcomeEmail: boolean;
  customPermissions?: Permission[];
}

// ==================== DASHBOARD STATS (ROLE-SPECIFIC) ====================

export interface AdminDashboardStats extends DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  pendingVerifications: number;
  systemHealth: {
    storageUsed: number;
    storageLimit: number;
    activeConnections: number;
    errorRate: number;
  };
  recentActivity: AuditLog[];
  criticalAlerts: number;
}

export interface UserDashboardStats {
  myTasks: number;
  myCompletedTasks: number;
  myOverdueTasks: number;
  myProjects: number;
  pendingApprovals: number;
  recentUpdates: Update[];
}

// ==================== NOTIFICATION ENHANCEMENTS ====================

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: 'none' | 'daily' | 'weekly';
}

export interface EnhancedNotification extends Notification {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  requiresAction: boolean;
  expiresAt?: Date;
  relatedUsers?: string[];
}
