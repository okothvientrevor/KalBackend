import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

const ProjectManagerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const theme = getRoleTheme(userProfile?.role);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>
            Project Manager Dashboard 📊
          </h1>
          <p className="text-secondary-500 mt-1">
            Manage your projects and teams
          </p>
        </div>
        <Link to="/projects/new" className={`btn-primary ${theme.bgPrimary}`}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Assign Team Member
        </Link>
      </motion.div>

      {/* Under Construction Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`card p-8 border-2 ${theme.border}`}
      >
        <div className="text-center">
          <div className={`inline-block p-4 ${theme.light} rounded-full mb-4`}>
            <UserGroupIcon className={`w-16 h-16 ${theme.text}`} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">
            Project Manager Dashboard - Coming Soon
          </h2>
          <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
            This dashboard is currently under development. You'll soon be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Manage Your Projects</h3>
              <p className="text-sm text-secondary-600">View and manage only the projects assigned to you</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Assign Team Members</h3>
              <p className="text-sm text-secondary-600">Add or remove technical team members from your projects</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Create Tasks</h3>
              <p className="text-sm text-secondary-600">Create and assign tasks within your projects</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Monitor Progress</h3>
              <p className="text-sm text-secondary-600">Track team progress and project timelines</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Temporary Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/projects"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <FolderIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Projects</p>
          </Link>
          <Link
            to="/tasks"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <ClipboardDocumentListIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Tasks</p>
          </Link>
          <Link
            to="/team"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <UserGroupIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Team</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectManagerDashboard;
