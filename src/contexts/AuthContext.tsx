import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: FirebaseUser | null; // Alias for currentUser
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>; // Alias for updateUserProfile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Timeout for fetching user profile (5 seconds)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Firebase timeout')), 5000);
          });
          const userDocPromise = getDoc(doc(db, 'users', user.uid));
          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUserProfile({
              ...userData,
              id: user.uid,
              createdAt: userData.createdAt?.toDate?.() || new Date(),
              updatedAt: userData.updatedAt?.toDate?.() || new Date(),
            } as User);
            // Update last login (non-blocking)
            updateDoc(doc(db, 'users', user.uid), {
              lastLogin: serverTimestamp(),
            }).catch((error) => console.error('Error updating last login:', error));
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          // Handle timeout silently - don't log timeout errors
          if (!(error instanceof Error) || !error.message.includes('timeout')) {
            console.error('Error fetching user profile:', error);
          }
          setUserProfile(null); // Set to null if fetch fails or times out
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email,
      displayName,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');
    
    await updateDoc(doc(db, 'users', currentUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    
    if (data.displayName) {
      await updateProfile(currentUser, { displayName: data.displayName });
    }
    
    // Refresh user profile
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      setUserProfile({
        ...userDoc.data(),
        id: currentUser.uid,
      } as User);
    }
  };

  const value = {
    currentUser,
    user: currentUser, // Alias for currentUser
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    updateProfile: updateUserProfile, // Alias for updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
