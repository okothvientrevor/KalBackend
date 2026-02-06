import { UserRole } from '../types';

/**
 * Theme configuration for each user role
 */
export interface RoleTheme {
  primary: string;
  secondary: string;
  light: string;
  gradient: string;
  border: string;
  text: string;
  bgPrimary: string;
  bgSecondary: string;
}

/**
 * Get comprehensive theme colors for a user role
 */
export const getRoleTheme = (role?: UserRole): RoleTheme => {
  switch (role) {
    case 'admin':
      return {
        primary: 'blue-600',
        secondary: 'blue-500',
        light: 'blue-50',
        gradient: 'from-blue-500 to-blue-600',
        border: 'border-blue-200',
        text: 'text-blue-600',
        bgPrimary: 'bg-blue-600',
        bgSecondary: 'bg-blue-500',
      };
    case 'technical_team':
      return {
        primary: 'green-600',
        secondary: 'green-500',
        light: 'green-50',
        gradient: 'from-green-500 to-green-600',
        border: 'border-green-200',
        text: 'text-green-600',
        bgPrimary: 'bg-green-600',
        bgSecondary: 'bg-green-500',
      };
    case 'project_manager':
      return {
        primary: 'orange-600',
        secondary: 'orange-500',
        light: 'orange-50',
        gradient: 'from-orange-500 to-orange-600',
        border: 'border-orange-200',
        text: 'text-orange-600',
        bgPrimary: 'bg-orange-600',
        bgSecondary: 'bg-orange-500',
      };
    case 'finance_officer':
    case 'finance':
      return {
        primary: 'purple-600',
        secondary: 'purple-500',
        light: 'purple-50',
        gradient: 'from-purple-500 to-purple-600',
        border: 'border-purple-200',
        text: 'text-purple-600',
        bgPrimary: 'bg-purple-600',
        bgSecondary: 'bg-purple-500',
      };
    case 'auditor':
      return {
        primary: 'gray-600',
        secondary: 'gray-500',
        light: 'gray-50',
        gradient: 'from-gray-500 to-gray-600',
        border: 'border-gray-200',
        text: 'text-gray-600',
        bgPrimary: 'bg-gray-600',
        bgSecondary: 'bg-gray-500',
      };
    default:
      return {
        primary: 'gray-600',
        secondary: 'gray-500',
        light: 'gray-50',
        gradient: 'from-gray-500 to-gray-600',
        border: 'border-gray-200',
        text: 'text-gray-600',
        bgPrimary: 'bg-gray-600',
        bgSecondary: 'bg-gray-500',
      };
  }
};
