import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, UserIcon, FlagIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Task, TaskPriority, Project, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const { userProfile: _userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: new Date().toISOString().split('T')[0],
    assigneeId: '',
    assigneeName: '',
    projectId: '',
    projectName: '',
    tags: [] as string[],
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        assigneeId: task.assigneeId || '',
        assigneeName: task.assigneeName || '',
        projectId: task.projectId || '',
        projectName: task.projectName || '',
        tags: task.tags || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assigneeId: '',
        assigneeName: '',
        projectId: '',
        projectName: '',
        tags: [],
      });
    }
  }, [task, isOpen]);

  useEffect(() => {
    fetchProjectsAndUsers();
  }, []);

  const fetchProjectsAndUsers = async () => {
    try {
      const [projectsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'projects'))),
        getDocs(query(collection(db, 'users'))),
      ]);
      setProjects(projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project)));
      setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const selectedProject = projects.find((p) => p.id === formData.projectId);
    const selectedUser = users.find((u) => u.id === formData.assigneeId);
    
    onSubmit({
      ...formData,
      dueDate: new Date(formData.dueDate),
      projectName: selectedProject?.name || '',
      assigneeName: selectedUser?.displayName || formData.assigneeName,
    });
    
    setLoading(false);
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
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <Dialog.Title className="text-xl font-semibold text-secondary-800">
                    {task ? 'Edit Task' : 'Create New Task'}
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
                    <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      placeholder="Enter task title"
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
                      placeholder="Describe the task..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 mb-2">
                        <FlagIcon className="w-4 h-4 inline mr-1" />
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-secondary-700 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        Due Date
                      </label>
                      <input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-secondary-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-1" />
                      Assignee
                    </label>
                    <select
                      id="assignee"
                      value={formData.assigneeId}
                      onChange={(e) => {
                        const user = users.find((u) => u.id === e.target.value);
                        setFormData({
                          ...formData,
                          assigneeId: e.target.value,
                          assigneeName: user?.displayName || '',
                        });
                      }}
                      className="input"
                    >
                      <option value="">Select assignee</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-secondary-700 mb-2">
                      Project (Optional)
                    </label>
                    <select
                      id="project"
                      value={formData.projectId}
                      onChange={(e) => {
                        const project = projects.find((p) => p.id === e.target.value);
                        setFormData({
                          ...formData,
                          projectId: e.target.value,
                          projectName: project?.name || '',
                        });
                      }}
                      className="input"
                    >
                      <option value="">No project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {task ? 'Updating...' : 'Creating...'}
                        </div>
                      ) : (
                        task ? 'Update Task' : 'Create Task'
                      )}
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

export default TaskModal;
