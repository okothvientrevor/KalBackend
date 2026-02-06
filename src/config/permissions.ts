import { RolePermissions, UserRole, Permission, PermissionAction, PermissionResource } from '../types';

/**
 * Default permissions for each role
 * This defines what each role can do by default
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    description: 'Full system access and management',
    permissions: [
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'expenditures', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'export', 'manage'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'reports', actions: ['create', 'read', 'export', 'manage'] },
      { resource: 'budgets', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'audit_logs', actions: ['read', 'export', 'manage'] },
      { resource: 'settings', actions: ['read', 'update', 'manage'] },
      { resource: 'assets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'team', actions: ['read', 'manage'] },
    ],
  },
  project_manager: {
    role: 'project_manager',
    description: 'Manage projects, tasks, and team members',
    permissions: [
      { resource: 'tasks', actions: ['create', 'read', 'update', 'approve', 'export'] },
      { resource: 'projects', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'expenditures', actions: ['create', 'read', 'approve'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] },
      { resource: 'budgets', actions: ['read', 'update'] },
      { resource: 'audit_logs', actions: ['read'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'assets', actions: ['read', 'update'] },
      { resource: 'team', actions: ['read'] },
    ],
  },
  technical_team: {
    role: 'technical_team',
    description: 'Execute tasks and update progress',
    permissions: [
      { resource: 'tasks', actions: ['read', 'update'] },
      { resource: 'projects', actions: ['read'] },
      { resource: 'expenditures', actions: ['create', 'read'] },
      { resource: 'documents', actions: ['create', 'read'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
      { resource: 'budgets', actions: ['read'] },
      { resource: 'audit_logs', actions: [] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'assets', actions: ['read'] },
      { resource: 'team', actions: ['read'] },
    ],
  },
  finance: {
    role: 'finance',
    description: 'Manage finances, budgets, and expenditures',
    permissions: [
      { resource: 'tasks', actions: ['read'] },
      { resource: 'projects', actions: ['read'] },
      { resource: 'expenditures', actions: ['read', 'approve', 'export', 'manage'] },
      { resource: 'documents', actions: ['read', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] },
      { resource: 'budgets', actions: ['create', 'read', 'update', 'approve', 'export', 'manage'] },
      { resource: 'audit_logs', actions: ['read', 'export'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'assets', actions: ['read', 'update'] },
      { resource: 'team', actions: ['read'] },
    ],
  },
  finance_officer: {
    role: 'finance_officer',
    description: 'Review and approve financial transactions',
    permissions: [
      { resource: 'tasks', actions: ['read'] },
      { resource: 'projects', actions: ['read'] },
      { resource: 'expenditures', actions: ['read', 'approve', 'export'] },
      { resource: 'documents', actions: ['read'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'export'] },
      { resource: 'budgets', actions: ['read', 'approve'] },
      { resource: 'audit_logs', actions: ['read'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'assets', actions: ['read'] },
      { resource: 'team', actions: ['read'] },
    ],
  },
  auditor: {
    role: 'auditor',
    description: 'View all records and audit trails',
    permissions: [
      { resource: 'tasks', actions: ['read', 'export'] },
      { resource: 'projects', actions: ['read', 'export'] },
      { resource: 'expenditures', actions: ['read', 'export'] },
      { resource: 'documents', actions: ['read', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] },
      { resource: 'budgets', actions: ['read', 'export'] },
      { resource: 'audit_logs', actions: ['read', 'export', 'manage'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'assets', actions: ['read', 'export'] },
      { resource: 'team', actions: ['read'] },
    ],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export const hasPermission = (
  userRole: UserRole,
  resource: PermissionResource,
  action: PermissionAction,
  customPermissions?: Permission[]
): boolean => {
  // Check custom permissions first (overrides)
  if (customPermissions && customPermissions.length > 0) {
    const customPerm = customPermissions.find((p) => p.resource === resource);
    if (customPerm) {
      return customPerm.actions.includes(action);
    }
  }

  // Check role-based permissions
  const rolePerms = ROLE_PERMISSIONS[userRole];
  if (!rolePerms) return false;

  const resourcePerm = rolePerms.permissions.find((p) => p.resource === resource);
  if (!resourcePerm) return false;

  return resourcePerm.actions.includes(action);
};

/**
 * Get all permissions for a user role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role]?.permissions || [];
};

/**
 * Check if user can approve at a specific level
 */
export const canApproveAtLevel = (userRole: UserRole, level: string): boolean => {
  const approvalMap: Record<string, UserRole[]> = {
    team_lead: ['admin', 'project_manager'],
    project_manager: ['admin', 'project_manager'],
    finance_officer: ['admin', 'finance', 'finance_officer'],
    admin: ['admin'],
  };

  return approvalMap[level]?.includes(userRole) || false;
};

/**
 * Get required approval levels for expenditure based on amount
 */
export const getExpenditureApprovalLevels = (amount: number): string[] => {
  if (amount < 100000) {
    return ['team_lead', 'accounts'];
  } else if (amount < 500000) {
    return ['team_lead', 'project_manager', 'accounts'];
  } else {
    return ['team_lead', 'project_manager', 'accounts', 'admin'];
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole?: UserRole): boolean => {
  return userRole === 'admin';
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (userRole?: UserRole): boolean => {
  return userRole === 'admin';
};

/**
 * Check if user can verify tasks
 */
export const canVerifyTasks = (userRole?: UserRole): boolean => {
  return userRole === 'admin' || userRole === 'project_manager';
};
