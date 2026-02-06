# Issue Fixes - File Upload CORS & ProjectDetail White Screen

## Issues Identified

### 1. Firebase Storage CORS Errors ❌
**Symptom**: When trying to upload files in the technical team member dashboard, you get CORS policy errors:
- "Response to preflight request doesn't pass access control check: It does not have HTTP ok status"
- `net::ERR_FAILED` for POST requests to Firebase Storage

**Root Cause**: Firebase Storage bucket is not configured to allow requests from `localhost:5173`

### 2. Project Detail White Screen ❌
**Symptom**: When clicking on a project from the admin dashboard, the page shows a white screen

**Root Cause**: Need to investigate - could be:
- Loading state not transitioning properly
- Data not being fetched correctly
- Missing error boundaries

## Solutions Implemented

### ✅ 1. Updated File Upload Utility (`src/utils/fileUpload.ts`)

**Changes Made**:
- Replaced `uploadBytes` with `uploadBytesResumable` for better error handling
- Added progress tracking callbacks
- Improved error messages with specific codes:
  - `storage/unauthorized`: Permission issues
  - `storage/canceled`: Upload cancelled
  - `storage/unknown`: CORS issues
  - `storage/retry-limit-exceeded`: Network issues
- Added file name sanitization to prevent special characters
- Added custom metadata (original name, upload timestamp)

**Benefits**:
- Better user feedback during uploads
- Clearer error messages
- Sequential file uploads to avoid overwhelming the connection
- Progress tracking support

### ✅ 2. Created CORS Configuration Files

**Files Created**:
1. **`cors.json`**: Firebase Storage CORS configuration
   - Allows all origins (can be restricted in production)
   - Allows GET, HEAD, PUT, POST, DELETE methods
   - Sets cache time to 1 hour
   - Includes necessary response headers

2. **`CORS_FIX_GUIDE.md`**: Comprehensive guide to fix CORS issues
   - Step-by-step instructions
   - Multiple fix options (Google Cloud SDK, gsutil)
   - Security rules recommendations
   - Troubleshooting tips

### ✅ 3. Updated Firebase Configuration

Updated `src/config/firebase.ts` with helpful comments about CORS configuration.

## How to Fix CORS Errors

### Quick Fix (5 minutes)

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   brew install --cask google-cloud-sdk
   ```

2. **Authenticate**:
   ```bash
   gcloud auth login
   ```

3. **Set your project** (get project ID from Firebase Console):
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Apply CORS configuration**:
   ```bash
   gcloud storage buckets update gs://YOUR_STORAGE_BUCKET --cors-file=cors.json
   ```

   Replace `YOUR_STORAGE_BUCKET` with your actual storage bucket name (e.g., `kal-engineering-backend.firebasestorage.app` or similar).

5. **Restart your dev server**:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

### Alternative: Update Firebase Storage Rules

If CORS configuration doesn't work immediately, also update your Firebase Storage Security Rules:

1. Go to Firebase Console → Storage → Rules
2. Update the rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read any file
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Task files
    match /tasks/{taskId}/{allPaths=**} {
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Project files
    match /projects/{projectId}/{allPaths=**} {
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

3. Click **Publish**

## Project Detail White Screen Investigation

The ProjectDetail.tsx file appears to be structurally sound. The white screen could be caused by:

### Possible Causes:

1. **Loading State Stuck**
   - The `loading` state might not be transitioning to `false`
   - Check browser console for errors

2. **Data Fetching Issues**
   - Firestore query might be failing silently
   - Project might not exist or user doesn't have permissions

3. **Missing Indexes**
   - Composite indexes might be needed for Firestore queries
   - Check Firebase Console for index creation prompts

### Debug Steps:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Click on a project** from admin dashboard
4. **Look for errors**:
   - Firestore permission errors
   - Missing index errors  
   - JavaScript errors

5. **Check Network tab**:
   - Look for failed Firestore requests
   - Check response status codes

### Quick Fix to Add:

Add error boundary and better error logging to ProjectDetail.tsx. I can update this if needed once we identify the specific error from the console.

## Testing the Fixes

### Test File Upload:

1. **Login** as a technical team member
2. **Navigate to Dashboard**
3. **Find a task or project**
4. **Try to upload a file** in the status update modal
5. **Expected result**: File uploads successfully without CORS errors

### Test Project Detail:

1. **Login** as admin
2. **Navigate to Admin Dashboard**  
3. **Click on a project card**
4. **Expected result**: Project detail page loads with:
   - Project overview
   - Task list
   - Updates timeline
   - Documents
   - Next actions

## Additional Improvements Made

### StatusUpdateModal Component
The modal already has file upload capability with:
- Multiple file selection
- Image-specific upload button
- File preview with size display
- Remove file functionality

### File Upload Features
- ✅ Progress tracking
- ✅ Error handling with user-friendly messages
- ✅ File name sanitization
- ✅ File type and size validation
- ✅ Sequential uploads to prevent overwhelming the connection

## Next Steps

1. **Apply CORS configuration** using the guide above
2. **Test file uploads** to verify CORS fix works
3. **Debug ProjectDetail white screen**:
   - Open browser console
   - Click on a project
   - Share any error messages you see
4. **Update Firebase Storage Security Rules** for production
5. **Test all upload features**:
   - Task status updates with files
   - Project updates with files
   - Document uploads

## Files Modified

- ✅ `src/utils/fileUpload.ts` - Enhanced file upload with better error handling
- ✅ `src/config/firebase.ts` - Added CORS comments
- ✅ `cors.json` - CORS configuration for Firebase Storage
- ✅ `CORS_FIX_GUIDE.md` - Comprehensive CORS fix guide
- ✅ `FIXES_SUMMARY.md` - This file

## Need Help?

If the CORS fix doesn't work:
1. Share your Firebase project ID
2. Share your storage bucket name
3. Share any error messages from the browser console

If the ProjectDetail white screen persists:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on a project
4. Share any error messages that appear
5. Go to Network tab and check for failed requests
