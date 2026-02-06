import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore timestamp to Date, with fallbacks
 */
export const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  if (timestamp) {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * Convert Date to Firestore timestamp
 */
export const toFirestoreTimestamp = (date?: Date | null): Timestamp | null => {
  if (!date) return null;
  return Timestamp.fromDate(date);
};

/**
 * Safe array access with fallback
 */
export const safeArray = <T>(arr: T[] | undefined | null): T[] => {
  return arr || [];
};

/**
 * Generate a random ID for temporary use
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format bytes to human readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is an image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
  return docExtensions.includes(getFileExtension(filename));
};
