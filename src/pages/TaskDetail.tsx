import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  PlusIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Menu, Transition, Tab } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  Update, 
  NextAction,
  Attachment,
} from '../types';
import { format, formatDistanceToNow } from 'date-fns';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { currentUser, userProfile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [nextActions, setNextActions] = useState<NextAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!taskId || !currentUser) return;

    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(db, 'tasks', taskId));
        if (taskDoc.exists()) {
          const taskData = { id: taskDoc.id, ...taskDoc.data() } as Task;
          setTask({
            ...taskData,
            dueDate: taskData.dueDate instanceof Date ? taskData.dueDate : (taskData.dueDate as any)?.toDate?.() || new Date(taskData.dueDate as any),
            startDate: taskData.startDate instanceof Date ? taskData.startDate : (taskData.startDate as any)?.toDate?.() || (taskData.startDate ? new Date(taskData.startDate as any) : undefined),
            completedDate: taskData.completedDate instanceof Date ? taskData.completedDate : (taskData.completedDate as any)?.toDate?.() || (taskData.completedDate ? new Date(taskData.completedDate as any) : undefined),
            createdAt: taskData.createdAt instanceof Date ? taskData.createdAt : (taskData.createdAt as any)?.toDate?.() || new Date(taskData.createdAt as any),
            updatedAt: taskData.updatedAt instanceof Date ? taskData.updatedAt : (taskData.updatedAt as any)?.toDate?.() || new Date(taskData.updatedAt as any),
          });
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();

    // Listen for updates
    const updatesQuery = query(
      collection(db, 'taskUpdates'),
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUpdates = onSnapshot(updatesQuery, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      })) as Update[];
      setUpdates(updatesData);
    });

    // Listen for next actions
    const actionsQuery = query(
      collection(db, 'nextActions'),
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeActions = onSnapshot(actionsQuery, (snapshot) => {
      const actionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
      })) as NextAction[];
      setNextActions(actionsData);
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeActions();
    };
  }, [taskId, currentUser]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !currentUser) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        ...(newStatus === 'completed' && { completedDate: Timestamp.now() }),
        updatedAt: Timestamp.now(),
      });

      // Add status change update
      await addDoc(collection(db, 'taskUpdates'), {
        taskId: task.id,
        projectId: task.projectId,
        title: 'Status Updated',
        content: `Task status changed from ${task.status ? task.status.replace('_', ' ') : 'unknown'} to ${newStatus.replace('_', ' ')}`,
        type: 'status_change',
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'User',
        authorPhotoURL: userProfile?.photoURL || currentUser.photoURL,
        previousValue: task.status,
        newValue: newStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task || !currentUser) return;

    setUpdating(true);
    try {
      await addDoc(collection(db, 'taskUpdates'), {
        taskId: task.id,
        projectId: task.projectId,
        title: 'Comment Added',
        content: newComment.trim(),
        type: 'comment',
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'User',
        authorPhotoURL: userProfile?.photoURL || currentUser.photoURL,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNextAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !task || !currentUser) return;

    setUpdating(true);
    try {
      await addDoc(collection(db, 'nextActions'), {
        taskId: task.id,
        projectId: task.projectId,
        title: newActionTitle.trim(),
        description: newActionDescription.trim(),
        priority: 'medium' as TaskPriority,
        isCompleted: false,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
      });

      setNewActionTitle('');
      setNewActionDescription('');
    } catch (error) {
      console.error('Error adding next action:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteAction = async (actionId: string) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'nextActions', actionId), {
        isCompleted: true,
        completedAt: Timestamp.now(),
        completedBy: currentUser.uid,
      });
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !task || !currentUser) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `tasks/${task.id}/documents/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const attachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          uploadedBy: currentUser.uid,
          uploadedByName: userProfile?.displayName || currentUser.displayName || 'User',
          uploadedAt: new Date(),
          category: 'document',
        };

        // Update task with new attachment
        const updatedAttachments = [...(task.attachments || []), attachment];
        await updateDoc(doc(db, 'tasks', task.id), {
          attachments: updatedAttachments,
          updatedAt: Timestamp.now(),
        });

        // Add document upload update
        await addDoc(collection(db, 'taskUpdates'), {
          taskId: task.id,
          projectId: task.projectId,
          title: 'Document Uploaded',
          content: `Uploaded document: ${file.name}`,
          type: 'document_upload',
          authorId: currentUser.uid,
          authorName: userProfile?.displayName || currentUser.displayName || 'User',
          authorPhotoURL: userProfile?.photoURL || currentUser.photoURL,
          attachments: [attachment],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        setTask({ ...task, attachments: updatedAttachments });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: 'text-green-700 bg-green-100',
      medium: 'text-blue-700 bg-blue-100',
      high: 'text-orange-700 bg-orange-100',
      critical: 'text-red-700 bg-red-100',
    };
    return colors[priority];
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      todo: 'text-gray-700 bg-gray-100',
      in_progress: 'text-blue-700 bg-blue-100',
      completed: 'text-green-700 bg-green-100',
      verified: 'text-purple-700 bg-purple-100',
      pending_approval: 'text-yellow-700 bg-yellow-100',
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'comment':
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'document_upload':
        return <DocumentIcon className="w-5 h-5" />;
      case 'progress_update':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'milestone':
        return <FlagIcon className="w-5 h-5" />;
      default:
        return <ClipboardDocumentListIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Task not found</h2>
        <p className="text-gray-500 mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/tasks" className="btn-primary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Tasks
        </Link>
      </motion.div>
    );
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'verified';

  const tabs = [
    { name: 'Overview', icon: ClipboardDocumentListIcon },
    { name: 'Updates', icon: ChatBubbleLeftRightIcon },
    { name: 'Documents', icon: DocumentIcon },
    { name: 'Next Actions', icon: FlagIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/tasks"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-800">{task.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${getPriorityColor(task.priority)}`}>
                <FlagIcon className="w-3 h-3 mr-1" />
                {task.priority}
              </span>
              <span className={`badge ${getStatusColor(task.status)}`}>
                {task.status ? task.status.replace('_', ' ') : 'Unknown'}
              </span>
              {task.projectName && (
                <Link 
                  to={`/projects/${task.projectId}`}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-secondary-600 px-2 py-1 rounded transition-colors"
                >
                  <FolderIcon className="w-4 h-4 mr-1 inline" />
                  {task.projectName}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button className="btn-secondary">
              Change Status
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
                {(['todo', 'in_progress', 'completed', 'verified'] as TaskStatus[]).map((status) => (
                  <Menu.Item key={status}>
                    {({ active }) => (
                      <button
                        onClick={() => handleStatusChange(status)}
                        disabled={updating}
                        className={`dropdown-item w-full text-left ${active ? 'bg-gray-50' : ''} ${
                          task.status === status ? 'text-primary-600 font-medium' : ''
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Task Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Assigned To</h3>
              <p className="text-secondary-600">{task.assigneeName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Due Date</h3>
              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-secondary-600'}`}>
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Time Tracking</h3>
              <p className="text-secondary-600">
                {task.actualHours || 0}h / {task.estimatedHours || 0}h estimated
              </p>
            </div>
          </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((task.actualHours || 0) / (task.estimatedHours || 1)) * 100, 100)}%` 
                }}
              />
            </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Progress</h3>
              <p className="text-secondary-600">
                {task.subtasks ? 
                  `${task.subtasks.filter(s => s.isCompleted).length}/${task.subtasks.length} subtasks` 
                  : 'No subtasks'
                }
              </p>
            </div>
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100}%` 
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-800 mb-3">Description</h3>
          <p className="text-secondary-600 whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="card p-6">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                   ${selected
                    ? 'bg-white text-primary-700 shadow'
                    : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                   }`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Overview Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Subtasks</h4>
                    <div className="space-y-2">
                      {task.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <button className="flex-shrink-0">
                            {subtask.isCompleted ? (
                              <CheckCircleIconSolid className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </button>
                          <span className={`${subtask.isCompleted ? 'text-secondary-500 line-through' : 'text-secondary-700'}`}>
                            {subtask.title}
                          </span>
                          {subtask.completedAt && (
                            <span className="text-xs text-secondary-400">
                              Completed {formatDistanceToNow(new Date(subtask.completedAt))} ago
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Task Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Created by:</span>
                        <span className="text-secondary-700">{task.creatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Created:</span>
                        <span className="text-secondary-700">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Last updated:</span>
                        <span className="text-secondary-700">{format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                      </div>
                      {task.completedDate && (
                        <div className="flex justify-between">
                          <span className="text-secondary-500">Completed:</span>
                          <span className="text-secondary-700">{format(new Date(task.completedDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-secondary-500 text-sm">No tags assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Updates Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="bg-gray-50 p-4 rounded-lg">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an update or comment..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        aria-label="Upload files for task"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles}
                        className="btn-secondary text-sm"
                      >
                        <DocumentIcon className="w-4 h-4 mr-1" />
                        Attach Files
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || updating}
                      className="btn-primary"
                    >
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                      Post Update
                    </button>
                  </div>
                </form>

                {/* Updates Timeline */}
                <div className="space-y-4">
                  {updates.map((update) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0">
                        {update.authorPhotoURL ? (
                          <img
                            src={update.authorPhotoURL}
                            alt={update.authorName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {update.authorName[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-lg ${
                              update.type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                              update.type === 'comment' ? 'bg-green-100 text-green-600' :
                              update.type === 'document_upload' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getUpdateIcon(update.type)}
                            </div>
                            <span className="font-medium text-secondary-800">{update.authorName}</span>
                            <span className="text-sm text-secondary-500">
                              {formatDistanceToNow(new Date(update.createdAt))} ago
                            </span>
                          </div>
                          <h4 className="font-semibold text-secondary-800 mb-2">{update.title}</h4>
                          <p className="text-secondary-600 whitespace-pre-wrap">{update.content}</p>
                          
                          {update.attachments && update.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex flex-wrap gap-2">
                                {update.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                                  >
                                    <DocumentIcon className="w-4 h-4 text-secondary-500" />
                                    {attachment.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {updates.length === 0 && (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-secondary-500">No updates yet. Be the first to add one!</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* Documents Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-secondary-800 mb-2">Upload Documents</h4>
                    <p className="text-sm text-secondary-500 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      aria-label="Upload documents for task"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFiles}
                      className="btn-primary"
                    >
                      {uploadingFiles ? 'Uploading...' : 'Choose Files'}
                    </button>
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                  {task.attachments && task.attachments.length > 0 ? (
                    task.attachments.map((attachment) => (
                      <div key={attachment.id} className="card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DocumentIcon className="w-8 h-8 text-secondary-500" />
                          <div>
                            <h4 className="font-medium text-secondary-800">{attachment.name}</h4>
                            <p className="text-sm text-secondary-500">
                              Uploaded by {attachment.uploadedByName} on {format(new Date(attachment.uploadedAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-secondary-500">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* Next Actions Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* Add Next Action Form */}
                <form onSubmit={handleAddNextAction} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-secondary-800 mb-3">Add Next Action</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newActionTitle}
                      onChange={(e) => setNewActionTitle(e.target.value)}
                      placeholder="Action title..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <textarea
                      value={newActionDescription}
                      onChange={(e) => setNewActionDescription(e.target.value)}
                      placeholder="Action description (optional)..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={2}
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newActionTitle.trim() || updating}
                        className="btn-primary"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Action
                      </button>
                    </div>
                  </div>
                </form>

                {/* Next Actions List */}
                <div className="space-y-3">
                  {nextActions.map((action) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleCompleteAction(action.id)}
                            disabled={action.isCompleted}
                            className="flex-shrink-0 mt-1"
                          >
                            {action.isCompleted ? (
                              <CheckCircleIconSolid className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${action.isCompleted ? 'line-through text-secondary-500' : 'text-secondary-800'}`}>
                              {action.title}
                            </h4>
                            {action.description && (
                              <p className={`text-sm mt-1 ${action.isCompleted ? 'text-secondary-400' : 'text-secondary-600'}`}>
                                {action.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-secondary-500">
                              <span>Created {formatDistanceToNow(new Date(action.createdAt))} ago</span>
                              {action.isCompleted && action.completedAt && (
                                <span>Completed {formatDistanceToNow(new Date(action.completedAt))} ago</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {nextActions.length === 0 && (
                    <div className="text-center py-8">
                      <FlagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-secondary-500">No next actions defined yet</p>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </motion.div>
  );
};

export default TaskDetail;
