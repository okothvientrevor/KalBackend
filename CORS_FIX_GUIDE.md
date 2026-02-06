# Firebase Storage CORS Configuration Guide

## Issue
You're experiencing CORS (Cross-Origin Resource Sharing) errors when uploading files to Firebase Storage from `localhost:5173`. This is a common issue when your Firebase Storage bucket doesn't allow requests from your local development server.

## Quick Fix

### Option 1: Using Google Cloud Console (Recommended for Production)

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Set your project** (replace with your Firebase project ID):
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Apply CORS configuration**:
   ```bash
   gcloud storage buckets update gs://YOUR_STORAGE_BUCKET --cors-file=cors.json
   ```

### Option 2: Using gsutil (Alternative)

1. **Install gsutil** (part of Google Cloud SDK)

2. **Apply CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET
   ```

3. **Verify CORS configuration**:
   ```bash
   gsutil cors get gs://YOUR_STORAGE_BUCKET
   ```

### Option 3: Temporary Fix for Development (Not Recommended for Production)

Update your Firebase Storage Security Rules to allow all uploads temporarily:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firebase Storage Security Rules (Recommended)

Update your Firebase Storage rules to be more specific:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read any file
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Task documents
    match /tasks/{taskId}/documents/{fileName} {
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Task updates
    match /tasks/{taskId}/updates/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Project documents
    match /projects/{projectId}/documents/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;
    }
    
    // Project updates
    match /projects/{projectId}/updates/{fileName} {
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;
    }
    
    // User avatars
    match /users/{userId}/avatar/{fileName} {
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024; // 2MB limit
    }
  }
}
```

## Troubleshooting

### If CORS errors persist:

1. **Clear browser cache** and restart your dev server:
   ```bash
   # Stop the dev server, then:
   npm run dev
   ```

2. **Check your Firebase project ID**:
   - Go to Firebase Console → Project Settings
   - Verify the Storage Bucket name matches your configuration

3. **Verify Storage is enabled**:
   - Go to Firebase Console → Storage
   - Make sure Storage is initialized for your project

4. **Check browser console** for specific error messages

5. **Test with a different browser** to rule out caching issues

## What Changed

1. **Updated `src/utils/fileUpload.ts`**:
   - Added `uploadBytesResumable` for better error handling
   - Added progress tracking
   - Improved error messages for different failure scenarios
   - Added retry logic for failed uploads

2. **Updated `src/config/firebase.ts`**:
   - Added comments about CORS configuration

3. **Created `cors.json`**:
   - CORS configuration file for your Firebase Storage bucket

## Next Steps

1. Apply the CORS configuration using one of the methods above
2. Update your Firebase Storage Security Rules
3. Restart your development server
4. Try uploading a file again

## Common Error Messages

- **"Response to preflight request doesn't pass access control check"**: Apply CORS configuration
- **"storage/unauthorized"**: Update Firebase Storage Security Rules
- **"storage/unknown"**: Usually a CORS issue, apply CORS configuration
- **"storage/retry-limit-exceeded"**: Check your internet connection or CORS configuration

## Additional Resources

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS Documentation](https://cloud.google.com/storage/docs/configuring-cors)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
