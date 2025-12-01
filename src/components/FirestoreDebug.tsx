import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

const FirestoreDebug: React.FC = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { firebaseUser, currentUser } = useAuth();

  const testFirestoreWrite = async () => {
    if (!firebaseUser) {
      setError('No Firebase user found. Please sign in first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('Testing Firestore write...');

      // Try to create a user document
      const testUserDoc = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Test User',
        role: 'user',
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Attempting to write user doc:', testUserDoc);
      
      await setDoc(doc(db, 'users', firebaseUser.uid), testUserDoc);
      console.log('User document written successfully');

      // Try to read it back
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        console.log('User document read successfully:', userDocSnap.data());
        setMessage(`✅ Success! User document created and verified in Firestore.
        
Firebase User: ${firebaseUser.email} (${firebaseUser.uid})
Firestore Document: ${JSON.stringify(userDocSnap.data(), null, 2)}`);
      } else {
        setError('❌ Document was written but cannot be read back. Check Firestore rules.');
      }

    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Firestore test error:', error);
      
      let errorMessage = `❌ Firestore Error: ${err.message || 'Unknown error'}`;
      
      if (err.code) {
        errorMessage += `\nError Code: ${err.code}`;
        
        if (err.code === 'permission-denied') {
          errorMessage += `\n\n🔧 Fix: Update your Firestore security rules to allow writes:
          
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (for development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkUsersCollection = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('Checking users collection...');

      const usersCollection = collection(db, 'users');
      const snapshot = await getDocs(usersCollection);
      
      console.log('Users collection size:', snapshot.size);
      
      if (snapshot.empty) {
        setMessage('📭 Users collection is empty. No user documents found.');
      } else {
        let usersList = 'Users in Firestore:\n';
        snapshot.forEach((doc) => {
          const userData = doc.data();
          usersList += `\n• ${userData.email || 'No email'} (${doc.id})`;
        });
        setMessage(usersList);
      }

    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      setError(`Error reading users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>🔍 Firestore Debug Tool</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <strong>Firebase Auth User:</strong> {firebaseUser ? `${firebaseUser.email} (${firebaseUser.uid})` : 'None'}<br/>
          <strong>App Current User:</strong> {currentUser ? `${currentUser.email} (${currentUser.id})` : 'None'}
        </Alert>
        
        <div className="d-grid gap-2 mb-3">
          <Button 
            variant="primary" 
            onClick={testFirestoreWrite}
            disabled={loading || !firebaseUser}
          >
            {loading ? 'Testing...' : 'Test Firestore Write'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={checkUsersCollection}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Users Collection'}
          </Button>
        </div>
        
        {message && (
          <Alert variant="success">
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
              {message}
            </pre>
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger">
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
              {error}
            </pre>
          </Alert>
        )}
        
        <small className="text-muted">
          <strong>This tool helps debug why user documents aren't being created in Firestore.</strong><br/>
          1. First check if you can write to Firestore<br/>
          2. Check what users exist in the collection<br/>
          3. Update Firestore rules if you get permission errors
        </small>
      </Card.Body>
    </Card>
  );
};

export default FirestoreDebug;