import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

const AuditorDashboard: React.FC = () => {
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
            Auditor Dashboard 🔍
          </h1>
          <p className="text-secondary-500 mt-1">
            Review and audit all system activities (Read-Only)
          </p>
        </div>
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
            <ShieldCheckIcon className={`w-16 h-16 ${theme.text}`} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">
            Auditor Dashboard - Coming Soon
          </h2>
          <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
            This dashboard is currently under development. You'll soon have read-only access to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ All Projects & Tasks</h3>
              <p className="text-sm text-secondary-600">View comprehensive details of all system activities</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Financial Records</h3>
              <p className="text-sm text-secondary-600">Access all financial data, budgets, and expenses</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Activity Logs</h3>
              <p className="text-sm text-secondary-600">Review user activity and system audit trails</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Flag Concerns</h3>
              <p className="text-sm text-secondary-600">Add audit comments visible to administrators</p>
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
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Access (Read-Only)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/audit-logs"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <ClipboardDocumentCheckIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">Audit Logs</p>
          </Link>
          <Link
            to="/projects"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <DocumentMagnifyingGlassIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">Review Projects</p>
          </Link>
          <Link
            to="/reports"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <ShieldCheckIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">Compliance Reports</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuditorDashboard;
