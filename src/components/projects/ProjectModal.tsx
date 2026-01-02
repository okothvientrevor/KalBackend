import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Project, ProjectStatus, User, TeamMember } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => void;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, project }) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started' as ProjectStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    budget: 0,
    managerId: '',
    managerName: '',
    teamMembers: [] as TeamMember[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'not_started',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: project.budget || 0,
        managerId: project.managerId || '',
        managerName: project.managerName || '',
        teamMembers: project.teamMembers || [],
        priority: (project as any).priority || 'medium',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 0,
        managerId: userProfile?.id || '',
        managerName: userProfile?.displayName || '',
        teamMembers: [],
        priority: 'medium',
      });
    }
  }, [project, isOpen, userProfile]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(query(collection(db, 'users')));
      setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User)));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const selectedManager = users.find((u) => u.id === formData.managerId);
    
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      managerName: selectedManager?.displayName || formData.managerName,
      progress: 0, // Start at 0% progress
      actualSpent: 0, // Start with no spending
      milestones: [], // Start with empty milestones
      attachments: [], // Start with no attachments
    });
    
    setLoading(false);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData({ ...formData, budget: value });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <Dialog.Title className="text-xl font-semibold text-secondary-800">
                    {project ? 'Edit Project' : 'Create New Project'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Close"
                    aria-label="Close"
                  >
                    <XMarkIcon className="w-5 h-5 text-secondary-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                      Project Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input min-h-[100px] resize-none"
                      placeholder="Describe the project goals and objectives..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-secondary-700 mb-2">
                        Status
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        className="input"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="delayed">Delayed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        Start Date
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        End Date
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="input"
                        min={formData.startDate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-secondary-700 mb-2">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                        Budget (UGX)
                      </label>
                      <input
                        id="budget"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.budget}
                        onChange={handleBudgetChange}
                        className="input"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="managerId" className="block text-sm font-medium text-secondary-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-1" />
                        Project Manager
                      </label>
                      <select
                        id="managerId"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        className="input"
                      >
                        <option value="">Select Manager</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.displayName || user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading || !formData.name.trim()}
                    >
                      {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProjectModal;
