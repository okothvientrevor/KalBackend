import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export type NotificationType = 
  | 'task_assigned' 
  | 'project_assigned'
  | 'task_completed'
  | 'project_completed'
  | 'task_approved'
  | 'task_rejected'
  | 'project_approved'
  | 'project_rejected'
  | 'status_update'
  | 'comment_added'
  | 'expense_submitted'
  | 'team_member_added';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  relatedId: string;
  relatedType: 'task' | 'project' | 'expense';
  read?: boolean;
}

/**
 * Send a notification to a user
 */
export const sendNotification = async (data: NotificationData): Promise<void> => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: data.read ?? false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send notifications to multiple users
 */
export const sendNotifications = async (notifications: NotificationData[]): Promise<void> => {
  try {
    const promises = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), {
        ...notification,
        read: notification.read ?? false,
        createdAt: serverTimestamp(),
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

/**
 * Notify admin when a task/project is marked complete
 */
export const notifyAdminOfCompletion = async (
  entityId: string,
  entityType: 'task' | 'project',
  entityName: string,
  completedByName: string
): Promise<void> => {
  try {
    // Get all admin users
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const notifications: NotificationData[] = usersSnapshot.docs.map(doc => ({
      userId: doc.id,
      type: entityType === 'task' ? 'task_completed' : 'project_completed',
      title: `${entityType === 'task' ? 'Task' : 'Project'} Completed`,
      message: `${completedByName} marked "${entityName}" as completed. Please review and approve.`,
      link: `/${entityType}s/${entityId}`,
      relatedId: entityId,
      relatedType: entityType,
    }));

    await sendNotifications(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

/**
 * Notify user when assigned to a task/project
 */
export const notifyUserOfAssignment = async (
  userId: string,
  entityId: string,
  entityType: 'task' | 'project',
  entityName: string,
  assignedByName: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: entityType === 'task' ? 'task_assigned' : 'project_assigned',
    title: `New ${entityType === 'task' ? 'Task' : 'Project'} Assigned`,
    message: `${assignedByName} assigned you to "${entityName}".`,
    link: `/${entityType}s/${entityId}`,
    relatedId: entityId,
    relatedType: entityType,
  });
};

/**
 * Notify user when their task/project is approved
 */
export const notifyUserOfApproval = async (
  userId: string,
  entityId: string,
  entityType: 'task' | 'project',
  entityName: string,
  approvedByName: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: entityType === 'task' ? 'task_approved' : 'project_approved',
    title: `${entityType === 'task' ? 'Task' : 'Project'} Approved`,
    message: `${approvedByName} approved your completion of "${entityName}".`,
    link: `/${entityType}s/${entityId}`,
    relatedId: entityId,
    relatedType: entityType,
  });
};

/**
 * Notify user when their task/project is rejected
 */
export const notifyUserOfRejection = async (
  userId: string,
  entityId: string,
  entityType: 'task' | 'project',
  entityName: string,
  rejectedByName: string,
  reason: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: entityType === 'task' ? 'task_rejected' : 'project_rejected',
    title: `${entityType === 'task' ? 'Task' : 'Project'} Needs Revision`,
    message: `${rejectedByName} requested changes to "${entityName}": ${reason}`,
    link: `/${entityType}s/${entityId}`,
    relatedId: entityId,
    relatedType: entityType,
  });
};

/**
 * Notify project manager when a team member adds a status update
 */
export const notifyManagerOfUpdate = async (
  managerId: string,
  entityId: string,
  entityType: 'task' | 'project',
  entityName: string,
  updatedByName: string,
  status: string
): Promise<void> => {
  await sendNotification({
    userId: managerId,
    type: 'status_update',
    title: 'Status Update',
    message: `${updatedByName} updated "${entityName}": ${status}`,
    link: `/${entityType}s/${entityId}`,
    relatedId: entityId,
    relatedType: entityType,
  });
};
