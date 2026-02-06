import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

/**
 * Upload files to Firebase Storage with proper error handling
 * @param files - Array of files to upload
 * @param path - Storage path (e.g., 'tasks/taskId/updates' or 'projects/projectId/documents')
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Array of uploaded file metadata
 */
export const uploadFiles = async (
  files: File[],
  path: string,
  onProgress?: (progress: number, fileName: string) => void
): Promise<Array<{ name: string; url: string; type: string; size: number }>> => {
  const results: Array<{ name: string; url: string; type: string; size: number }> = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadFile(file, path, (fileProgress) => {
        // Calculate overall progress
        const overallProgress = ((i + fileProgress / 100) / files.length) * 100;
        if (onProgress) {
          onProgress(overallProgress, file.name);
        }
      });
      results.push(result);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      toast.error(`Failed to upload ${file.name}`);
      throw error;
    }
  }

  return results;
};

/**
 * Upload a single file to Firebase Storage with retry logic
 * @param file - File to upload
 * @param path - Storage path
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Uploaded file metadata
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{ name: string; url: string; type: string; size: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const fileId = uuidv4();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${fileId}_${sanitizedName}`;
      const filePath = `${path}/${fileName}`;
      
      const storageRef = ref(storage, filePath);
      
      // Use uploadBytesResumable for better error handling and progress tracking
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          let errorMessage = 'Failed to upload file';
          
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = 'You do not have permission to upload files. Please check Firebase Storage rules.';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was cancelled';
              break;
            case 'storage/unknown':
              errorMessage = 'An unknown error occurred. This might be a CORS issue. Please check your Firebase Storage CORS configuration.';
              break;
            case 'storage/retry-limit-exceeded':
              errorMessage = 'Upload failed after multiple retries. Please check your internet connection.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        async () => {
          // Upload complete, get download URL
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              name: file.name,
              url,
              type: file.type,
              size: file.size,
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get file URL'));
          }
        }
      );
    } catch (error) {
      console.error('Error initiating upload:', error);
      reject(error);
    }
  });
};
