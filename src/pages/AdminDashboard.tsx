import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ApprovalRequest, Task, User, AuditLog } from '../types';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    pendingVerifications: 0,
    totalProjects: 0,
    totalTasks: 0,
    criticalIssues: 0,
    recentLogins: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
      const activeUsers = users.filter(u => u.isActive !== false).length;

      // Fetch pending task verifications (tasks marked complete but not verified)
      const completedTasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
        limit(10)
      );
      const completedTasksSnapshot = await getDocs(completedTasksQuery);
      const completedTasks = completedTasksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate?.() || data.dueDate || new Date(),
          startDate: data.startDate?.toDate?.() || data.startDate,
          completedDate: data.completedDate?.toDate?.() || data.completedDate,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
        };
      }) as Task[];

      // Fetch pending approvals
      const approvalsQuery = query(
        collection(db, 'approvalRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const approvalsSnapshot = await getDocs(approvalsQuery);
      const approvals = approvalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
      })) as ApprovalRequest[];

      // Fetch recent audit logs
      const logsQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const logsSnapshot = await getDocs(logsQuery);
      const logs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as AuditLog[];

      // Fetch all tasks and projects for stats
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const projectsSnapshot = await getDocs(collection(db, 'projects'));

      setStats({
        totalUsers: users.length,
        activeUsers,
        pendingApprovals: approvals.length,
        pendingVerifications: completedTasks.length,
        totalProjects: projectsSnapshot.size,
        totalTasks: tasksSnapshot.size,
        criticalIssues: 0, // TODO: Implement critical issues detection
        recentLogins: users.filter(u => 
          u.lastLogin && new Date(u.lastLogin).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length,
      });

      setPendingApprovals(approvals);
      setPendingVerifications(completedTasks);
      setRecentActivity(logs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active`,
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      subtitle: 'Require action',
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/admin/approvals',
    },
    {
      title: 'Task Verifications',
      value: stats.pendingVerifications,
      subtitle: 'Awaiting sign-off',
      icon: DocumentCheckIcon,
      color: 'bg-purple-500',
      link: '/admin/verifications',
    },
    {
      title: 'Recent Logins',
      value: stats.recentLogins,
      subtitle: 'Last 24 hours',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
      link: '/audit-logs',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-800">Admin Dashboard</h1>
          <p className="text-secondary-500 mt-1">
            Welcome back, {userProfile?.displayName || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="btn-primary">
            <UsersIcon className="w-5 h-5 mr-2" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-secondary-800 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
              <p className="text-xs text-secondary-400 mt-1">{stat.subtitle}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-800">Pending Approvals</h3>
            <Link to="/admin/approvals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 5).map((approval) => (
                <div key={approval.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800 truncate">{approval.entityName}</p>
                    <p className="text-sm text-secondary-500">
                      {approval.entityType} • Requested {approval.requestedAt && isValid(new Date(approval.requestedAt)) ? formatDistanceToNow(new Date(approval.requestedAt)) : 'recently'} ago
                    </p>
                  </div>
                  <Link
                    to={`/admin/approvals/${approval.id}`}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-secondary-500">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Verifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-800">Task Verifications</h3>
            <Link to="/admin/verifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingVerifications.length > 0 ? (
              pendingVerifications.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentCheckIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800 truncate">{task.title}</p>
                    <p className="text-sm text-secondary-500">
                      By {task.assigneeName || 'Unknown'} • {task.completedDate && isValid(new Date(task.completedDate)) ? format(new Date(task.completedDate), 'MMM d') : 'Recently'}
                    </p>
                  </div>
                  <Link
                    to={`/tasks/${task.id}`}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Verify
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-secondary-500">No pending verifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-800">Recent Activity</h3>
          <Link to="/audit-logs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All Logs
          </Link>
        </div>
        <div className="space-y-2">
          {recentActivity.length > 0 ? (
            recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-700">
                    <span className="font-medium">{log.userName || 'System'}</span> {log.action} {log.entityType}
                    {log.entityName && ` "${log.entityName}"`}
                  </p>
                  <p className="text-xs text-secondary-400">
                    {log.timestamp && isValid(new Date(log.timestamp)) ? formatDistanceToNow(new Date(log.timestamp)) : 'recently'} ago
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-secondary-500">No recent activity</p>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-secondary-800">Total Projects</h4>
          </div>
          <p className="text-2xl font-bold text-secondary-800">{stats.totalProjects}</p>
          <p className="text-sm text-secondary-500">Active and completed</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-secondary-800">Total Tasks</h4>
          </div>
          <p className="text-2xl font-bold text-secondary-800">{stats.totalTasks}</p>
          <p className="text-sm text-secondary-500">Across all projects</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <BellAlertIcon className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-secondary-800">Critical Issues</h4>
          </div>
          <p className="text-2xl font-bold text-secondary-800">{stats.criticalIssues}</p>
          <p className="text-sm text-secondary-500">Requires attention</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
