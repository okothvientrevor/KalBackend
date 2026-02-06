import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  FlagIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  BanknotesIcon,
  DocumentIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, StatusUpdate } from '../types';
import { getRoleTheme } from '../utils/roleTheme';
import { uploadFiles } from '../utils/fileUpload';
import { notifyAdminOfCompletion, notifyManagerOfUpdate } from '../utils/notifications';
import StatusUpdateModal from '../components/common/StatusUpdateModal';
import UpdateTimeline from '../components/common/UpdateTimeline';
import toast from 'react-hot-toast';

const EnhancedTaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const theme = getRoleTheme(userProfile?.role);

  const [task, setTask] = useState<Task | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Real-time listener for task
  useEffect(() => {
    if (!taskId) return;

    const taskRef = doc(db, 'tasks', taskId);
    const unsubscribe = onSnapshot(taskRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTask({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate() || new Date(),
          startDate: data.startDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Task);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [taskId]);

  // Real-time listener for status updates
  useEffect(() => {
    if (!taskId) return;

    const updatesQuery = query(
      collection(db, 'statusUpdates'),
      where('taskId', '==', taskId),
      where('entityType', '==', 'task'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(updatesQuery, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as StatusUpdate[];
      setStatusUpdates(updates);
    });

    return () => unsubscribe();
  }, [taskId]);

  const handleStatusUpdate = async (updateData: {
    status: any;
    customStatus?: string;
    message: string;
    attachments?: File[];
  }) => {
    if (!task || !currentUser || !userProfile) return;

    setSubmitting(true);
    try {
      // Upload attachments if any
      let uploadedFiles: any[] = [];
      if (updateData.attachments && updateData.attachments.length > 0) {
        uploadedFiles = await uploadFiles(
          updateData.attachments,
          `tasks/${taskId}/updates`
        );
      }

      // Create status update
      const statusUpdate = {
        status: updateData.status,
        customStatus: updateData.customStatus,
        message: updateData.message,
        userId: currentUser.uid,
        userName: userProfile.displayName || currentUser.email || 'Unknown',
        userPhotoURL: userProfile.photoURL,
        timestamp: new Date(),
        isCompleted: updateData.status === 'completed',
        attachments: uploadedFiles.map(file => ({
          id: file.url,
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
          uploadedBy: currentUser.uid,
          uploadedByName: userProfile.displayName || currentUser.email || 'Unknown',
          uploadedAt: new Date(),
        })),
        taskId: taskId!,
        entityType: 'task',
      };

      // Add to statusUpdates subcollection
      await addDoc(collection(db, 'statusUpdates'), {
        ...statusUpdate,
        timestamp: serverTimestamp(),
      });

      // If marking as completed, update task status
      if (updateData.status === 'completed') {
        await updateDoc(doc(db, 'tasks', taskId!), {
          status: 'pending_approval',
          pendingApproval: true,
          completedDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Notify admins
        await notifyAdminOfCompletion(
          taskId!,
          'task',
          task.title,
          userProfile.displayName || currentUser.email || 'Unknown'
        );

        toast.success('Task marked as completed! Awaiting admin approval.');
      } else {
        // Update task's last modified time
        await updateDoc(doc(db, 'tasks', taskId!), {
          updatedAt: serverTimestamp(),
        });

        toast.success('Status update added successfully!');
      }

      // Notify project manager if task is part of a project
      if (task.projectId) {
        // Get manager ID from project
        const projectRef = doc(db, 'projects', task.projectId);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          const managerId = projectDoc.data().managerId;
          if (managerId && managerId !== currentUser.uid) {
            const statusLabel = updateData.customStatus || updateData.status.replace('_', ' ');
            await notifyManagerOfUpdate(
              managerId,
              taskId!,
              'task',
              task.title,
              userProfile.displayName || currentUser.email || 'Unknown',
              statusLabel
            );
          }
        }
      }

      setShowStatusModal(false);
    } catch (error) {
      console.error('Error adding status update:', error);
      toast.error('Failed to add status update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!task || !currentUser || !userProfile) return;

    const confirmed = window.confirm(
      'Are you sure you want to mark this task as completed? ' +
      'This will notify the administrator for approval.'
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'tasks', taskId!), {
        status: 'pending_approval',
        pendingApproval: true,
        completedDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add completion status update
      await addDoc(collection(db, 'statusUpdates'), {
        status: 'completed',
        message: 'Task completed and submitted for approval',
        userId: currentUser.uid,
        userName: userProfile.displayName || currentUser.email || 'Unknown',
        userPhotoURL: userProfile.photoURL,
        timestamp: serverTimestamp(),
        isCompleted: true,
        taskId: taskId!,
        entityType: 'task',
      });

      // Notify admins
      await notifyAdminOfCompletion(
        taskId!,
        'task',
        task.title,
        userProfile.displayName || currentUser.email || 'Unknown'
      );

      toast.success('Task marked as completed! Awaiting admin approval.');
    } catch (error) {
      console.error('Error marking task complete:', error);
      toast.error('Failed to mark task complete');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canEdit = task && (
    userProfile?.role === 'admin' ||
    currentUser?.uid === task.assigneeId ||
    currentUser?.uid === task.creatorId
  );

  const isAssignedToUser = task && currentUser?.uid === task.assigneeId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Link to="/tasks" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-outline"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        
        {canEdit && (
          <div className="flex gap-2">
            {isAssignedToUser && task.status !== 'pending_approval' && task.status !== 'completed' && (
              <>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`btn-primary ${theme.bgPrimary}`}
                  disabled={submitting}
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Log Update
                </button>
                <button
                  onClick={handleMarkComplete}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Mark Complete
                </button>
              </>
            )}
            <Link to={`/tasks/${taskId}/edit`} className="btn-outline">
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Task Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-secondary-800 mb-2">{task.title}</h1>
            <p className="text-secondary-600">{task.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Pending Approval Badge */}
        {task.pendingApproval && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Pending Admin Approval</p>
                <p className="text-sm text-orange-600">This task is awaiting administrator review and approval.</p>
              </div>
            </div>
          </div>
        )}

        {/* Task Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${theme.light} rounded-lg`}>
              <UserIcon className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned To</p>
              <p className="font-medium text-gray-900">{task.assigneeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 ${theme.light} rounded-lg`}>
              <ClockIcon className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium text-gray-900">
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 ${theme.light} rounded-lg`}>
              <FlagIcon className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium text-gray-900">{task.creatorName}</p>
            </div>
          </div>
        </div>

        {task.projectName && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Part of Project</p>
            <Link
              to={`/projects/${task.projectId}`}
              className={`font-medium ${theme.text} hover:underline`}
            >
              {task.projectName}
            </Link>
          </div>
        )}
      </motion.div>

      {/* Status Updates Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-800">Progress Updates</h2>
          {isAssignedToUser && task.status !== 'pending_approval' && task.status !== 'completed' && (
            <button
              onClick={() => setShowStatusModal(true)}
              className={`btn-sm ${theme.bgPrimary} text-white`}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Update
            </button>
          )}
        </div>

        {statusUpdates.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No updates yet</p>
            {isAssignedToUser && (
              <button
                onClick={() => setShowStatusModal(true)}
                className={`mt-4 btn-primary ${theme.bgPrimary}`}
              >
                Add First Update
              </button>
            )}
          </div>
        ) : (
          <UpdateTimeline 
            updates={statusUpdates.map(update => ({
              id: update.id,
              status: update.customStatus || update.status.replace('_', ' '),
              message: update.message,
              timestamp: update.timestamp,
              userId: update.userId,
              userName: update.userName,
              isCompleted: update.isCompleted,
            }))}
            themeColor={theme.primary.split('-')[0]}
          />
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-secondary-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to={`/tasks/${taskId}/expenses`}
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all text-center`}
          >
            <BanknotesIcon className={`w-8 h-8 ${theme.text} mx-auto mb-2`} />
            <p className="font-medium text-secondary-800">Add Expense</p>
          </Link>
          <Link
            to={`/tasks/${taskId}/documents`}
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all text-center`}
          >
            <DocumentIcon className={`w-8 h-8 ${theme.text} mx-auto mb-2`} />
            <p className="font-medium text-secondary-800">Upload Document</p>
          </Link>
          <Link
            to={`/tasks/${taskId}/photos`}
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all text-center`}
          >
            <PhotoIcon className={`w-8 h-8 ${theme.text} mx-auto mb-2`} />
            <p className="font-medium text-secondary-800">Add Photos</p>
          </Link>
          <button
            onClick={() => setShowStatusModal(true)}
            className={`p-4 rounded-xl ${theme.light} hover:shadow-md transition-all text-center`}
            disabled={!isAssignedToUser || task.status === 'pending_approval' || task.status === 'completed'}
          >
            <PlusIcon className={`w-8 h-8 ${theme.text} mx-auto mb-2`} />
            <p className="font-medium text-secondary-800">Log Update</p>
          </button>
        </div>
      </motion.div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleStatusUpdate}
        entityType="task"
      />
    </div>
  );
};

export default EnhancedTaskDetail;
