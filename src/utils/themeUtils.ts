import { UserRole } from '../types';

/**
 * Maps user roles to theme colors.
 * @param role - The role of the user.
 * @returns The theme color for the role.
 */
export const getRoleThemeColor = (role?: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'blue';
    case 'technical_team':
      return 'green';
    case 'project_manager':
      return 'orange';
    case 'finance_officer':
      return 'purple';
    case 'auditor':
      return 'gray';
    default:
      return 'gray';
  }
};
