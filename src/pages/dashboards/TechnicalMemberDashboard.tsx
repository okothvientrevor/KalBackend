import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  PlusIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Task, Project } from '../../types';
import { getRoleTheme } from '../../utils/roleTheme';
import MetricCard from '../../components/common/MetricCard';
import toast from 'react-hot-toast';

const TechnicalMemberDashboard: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const theme = getRoleTheme(userProfile?.role);
  
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Fetch tasks assigned to the current user
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assigneeId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Task));

      setMyTasks(tasks);

      // Calculate stats
      const completed = tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
      const overdue = tasks.filter(t =>
        (t.status === 'todo' || t.status === 'in_progress') &&
        new Date(t.dueDate) < new Date()
      ).length;

      // Fetch projects assigned to the current user
      const projectsQuery = query(
        collection(db, 'projects'),
        where('teamMembers', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Project));

      setMyProjects(projects);

      const active = projects.filter(p => p.status === 'active').length;

      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        overdueTasks: overdue,
        activeProjects: active,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

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
            Welcome, {userProfile?.displayName?.split(' ')[0] || 'Team Member'}! 👋
          </h1>
          <p className="text-secondary-500 mt-1">
            Here are your assigned tasks and projects
          </p>
        </div>
        <Link to="/tasks/new" className={`btn-primary ${theme.bgPrimary}`}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Update Progress
        </Link>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="My Tasks"
          value={stats.totalTasks}
          icon={ClipboardDocumentListIcon}
          lightColor={theme.light}
          textColor={theme.text}
          link="/tasks"
        />
        <MetricCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircleIcon}
          lightColor="bg-green-50"
          textColor="text-green-600"
          link="/tasks?status=completed"
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={ExclamationTriangleIcon}
          lightColor="bg-red-50"
          textColor="text-red-600"
          link="/tasks?status=overdue"
        />
        <MetricCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderIcon}
          lightColor="bg-orange-50"
          textColor="text-orange-600"
          link="/projects"
        />
      </div>

      {/* My Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-800">My Tasks</h3>
          <Link to="/tasks" className={`text-sm font-medium ${theme.text} hover:underline`}>
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {myTasks.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
              <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            myTasks.slice(0, 10).map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-secondary-800 truncate">{task.title}</h4>
                    <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-500 truncate">{task.projectName || 'No Project'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </motion.div>

      {/* My Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-800">My Projects</h3>
          <Link to="/projects" className={`text-sm font-medium ${theme.text} hover:underline`}>
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {myProjects.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">
              <FolderIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No projects assigned yet</p>
            </div>
          ) : (
            myProjects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-secondary-800 truncate">{project.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${theme.bgSecondary}`}
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary-500 min-w-[40px] text-right">
                      {project.progress || 0}%
                    </span>
                  </div>
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/tasks"
            className={`p-4 rounded-xl ${theme.light} hover:${theme.light} transition-colors group`}
          >
            <ClipboardDocumentListIcon className={`w-8 h-8 ${theme.text} mb-2`} />
            <p className="font-medium text-secondary-800">View Tasks</p>
            <p className="text-sm text-secondary-500">See all your tasks</p>
          </Link>
          <Link
            to="/projects"
            className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group"
          >
            <FolderIcon className="w-8 h-8 text-orange-600 mb-2" />
            <p className="font-medium text-secondary-800">View Projects</p>
            <p className="text-sm text-secondary-500">See your projects</p>
          </Link>
          <Link
            to="/documents"
            className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium text-secondary-800">Documents</p>
            <p className="text-sm text-secondary-500">Upload files</p>
          </Link>
          <Link
            to="/expenditures"
            className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
          >
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-secondary-800">Log Expense</p>
            <p className="text-sm text-secondary-500">Add expenses</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default TechnicalMemberDashboard;
