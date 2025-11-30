import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

// Utility function to promote a user to admin
// This would typically be done through an admin interface or database script
export const promoteToAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date()
    });
    console.log(`User ${userId} promoted to admin successfully`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Helper function to get current user ID for promotion
// You can call this in browser console: getCurrentUserId()
export const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.uid || 'No user found';
};

// Instructions for promoting current user to admin:
// 1. Sign in with your account
// 2. Open browser console (F12)
// 3. Run: promoteToAdmin('YOUR_USER_ID')
// or find your user ID first with: getCurrentUserId()

export default {
  promoteToAdmin,
  getCurrentUserId
};