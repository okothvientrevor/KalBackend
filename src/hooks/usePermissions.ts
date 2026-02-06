import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionAction, PermissionResource } from '../types';
import { hasPermission, isAdmin, canManageUsers, canVerifyTasks } from '../config/permissions';

/**
 * Hook for checking user permissions
 * Usage: const { can, isAdmin, canVerify } = usePermissions();
 */
export const usePermissions = () => {
  const { userProfile } = useAuth();

  const permissions = useMemo(() => {
    if (!userProfile) {
      return {
        can: () => false,
        isAdmin: false,
        canManageUsers: false,
        canVerifyTasks: false,
        canApproveExpenditures: false,
        canCreateProjects: false,
        canManageSettings: false,
        userRole: undefined,
      };
    }

    return {
      /**
       * Check if user can perform an action on a resource
       * @param resource - The resource to check
       * @param action - The action to perform
       */
      can: (resource: PermissionResource, action: PermissionAction): boolean => {
        return hasPermission(
          userProfile.role,
          resource,
          action,
          (userProfile as any).customPermissions
        );
      },

      /**
       * Check if user is admin
       */
      isAdmin: isAdmin(userProfile.role),

      /**
       * Check if user can manage other users
       */
      canManageUsers: canManageUsers(userProfile.role),

      /**
       * Check if user can verify/approve tasks
       */
      canVerifyTasks: canVerifyTasks(userProfile.role),

      /**
       * Check if user can approve expenditures
       */
      canApproveExpenditures: hasPermission(userProfile.role, 'expenditures', 'approve'),

      /**
       * Check if user can create projects
       */
      canCreateProjects: hasPermission(userProfile.role, 'projects', 'create'),

      /**
       * Check if user can manage system settings
       */
      canManageSettings: hasPermission(userProfile.role, 'settings', 'manage'),

      /**
       * User's current role
       */
      userRole: userProfile.role,
    };
  }, [userProfile]);

  return permissions;
};

/**
 * Hook for checking if user can access a specific route
 */
export const useRoutePermission = (requiredRole?: string[]) => {
  const { userProfile } = useAuth();

  const canAccessRoute = useMemo(() => {
    if (!userProfile) return false;
    if (!requiredRole || requiredRole.length === 0) return true;
    return requiredRole.includes(userProfile.role);
  }, [userProfile, requiredRole]);

  return canAccessRoute;
};
