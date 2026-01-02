import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  FolderIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, Project } from '../types';
import TaskModal from '../components/tasks/TaskModal';
import ProjectModal from '../components/projects/ProjectModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalSpent: number;
}

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [taskData, setTaskData] = useState({ name: '', description: '', dueDate: '' });
  const [projectData, setProjectData] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks with timeout
      const tasksTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tasks fetch timeout')), 5000);
      });
      const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(50));
      const tasksPromise = getDocs(tasksQuery);
      const tasksSnapshot = await Promise.race([tasksPromise, tasksTimeoutPromise]);
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Task',
        description: doc.data().description || '',
        dueDate: doc.data().dueDate || new Date().toISOString(),
        status: doc.data().status || 'todo',
        priority: doc.data().priority || 'low',
        assigneeId: doc.data().assigneeId || '',
        assigneeName: doc.data().assigneeName || 'Unassigned',
        creatorId: doc.data().creatorId || '',
        creatorName: doc.data().creatorName || 'Unknown',
        title: doc.data().title || 'Untitled Task',
        attachments: doc.data().attachments || [],
        comments: doc.data().comments || [],
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Task));

      const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
      const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
      const overdueTasks = tasks.filter(t =>
        (t.status === 'todo' || t.status === 'in_progress') &&
        new Date(t.dueDate) < new Date()
      ).length;

      setRecentTasks(tasks.slice(0, 5));

      // Update stats with task data
      setStats((prevStats) => ({
        ...prevStats,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
      }));

      // Fetch projects with timeout
      const projectsTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Projects fetch timeout')), 5000);
      });
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(20));
      const projectsPromise = getDocs(projectsQuery);
      try {
        const projectsSnapshot = await Promise.race([projectsPromise, projectsTimeoutPromise]);
        const projects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Project',
          description: doc.data().description || '',
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date(),
          status: doc.data().status || 'active',
          budget: doc.data().budget || 0,
          actualSpent: doc.data().actualSpent || 0,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Project));

        const activeProjects = projects.filter(p => p.status === 'active').length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = projects.reduce((sum, p) => sum + (p.actualSpent || 0), 0);

        setRecentProjects(projects.slice(0, 5));

        setStats((prevStats) => ({
          ...prevStats,
          totalProjects: projects.length,
          activeProjects,
          totalBudget,
          totalSpent,
        }));
      } catch (error) {
        console.error('Error fetching projects:', error);
        setRecentProjects([]);
        setStats((prevStats) => ({
          ...prevStats,
          totalProjects: 0,
          activeProjects: 0,
          totalBudget: 0,
          totalSpent: 0,
        }));
      }
    } catch (error) {
      // Handle timeout silently - don't log timeout errors
      if (!(error instanceof Error) || !error.message.includes('timeout')) {
        console.error('Error fetching dashboard data:', error);
      }
      // Set default stats if fetch fails
      setStats({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        totalProjects: 0,
        activeProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
      });
      setRecentTasks([]);
      setRecentProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowTaskModal(false);
      setTaskData({ name: '', description: '', dueDate: '' });
      fetchDashboardData(); // Refresh data after adding task
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...projectData,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowProjectModal(false);
      setProjectData({ name: '', description: '', startDate: '', endDate: '' });
      fetchDashboardData(); // Refresh data after adding project
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'To Do', 'Overdue'],
    datasets: [
      {
        data: [stats.completedTasks, stats.pendingTasks - stats.overdueTasks, stats.overdueTasks, stats.overdueTasks],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const budgetData = {
    labels: ['Budget', 'Spent', 'Remaining'],
    datasets: [
      {
        label: 'Amount (UGX)',
        data: [stats.totalBudget, stats.totalSpent, stats.totalBudget - stats.totalSpent],
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e'],
        borderRadius: 8,
      },
    ],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Projects Active',
        data: [5, 6, 5, 8, 7, 9, 10, 8, 9, 11, 10, 12],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: ClipboardDocumentListIcon,
      color: 'bg-primary-500',
      lightColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      link: '/tasks',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      color: 'bg-success-500',
      lightColor: 'bg-success-50',
      textColor: 'text-success-600',
      link: '/tasks?status=completed',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: ExclamationTriangleIcon,
      color: 'bg-danger-500',
      lightColor: 'bg-danger-50',
      textColor: 'text-danger-600',
      link: '/tasks?status=overdue',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderIcon,
      color: 'bg-warning-500',
      lightColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      link: '/projects?status=active',
    },
    {
      title: 'Total Budget',
      value: `UGX ${(stats.totalBudget / 1000000).toFixed(1)}M`,
      icon: BanknotesIcon,
      color: 'bg-accent-500',
      lightColor: 'bg-accent-50',
      textColor: 'text-accent-600',
      link: '/budgets',
    },
    {
      title: 'Budget Spent',
      value: `UGX ${(stats.totalSpent / 1000000).toFixed(1)}M`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-secondary-500',
      lightColor: 'bg-secondary-50',
      textColor: 'text-secondary-600',
      link: '/expenditures',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'badge-success';
      case 'in_progress':
        return 'badge-primary';
      case 'todo':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'active':
        return 'badge-primary';
      case 'delayed':
        return 'badge-danger';
      case 'on_hold':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const openTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-800">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-secondary-500 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={openTaskModal} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            New Task
          </button>

          {isTaskModalOpen && (
            <TaskModal
              isOpen={isTaskModalOpen}
              onClose={closeTaskModal}
              onSubmit={async (taskData: Partial<Task>) => {
                try {
                  await addDoc(collection(db, 'tasks'), {
                    ...taskData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  fetchDashboardData(); // Refresh data
                  closeTaskModal();
                } catch (error) {
                  console.error('Error creating task:', error);
                }
              }}
            />
          )}

          <button onClick={() => setShowProjectModal(true)} className="btn-outline">
            <PlusIcon className="w-5 h-5 mr-2" />
            New Project
          </button>

          {showProjectModal && (
            <ProjectModal
              isOpen={showProjectModal}
              onClose={() => setShowProjectModal(false)}
              onSubmit={async (projectData: Partial<Project>) => {
                try {
                  await addDoc(collection(db, 'projects'), {
                    ...projectData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  fetchDashboardData(); // Refresh data
                  setShowProjectModal(false);
                } catch (error) {
                  console.error('Error creating project:', error);
                }
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="stat-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.lightColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-500">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-800 mt-1">{stat.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Chart */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Task Status</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={taskStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Budget Overview */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Budget Overview</h3>
          <div className="h-64">
            <Bar
              data={budgetData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Monthly Trends</h3>
          <div className="h-64">
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div variants={itemVariants} className="card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-800">Recent Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTasks.length === 0 ? (
              <div className="p-6 text-center text-secondary-500">
                No tasks yet. Create your first task!
              </div>
            ) : (
              recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800 truncate">{task.title}</p>
                    <p className="text-sm text-secondary-500">{task.projectName || 'No Project'}</p>
                  </div>
                  <span className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-800">Recent Projects</h3>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProjects.length === 0 ? (
              <div className="p-6 text-center text-secondary-500">
                No projects yet. Create your first project!
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800 truncate">{project.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="progress-bar h-1.5"
                          data-progress-width={`${project.progress || 0}%`}
                        />
                      </div>
                      <span className="text-xs text-secondary-500">{project.progress || 0}%</span>
                    </div>
                  </div>
                  <span className={`ml-4 ${getProjectStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/tasks/new" className="p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors group">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 mb-2" />
            <p className="font-medium text-secondary-800">Create Task</p>
            <p className="text-sm text-secondary-500">Add a new task</p>
          </Link>
          <Link to="/projects/new" className="p-4 rounded-xl bg-success-50 hover:bg-success-100 transition-colors group">
            <FolderIcon className="w-8 h-8 text-success-600 mb-2" />
            <p className="font-medium text-secondary-800">New Project</p>
            <p className="text-sm text-secondary-500">Start a project</p>
          </Link>
          <Link to="/expenditures/new" className="p-4 rounded-xl bg-warning-50 hover:bg-warning-100 transition-colors group">
            <BanknotesIcon className="w-8 h-8 text-warning-600 mb-2" />
            <p className="font-medium text-secondary-800">Log Expense</p>
            <p className="text-sm text-secondary-500">Record spending</p>
          </Link>
          <Link to="/reports" className="p-4 rounded-xl bg-accent-50 hover:bg-accent-100 transition-colors group">
            <ArrowTrendingUpIcon className="w-8 h-8 text-accent-600 mb-2" />
            <p className="font-medium text-secondary-800">View Reports</p>
            <p className="text-sm text-secondary-500">Analyze data</p>
          </Link>
        </div>
      </motion.div>

      {/* Modals */}
      {showTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-overlay absolute inset-0 bg-black opacity-50" />
          <div className="modal-container bg-white rounded-lg shadow-lg z-10 overflow-hidden max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Create Task</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task Name"
                  value={taskData.name}
                  onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                  className="input"
                />
                <textarea
                  placeholder="Description"
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  className="textarea"
                />
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  id="dueDate"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowTaskModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreateTask} className="btn-primary">
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-overlay absolute inset-0 bg-black opacity-50" />
          <div className="modal-container bg-white rounded-lg shadow-lg z-10 overflow-hidden max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Create Project</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="input"
                />
                <textarea
                  placeholder="Description"
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="textarea"
                />
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
                  className="input"
                  placeholder="Start Date"
                  title="Start Date"
                />

                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  value={projectData.endDate}
                  onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
                  className="input"
                  placeholder="End Date"
                  title="End Date"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowProjectModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreateProject} className="btn-primary">
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
