import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';

const AuthStateRefresh: React.FC = () => {
  const [message, setMessage] = useState('');
  const { currentUser, firebaseUser, loading } = useAuth();

  const forceAuthRefresh = () => {
    setMessage('🔄 Forcing auth state refresh...');
    
    // Trigger the auth state listener manually
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMessage(`✅ Auth state refreshed! Firebase user: ${user.email}`);
        console.log('Forced auth refresh - user:', user);
      } else {
        setMessage('❌ No Firebase user found after refresh');
      }
      unsubscribe(); // Clean up the listener
    });

    // Also try reloading the page as backup
    setTimeout(() => {
      if (!currentUser && firebaseUser) {
        setMessage('🔄 Auth context not updating, reloading page...');
        setTimeout(() => window.location.reload(), 1000);
      }
    }, 3000);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>🔄 Auth State Refresh Tool</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant={currentUser ? 'success' : firebaseUser ? 'warning' : 'info'}>
          <strong>Status:</strong><br/>
          Firebase User: {firebaseUser ? '✅ Connected' : '❌ None'}<br/>
          App User: {currentUser ? '✅ Connected' : '❌ None'}<br/>
          Loading: {loading ? '⏳ Yes' : '✅ No'}
        </Alert>

        {firebaseUser && !currentUser && (
          <Alert variant="warning">
            <strong>⚠️ Sync Issue Detected!</strong><br/>
            You have a Firebase user but no app user. This usually means Firestore permissions are preventing the user document from being read.
          </Alert>
        )}

        <div className="d-grid gap-2 mb-3">
          <Button 
            variant="primary" 
            onClick={forceAuthRefresh}
            disabled={loading}
          >
            🔄 Force Auth Refresh
          </Button>
          <Button 
            variant="secondary" 
            onClick={reloadPage}
          >
            🔄 Reload Page
          </Button>
        </div>

        {message && (
          <Alert variant="info">
            {message}
          </Alert>
        )}

        <small className="text-muted">
          <strong>When to use:</strong><br/>
          • After login but still see "Login/Signup" buttons<br/>
          • After becoming admin but can't see admin options<br/>
          • When Firebase Auth works but app state doesn't update
        </small>
      </Card.Body>
    </Card>
  );
};

export default AuthStateRefresh;