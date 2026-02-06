import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Check if any admin user exists in the system
 * This is used to enable/disable the admin sign-up option
 */
export const checkAdminExists = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking for existing admin users...');
    const usersRef = collection(db, 'users');
    const adminQuery = query(
      usersRef,
      where('role', '==', 'admin'),
      where('isActive', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(adminQuery);
    const adminExists = !snapshot.empty;
    
    console.log(`✅ Admin check complete. Admin exists: ${adminExists}`);
    console.log(`📊 Found ${snapshot.size} admin user(s)`);
    
    return adminExists;
  } catch (error) {
    console.error('❌ Error checking for admin users:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
    });
    // In case of error, assume admin exists to prevent security issues
    return true;
  }
};

/**
 * Log admin creation for audit purposes
 */
export const logAdminCreation = async (adminId: string, adminEmail: string) => {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    
    await setDoc(doc(db, 'audit_logs', `admin_creation_${adminId}`), {
      eventType: 'admin_created',
      userId: adminId,
      userEmail: adminEmail,
      timestamp: serverTimestamp(),
      details: {
        message: 'Initial admin account created',
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Error logging admin creation:', error);
  }
};
