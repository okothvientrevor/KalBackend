import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  DocumentCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

const FinanceOfficerDashboard: React.FC = () => {
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
            Finance Dashboard 💰
          </h1>
          <p className="text-secondary-500 mt-1">
            Manage budgets and approve expenses
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
            <BanknotesIcon className={`w-16 h-16 ${theme.text}`} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">
            Finance Dashboard - Coming Soon
          </h2>
          <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
            This dashboard is currently under development. You'll soon be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Review Expenses</h3>
              <p className="text-sm text-secondary-600">Approve or reject expense submissions from all projects</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Track Budgets</h3>
              <p className="text-sm text-secondary-600">Monitor budget utilization across all projects</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Financial Reports</h3>
              <p className="text-sm text-secondary-600">Generate comprehensive financial reports</p>
            </div>
            <div className={`p-4 ${theme.light} rounded-lg`}>
              <h3 className="font-semibold text-secondary-800 mb-2">✓ Expense Analytics</h3>
              <p className="text-sm text-secondary-600">View expense breakdowns by category and project</p>
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
            to="/budgets"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <ChartBarIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Budgets</p>
          </Link>
          <Link
            to="/expenditures"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <BanknotesIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Expenses</p>
          </Link>
          <Link
            to="/reports"
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all`}
          >
            <DocumentCheckIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">Generate Reports</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default FinanceOfficerDashboard;
