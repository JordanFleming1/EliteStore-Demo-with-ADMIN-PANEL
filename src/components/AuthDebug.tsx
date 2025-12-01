import React from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const AuthDebug: React.FC = () => {
  const { currentUser, firebaseUser, loading } = useAuth();

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>🔍 Authentication Debug Info</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}
        </Alert>
        
        <Alert variant={firebaseUser ? 'success' : 'warning'}>
          <strong>Firebase User:</strong> {firebaseUser ? `✅ ${firebaseUser.email} (${firebaseUser.uid})` : '❌ None'}
        </Alert>
        
        <Alert variant={currentUser ? 'success' : 'warning'}>
          <strong>Current User (App State):</strong> {currentUser ? `✅ ${currentUser.displayName} (${currentUser.email})` : '❌ None'}
        </Alert>
        
        {currentUser && (
          <Alert variant="secondary">
            <strong>User Role:</strong> {currentUser.role}<br/>
            <strong>Created:</strong> {(currentUser as any).createdAt?.toString() || ''}<br/>
            <strong>Addresses:</strong> {(currentUser as any).addresses?.length || 0}<br/>
            <strong>Wishlist:</strong> {(currentUser as any).wishlist?.length || 0}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AuthDebug;