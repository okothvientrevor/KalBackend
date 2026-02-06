import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload files to Firebase Storage
 * @param files - Array of files to upload
 * @param path - Storage path (e.g., 'tasks/taskId/updates' or 'projects/projectId/documents')
 * @returns Array of uploaded file metadata
 */
export const uploadFiles = async (
  files: File[],
  path: string
): Promise<Array<{ name: string; url: string; type: string; size: number }>> => {
  const uploadPromises = files.map(async (file) => {
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = `${path}/${fileName}`;
    
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return {
      name: file.name,
      url,
      type: file.type,
      size: file.size,
    };
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload a single file to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path
 * @returns Uploaded file metadata
 */
export const uploadFile = async (
  file: File,
  path: string
): Promise<{ name: string; url: string; type: string; size: number }> => {
  const fileId = uuidv4();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${fileId}.${fileExtension}`;
  const filePath = `${path}/${fileName}`;
  
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    name: file.name,
    url,
    type: file.type,
    size: file.size,
  };
};
