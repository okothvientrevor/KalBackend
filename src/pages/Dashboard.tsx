import React, { lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Lazy load role-specific dashboards
const AdminFullDashboard = lazy(() => import('./AdminDashboard'));
const TechnicalMemberDashboard = lazy(() => import('./dashboards/TechnicalMemberDashboard.tsx'));
const ProjectManagerDashboard = lazy(() => import('./dashboards/ProjectManagerDashboard.tsx'));
const FinanceOfficerDashboard = lazy(() => import('./dashboards/FinanceOfficerDashboard.tsx'));
const AuditorDashboard = lazy(() => import('./dashboards/AuditorDashboard.tsx'));

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

  // Loading component
  const DashboardLoader = () => (
    <div className="flex items-center justify-center h-96">
      <div className="spinner w-12 h-12" />
    </div>
  );

  // Route to role-specific dashboard
  const renderDashboard = () => {
    switch (userProfile?.role) {
      case 'admin':
        return <AdminFullDashboard />;
      case 'technical_team':
        return <TechnicalMemberDashboard />;
      case 'project_manager':
        return <ProjectManagerDashboard />;
      case 'finance_officer':
      case 'finance':
        return <FinanceOfficerDashboard />;
      case 'auditor':
        return <AuditorDashboard />;
      default:
        return <TechnicalMemberDashboard />;
    }
  };

  return (
    <Suspense fallback={<DashboardLoader />}>
      {renderDashboard()}
    </Suspense>
  );
};

export default Dashboard;
