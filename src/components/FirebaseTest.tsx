import React, { useState, useEffect } from 'react';
import { Button, Alert, Card, ListGroup } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.config';

const FirebaseTest: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<string>('checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('checking...');

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      // Check Auth status
      if (auth) {
        setAuthStatus('✅ Auth initialized');
      } else {
        setAuthStatus('❌ Auth failed to initialize');
      }

      // Check Firestore status
      if (db) {
        try {
          await getDocs(collection(db, 'test'));
          setFirestoreStatus('✅ Firestore connected');
        } catch (error: unknown) {
          const firebaseError = error as { code?: string; message?: string };
          if (firebaseError.code === 'permission-denied') {
            setFirestoreStatus('⚠️ Firestore connected but permission denied (normal for new projects)');
          } else {
            setFirestoreStatus('❌ Firestore error: ' + (firebaseError.message || 'Unknown error'));
          }
        }
      } else {
        setFirestoreStatus('❌ Firestore failed to initialize');
      }
    } catch (error) {
      setError('Setup check failed: ' + (error as Error).message);
    }
  };

  const testCreateUser = async () => {
    try {
      setError('');
      setMessage('Testing user creation...');
      
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'password123';
      
      console.log('Attempting to create user:', testEmail);
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      
      console.log('User created successfully:', user.uid);
      
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: 'Test User',
        role: 'user',
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      console.log('User document created in Firestore');
      
      setMessage(`✅ User created successfully! 
      Email: ${testEmail}
      UID: ${user.uid}
      Document saved to Firestore!`);
      
      // Clean up - delete the user
      await user.delete();
      console.log('Test user cleaned up');
      
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('User creation test error:', error);
      let errorMessage = 'User creation failed: ' + (firebaseError.message || 'Unknown error');
      
      if (firebaseError.code) {
        errorMessage += '\nError Code: ' + firebaseError.code;
        
        // Common Firebase Auth errors
        if (firebaseError.code === 'auth/configuration-not-found') {
          errorMessage += '\n\n🔧 Fix: You need to enable Authentication in Firebase Console';
        } else if (firebaseError.code === 'auth/api-key-not-valid') {
          errorMessage += '\n\n🔧 Fix: Check your Firebase API key configuration';
        } else if (firebaseError.code === 'auth/project-not-found') {
          errorMessage += '\n\n🔧 Fix: Check your Firebase project ID';
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <Card className="m-4">
      <Card.Header>
        <h4>🔧 Firebase Connection Test & Setup Checker</h4>
      </Card.Header>
      <Card.Body>
        <ListGroup className="mb-3">
          <ListGroup.Item>Firebase Auth: {authStatus}</ListGroup.Item>
          <ListGroup.Item>Firestore: {firestoreStatus}</ListGroup.Item>
        </ListGroup>
        
        <div className="mb-3">
          <Button variant="success" onClick={testCreateUser} className="me-2">
            Test User Creation
          </Button>
          <Button variant="secondary" onClick={checkFirebaseStatus}>
            Refresh Status
          </Button>
        </div>
        
        {message && (
          <Alert variant="success" style={{ whiteSpace: 'pre-line' }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </Alert>
        )}
        
        <small className="text-muted">
          <strong>Setup Instructions:</strong><br/>
          1. Go to Firebase Console → Authentication → Get Started<br/>
          2. Enable Email/Password sign-in method<br/>
          3. Go to Firestore Database → Create Database<br/>
          4. Choose "Start in test mode" for now
        </small>
      </Card.Body>
    </Card>
  );
};

export default FirebaseTest;