import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  viewMode?: 'grid' | 'list' | 'kanban';
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange, viewMode = 'grid' }) => {
  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed',
    verified: 'Verified',
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'verified';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-4 flex items-center gap-4"
      >
        <div className="flex-1 min-w-0">
          <Link to={`/tasks/${task.id}`} className="font-medium text-secondary-800 hover:text-primary-600 truncate block">
            {task.title}
          </Link>
          <p className="text-sm text-secondary-500 truncate">{task.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`badge ${priorityColors[task.priority]}`}>{task.priority}</span>
          <div className="flex items-center gap-1 text-sm text-secondary-500">
            <CalendarIcon className="w-4 h-4" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
          <div className="flex items-center gap-1 text-sm text-secondary-500">
            <UserIcon className="w-4 h-4" />
            {task.assigneeName}
          </div>
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded hover:bg-gray-100">
              <EllipsisVerticalIcon className="w-5 h-5 text-secondary-500" />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="dropdown-menu">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => onEdit(task)} className={`dropdown-item w-full text-left ${active ? 'bg-gray-50' : ''}`}>
                      <PencilIcon className="w-4 h-4 mr-2 inline" />
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => onDelete(task.id)} className={`dropdown-item w-full text-left text-red-600 ${active ? 'bg-red-50' : ''}`}>
                      <TrashIcon className="w-4 h-4 mr-2 inline" />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="card p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`badge ${priorityColors[task.priority]}`}>
          <FlagIcon className="w-3 h-3 mr-1" />
          {task.priority}
        </span>
        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <EllipsisVerticalIcon className="w-5 h-5 text-secondary-500" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="dropdown-menu">
              <div className="py-1">
                <p className="px-4 py-1 text-xs font-medium text-secondary-400 uppercase">Change Status</p>
                {(['todo', 'in_progress', 'completed', 'verified'] as TaskStatus[]).map((status) => (
                  <Menu.Item key={status}>
                    {({ active }) => (
                      <button
                        onClick={() => onStatusChange(task.id, status)}
                        className={`dropdown-item w-full text-left ${active ? 'bg-gray-50' : ''} ${task.status === status ? 'text-primary-600 font-medium' : ''}`}
                      >
                        {statusLabels[status]}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className="border-t border-gray-100 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => onEdit(task)} className={`dropdown-item w-full text-left ${active ? 'bg-gray-50' : ''}`}>
                      <PencilIcon className="w-4 h-4 mr-2 inline" />
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => onDelete(task.id)} className={`dropdown-item w-full text-left text-red-600 ${active ? 'bg-red-50' : ''}`}>
                      <TrashIcon className="w-4 h-4 mr-2 inline" />
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <Link to={`/tasks/${task.id}`}>
        <h3 className="font-semibold text-secondary-800 mb-2 hover:text-primary-600 line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-secondary-500 mb-3 line-clamp-2">{task.description}</p>
        )}
      </Link>

      {task.projectName && (
        <div className="mb-3">
          <span className="text-xs bg-gray-100 text-secondary-600 px-2 py-1 rounded">
            {task.projectName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="avatar avatar-sm bg-primary-100 text-primary-700">
            {task.assigneeName?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-secondary-600">{task.assigneeName}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-600' : 'text-secondary-500'}`}>
          <CalendarIcon className="w-4 h-4" />
          {format(new Date(task.dueDate), 'MMM d')}
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Subtasks</span>
            <span className="text-secondary-700">
              {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length}
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(task.subtasks.filter((s) => s.isCompleted).length / task.subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
