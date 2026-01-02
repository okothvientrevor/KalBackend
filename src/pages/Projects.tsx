import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Project, ProjectStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ProjectModal from '../components/projects/ProjectModal';

const Projects: React.FC = () => {
  const { userProfile: _userProfile, currentUser: _currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const projectData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || 'Unnamed Project',
          description: doc.data().description || '',
          status: doc.data().status || 'not_started',
          progress: doc.data().progress || 0,
          budget: doc.data().budget || 0,
          managerName: doc.data().managerName || 'Unassigned',
          teamMembers: doc.data().teamMembers || [],
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Project[];
        setProjects(projectData);
        setLoading(false); // Update loading state
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        setLoading(false); // Ensure loading state is updated
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = (project.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<ProjectStatus, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    delayed: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-300 text-gray-700',
  };

  const toggleProjectModal = () => {
    setProjectModalOpen((prev) => !prev);
  };

  const handleProjectSubmit = async (projectData: Partial<Project>) => {
    try {
      // Add project to Firestore
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: serverTimestamp(),
      });
      console.log('Project added with ID:', projectRef.id);
      toggleProjectModal();
    } catch (error) {
      console.error('Error adding project:', error);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-800">Projects</h1>
          <p className="text-secondary-500 mt-1">Manage all engineering projects</p>
        </div>
        <button onClick={toggleProjectModal} className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="input w-48"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state py-16">
          <FolderIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-description">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first project to get started'}
          </p>
          <Link to="/projects/new" className="btn-primary mt-4">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <motion.div
                whileHover={{ y: -4 }}
                className="project-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`badge ${statusColors[project.status] || statusColors.not_started}`}>
                    {(project.status || 'not_started').replace('_', ' ')}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-secondary-500">Progress</p>
                    <p className="text-lg font-semibold text-secondary-800">{project.progress || 0}%</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-secondary-800 mb-2 line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-sm text-secondary-500 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="progress-bar"
                    data-progress-width={`${project.progress || 0}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-secondary-600">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(project.endDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-secondary-600">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    UGX {(project.budget / 1000000).toFixed(1)}M
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="avatar avatar-sm bg-primary-100 text-primary-700">
                      {project.managerName?.[0]?.toUpperCase() || 'M'}
                    </div>
                    <span className="text-sm text-secondary-600">{project.managerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary-500 text-sm">
                    <UsersIcon className="w-4 h-4" />
                    {project.teamMembers?.length || 0}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={toggleProjectModal}
          onSubmit={handleProjectSubmit}
        />
      )}
    </motion.div>
  );
};

export default Projects;
