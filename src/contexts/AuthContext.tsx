import React, { createContext, useState } from 'react';
import AuthLoader from '../components/AuthLoader';
import { type Customer } from '../types/api-types';
import { auth, db } from '../firebase/firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import type { User as FirebaseUser } from 'firebase/auth';
interface AuthContextType {
  currentUser: (Customer & { role?: string }) | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

  const [currentUser, setCurrentUser] = useState<(Customer & { role?: string }) | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Listen for auth state changes
    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        (async () => {
          if (user) {
            // Ensure admin profile exists in Firestore
            if (user.email === 'admin@elitestore.com') {
              const adminDocRef = doc(db, 'users', user.uid);
              const adminDoc = await getDoc(adminDocRef);
              if (!adminDoc.exists()) {
                await setDoc(adminDocRef, {
                  displayName: 'EliteStore Admin',
                  email: user.email,
                  totalOrders: 0,
                  totalSpent: 0,
                  joinedAt: new Date().toISOString(),
                  role: 'admin',
                });
              }
            }
            // Set current user from Firestore profile
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const profile = userDoc.exists() ? userDoc.data() : {};
            setCurrentUser({
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || profile.displayName || (user.email ? user.email.split('@')[0] : ''),
              totalOrders: profile.totalOrders || 0,
              totalSpent: profile.totalSpent || 0,
              joinedAt: profile.joinedAt || new Date().toISOString(),
              role: profile.role || (user.email === 'admin@elitestore.com' ? 'admin' : 'customer'),
            });
          } else {
            setCurrentUser(null);
          }
        })();
      });
      return () => unsubscribe();
    }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        totalOrders: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString(),
        role: email === 'admin@elitestore.com' ? 'admin' : 'customer',
      });
      setCurrentUser({
        id: user.uid,
        email,
        displayName,
        totalOrders: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString(),
        role: email === 'admin@elitestore.com' ? 'admin' : 'customer',
      });
    } catch {
      throw new Error('Signup failed');
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Check if admin
      let role = 'customer';
      if (email === 'admin@elitestore.com') {
        role = 'admin';
      }
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = userDoc.exists() ? userDoc.data() : {};
      setCurrentUser({
        id: user.uid,
        email,
        displayName: user.displayName || profile.displayName || email.split('@')[0],
        totalOrders: profile.totalOrders || 0,
        totalSpent: profile.totalSpent || 0,
        joinedAt: profile.joinedAt || new Date().toISOString(),
        role,
      });
    } catch {
      throw new Error('Invalid credentials');
    }
    setLoading(false);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <AuthLoader /> : children}
    </AuthContext.Provider>
  );
}

export { AuthContext };