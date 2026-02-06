import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
}

/**
 * Component to protect routes based on user roles
 * Usage: <ProtectedRoute allowedRoles={['admin', 'project_manager']}>...</ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requireAdmin = false 
}) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // No user profile loaded
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">Unable to load your user profile. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && userProfile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">
            You don't have permission to access this page. Administrator access is required.
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userProfile.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              You don't have permission to access this page. Your role: <span className="font-semibold">{userProfile.role}</span>
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // User has access
  return <>{children}</>;
};

export default ProtectedRoute;
