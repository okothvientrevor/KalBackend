import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentIcon,
  PlusIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Menu, Transition, Tab } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import {
  Project,
  ProjectStatus,
  Update,
  NextAction,
  TaskPriority,
  Task,
} from '../types';
import { format, formatDistanceToNow } from 'date-fns';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser, userProfile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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
    if (!projectId || !currentUser) return;

    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
          setProject({
            ...projectData,
            startDate: projectData.startDate instanceof Date ? projectData.startDate : (projectData.startDate as any)?.toDate?.() || new Date(projectData.startDate as any),
            endDate: projectData.endDate instanceof Date ? projectData.endDate : (projectData.endDate as any)?.toDate?.() || new Date(projectData.endDate as any),
            actualEndDate: projectData.actualEndDate instanceof Date ? projectData.actualEndDate : (projectData.actualEndDate as any)?.toDate?.() || (projectData.actualEndDate ? new Date(projectData.actualEndDate as any) : undefined),
            createdAt: projectData.createdAt instanceof Date ? projectData.createdAt : (projectData.createdAt as any)?.toDate?.() || new Date(projectData.createdAt as any),
            updatedAt: projectData.updatedAt instanceof Date ? projectData.updatedAt : (projectData.updatedAt as any)?.toDate?.() || new Date(projectData.updatedAt as any),
            milestones: (projectData.milestones || []).map((milestone) => ({
              ...milestone,
              dueDate: milestone.dueDate instanceof Date ? milestone.dueDate : (milestone.dueDate as any)?.toDate?.() || new Date(milestone.dueDate as any),
              completedDate: milestone.completedDate instanceof Date ? milestone.completedDate : (milestone.completedDate as any)?.toDate?.() || (milestone.completedDate ? new Date(milestone.completedDate as any) : undefined),
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate,
          startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
          completedDate: doc.data().completedDate?.toDate?.() || doc.data().completedDate,
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchProject();
    fetchTasks();

    // Listen for updates
    const updatesQuery = query(
      collection(db, 'projectUpdates'),
      where('projectId', '==', projectId),
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
      where('projectId', '==', projectId),
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
  }, [projectId, currentUser]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !currentUser) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        status: newStatus,
        ...(newStatus === 'completed' && { actualEndDate: Timestamp.now() }),
        updatedAt: Timestamp.now(),
      });

      // Add status change update
      await addDoc(collection(db, 'projectUpdates'), {
        projectId: project.id,
        title: 'Status Updated',
        content: `Project status changed from ${project.status ? project.status.replace('_', ' ') : 'unknown'} to ${newStatus.replace('_', ' ')}`,
        type: 'status_change',
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'User',
        authorPhotoURL: userProfile?.photoURL || currentUser.photoURL,
        previousValue: project.status,
        newValue: newStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setProject({ ...project, status: newStatus });
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project || !currentUser) return;

    setUpdating(true);
    try {
      await addDoc(collection(db, 'projectUpdates'), {
        projectId: project.id,
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
    if (!newActionTitle.trim() || !project || !currentUser) return;

    setUpdating(true);
    try {
      await addDoc(collection(db, 'nextActions'), {
        projectId: project.id,
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
    if (!files || !project || !currentUser) return;

    setUploadingFiles(true);
    try {
      for (const file of Array.from(files)) {
        const storageRef = ref(storage, `projects/${project.id}/documents/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const attachment = {
          id: Date.now().toString(),
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          uploadedBy: currentUser.uid,
          uploadedByName: userProfile?.displayName || currentUser.displayName || 'User',
          uploadedAt: new Date(),
          category: 'document' as const,
        };

        // Update project with new attachment
        const updatedAttachments = [...(project.attachments || []), attachment];
        await updateDoc(doc(db, 'projects', project.id), {
          attachments: updatedAttachments,
          updatedAt: Timestamp.now(),
        });

        // Add document upload update
        await addDoc(collection(db, 'projectUpdates'), {
          projectId: project.id,
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

        setProject({ ...project, attachments: updatedAttachments });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      not_started: 'text-gray-700 bg-gray-100',
      active: 'text-blue-700 bg-blue-100',
      on_hold: 'text-yellow-700 bg-yellow-100',
      delayed: 'text-orange-700 bg-orange-100',
      completed: 'text-green-700 bg-green-100',
      cancelled: 'text-red-700 bg-red-100',
      pending_approval: 'text-purple-700 bg-purple-100',
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
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

  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'verified');
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  const getBudgetUsageColor = () => {
    if (!project) return 'bg-gray-400';
    const percentage = (project.actualSpent / project.budget) * 100;
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/projects" className="btn-primary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Projects
        </Link>
      </motion.div>
    );
  }

  const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'completed' && project.status !== 'cancelled';
  const progress = calculateProgress();

  const tabs = [
    { name: 'Overview', icon: ClipboardDocumentListIcon },
    { name: 'Tasks', icon: CheckCircleIcon },
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
            to="/projects"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-800">{project.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${getStatusColor(project.status)}`}>
                {project.status ? project.status.replace('_', ' ') : 'Unknown'}
              </span>
              {project.clientName && (
                <span className="text-sm bg-gray-100 text-secondary-600 px-2 py-1 rounded">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1 inline" />
                  {project.clientName}
                </span>
              )}
              {project.location && (
                <span className="text-sm text-secondary-500">📍 {project.location}</span>
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
                {(['not_started', 'active', 'on_hold', 'delayed', 'completed', 'cancelled'] as ProjectStatus[]).map((status) => (
                  <Menu.Item key={status}>
                    {({ active }) => (
                      <button
                        onClick={() => handleStatusChange(status)}
                        disabled={updating}
                        className={`dropdown-item w-full text-left ${active ? 'bg-gray-50' : ''} ${
                          project.status === status ? 'text-primary-600 font-medium' : ''
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

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{progress}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-secondary-500 mt-2">
            {tasks.filter(t => t.status === 'completed' || t.status === 'verified').length} of {tasks.length} tasks completed
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Budget</h3>
              <p className="text-lg font-bold text-green-600">
                ${project.actualSpent.toLocaleString()} / ${project.budget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getBudgetUsageColor()}`}
              style={{ width: `${Math.min((project.actualSpent / project.budget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-secondary-500 mt-2">
            {Math.round((project.actualSpent / project.budget) * 100)}% used
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Timeline</h3>
              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-secondary-600'}`}>
                Due {format(new Date(project.endDate), 'MMM d, yyyy')}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
          </div>
          <div className="text-xs text-secondary-500">
            Started: {format(new Date(project.startDate), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-800">Team</h3>
              <p className="text-2xl font-bold text-purple-600">{project.teamMembers?.length || 0}</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {project.teamMembers?.slice(0, 4).map((member) => (
              <div
                key={member.userId}
                className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
                title={member.userName}
              >
                {member.userName[0]?.toUpperCase() || 'U'}
              </div>
            ))}
            {(project.teamMembers?.length || 0) > 4 && (
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                +{(project.teamMembers?.length || 0) - 4}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-800 mb-3">Project Description</h3>
          <p className="text-secondary-600 whitespace-pre-wrap">{project.description}</p>
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
                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Project Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Manager:</span>
                        <span className="text-secondary-700">{project.managerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Client:</span>
                        <span className="text-secondary-700">{project.clientName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Contact:</span>
                        <span className="text-secondary-700">{project.clientContact || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Created:</span>
                        <span className="text-secondary-700">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Last updated:</span>
                        <span className="text-secondary-700">{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Budget Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Total Budget:</span>
                        <span className="text-secondary-700 font-medium">${project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Spent:</span>
                        <span className="text-secondary-700">${project.actualSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-500">Remaining:</span>
                        <span className={`font-medium ${project.budget - project.actualSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(project.budget - project.actualSpent).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {milestone.isCompleted ? (
                              <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${milestone.isCompleted ? 'line-through text-secondary-500' : 'text-secondary-800'}`}>
                              {milestone.title}
                            </h5>
                            {milestone.description && (
                              <p className="text-sm text-secondary-600 mt-1">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-secondary-500">
                              <span>Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}</span>
                              {milestone.completedDate && (
                                <span>Completed: {format(new Date(milestone.completedDate), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary-800 mb-3">Team Members</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.teamMembers.map((member) => (
                        <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                            {member.userName[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h5 className="font-medium text-secondary-800">{member.userName}</h5>
                            <p className="text-sm text-secondary-500">{member.role}</p>
                            <p className="text-xs text-secondary-400">
                              Added {format(new Date(member.assignedAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>

            {/* Tasks Tab */}
            <Tab.Panel>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-secondary-800">Project Tasks ({tasks.length})</h4>
                  <Link to="/tasks/new" className="btn-primary text-sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Task
                  </Link>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-secondary-800">{task.title}</h5>
                          {task.description && (
                            <p className="text-sm text-secondary-600 mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`badge text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-secondary-500">
                              Due: {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                            <span className="text-xs text-secondary-500">
                              Assigned to: {task.assigneeName}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`badge ${
                            task.status === 'todo' ? 'bg-gray-100 text-gray-700' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {tasks.length === 0 && (
                    <div className="text-center py-8">
                      <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-secondary-500">No tasks created for this project yet</p>
                    </div>
                  )}
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
                    placeholder="Add a project update or comment..."
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
                        aria-label="Upload files for project"
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
                      aria-label="Upload documents for project"
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
                  {project.attachments && project.attachments.length > 0 ? (
                    project.attachments.map((attachment) => (
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

export default ProjectDetail;
