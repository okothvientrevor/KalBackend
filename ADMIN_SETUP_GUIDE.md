# Administrator Setup Guide

## Initial Admin Account Creation

This guide explains how to create the first administrator account for the KAL Engineering Services internal web application.

## Overview

The application has been configured with a **temporary admin sign-up feature** that allows the creation of the first administrator account. This feature is **automatically disabled** once the first admin account is created for security purposes.

## Steps to Create the First Admin Account

### 1. Access the Registration Page

Navigate to the registration page by visiting:
```
http://localhost:5173/register
```
(Or your deployed application URL + `/register`)

### 2. Initial Setup Mode Indicator

When no admin account exists in the system, you'll see a yellow warning banner that says:

```
⚠️ Initial Setup Mode
No admin account exists. You can create the first administrator account.
```

This confirms that you can proceed with creating an admin account.

### 3. Fill in the Registration Form

- **Full Name**: Enter your full name
- **Email Address**: Use your official company email
- **Role**: Select **"Administrator (Initial Setup)"** from the dropdown
  - This option will **only** appear when no admin exists
  - Once selected, you'll see a red warning about full system access
- **Password**: Choose a strong password (minimum 6 characters)
- **Confirm Password**: Re-enter your password

### 4. Security Confirmation

When you click "Create Account" with the Admin role selected, you'll see a confirmation dialog:

```
⚠️ You are creating the initial administrator account.

This account will have full system access. Please ensure you:
• Use a strong password
• Keep these credentials secure
• Remember that this option will be disabled after the first admin is created

Do you want to continue?
```

Click **OK** to proceed or **Cancel** to abort.

### 5. Account Creation

Once confirmed:
- Your admin account will be created
- You'll see a success message: "Administrator account created successfully! Welcome to KAL Engineering."
- You'll be automatically redirected to the dashboard
- **The admin sign-up option is now permanently disabled**

## After Admin Account Creation

### What Changes?

1. **Registration Page**: The "Administrator (Initial Setup)" role option will no longer appear in the role dropdown
2. **New Users**: All subsequent user accounts must be created by administrators through the admin panel
3. **Security**: The temporary admin sign-up vulnerability is closed

### Creating Additional Users

As an administrator, you can now create users through:

1. Navigate to **Admin > User Management**
2. Click **"Create User"** button
3. Fill in user details and assign roles
4. System will generate a secure password
5. Share credentials securely with the new user

## Security Features

### Automatic Disable Mechanism

The admin sign-up feature uses Firestore queries to check if any active admin users exist:

```typescript
// Checks for existing admin users
const adminQuery = query(
  usersRef,
  where('role', '==', 'admin'),
  where('isActive', '==', true),
  limit(1)
);
```

If any admin is found, the admin sign-up option is disabled.

### Audit Logging

Admin account creation is logged in the `audit_logs` collection with:
- Event type: `admin_created`
- User ID and email
- Timestamp
- Additional context

## Troubleshooting

### Admin Option Not Appearing

**Possible Causes:**
1. An admin account already exists in the system
2. Firebase connection issues
3. Firestore rules blocking the query

**Solutions:**
1. Check Firestore console for existing users with `role: 'admin'`
2. Verify Firebase configuration in `.env` file
3. Check browser console for errors
4. Ensure Firestore security rules allow read access to users collection

### Cannot Create Admin Account

**Error:** "Failed to create account"

**Solutions:**
1. Check Firebase Authentication is enabled
2. Verify email/password auth method is enabled in Firebase Console
3. Check for validation errors (password length, email format)
4. Inspect browser console for detailed error messages

### Account Created But No Admin Access

**If you created an account before the admin was enabled:**
1. Contact your Firebase administrator
2. Manually update your user document in Firestore:
   ```json
   {
     "role": "admin",
     "isActive": true
   }
   ```
3. Sign out and sign back in

## Best Practices

### For Initial Setup

1. **Use a Strong Password**: Minimum 12 characters with mixed case, numbers, and symbols
2. **Use an Official Email**: Preferably with your company domain
3. **Document Credentials**: Store securely in a password manager
4. **Create Backup Admin**: Immediately create a second admin account as backup

### For Production Deployment

1. **Create Admin Before Going Live**: Set up the admin account during staging
2. **Remove Public Registration** (Optional): Consider disabling `/register` route after setup
3. **Monitor Audit Logs**: Regularly review admin creation logs
4. **Implement 2FA** (Future Enhancement): Add two-factor authentication for admin accounts

## Technical Details

### Files Modified

1. **`src/utils/adminSetup.ts`**: Contains admin checking logic
2. **`src/pages/auth/Register.tsx`**: Enhanced registration form with conditional admin option
3. **`src/contexts/AuthContext.tsx`**: User creation with role assignment

### Key Functions

```typescript
// Check if any admin exists
checkAdminExists(): Promise<boolean>

// Log admin creation for audit
logAdminCreation(adminId: string, adminEmail: string): Promise<void>
```

## Next Steps

After creating your first admin account:

1. ✅ Create additional admin accounts (backup)
2. ✅ Create user accounts for your team through Admin Panel
3. ✅ Set up projects and assign team members
4. ✅ Configure system settings and permissions
5. ✅ Review and customize approval workflows
6. ✅ Set up notification preferences

## Support

If you encounter any issues during admin account creation:

1. Check the browser console for error messages
2. Review Firebase Console for authentication/database errors
3. Verify environment variables are correctly set
4. Contact your system administrator or development team

---

**Important:** Keep your admin credentials secure. Admin accounts have full access to create users, manage projects, approve expenditures, and access all system data.
