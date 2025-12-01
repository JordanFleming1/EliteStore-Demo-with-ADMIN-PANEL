import React, { useState } from 'react';
import { Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

const AdminPromotion: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const promoteToAdmin = async () => {
    if (!currentUser) {
      showToast('error', 'Error', 'You must be logged in to promote to admin');
      return;
    }

    if (currentUser.role === 'admin') {
      showToast('info', 'Already Admin', 'You are already an admin user!');
      return;
    }

    try {
      setLoading(true);
      
      // Update user role in Firestore
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      });

      showToast('success', 'Promoted to Admin!', 'You are now an admin. The page will refresh to update your permissions.');
      
      // Force refresh the auth context by reloading
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error promoting to admin:', error);
      showToast('error', 'Promotion Failed', 'Failed to promote user to admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Card className="m-3">
        <Card.Body>
          <Alert variant="warning">
            Please log in first to use the admin promotion tool.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>👑 Admin Promotion Tool (Development Only)</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <strong>Current User:</strong> {currentUser.displayName} ({currentUser.email})<br/>
          <strong>Current Role:</strong> <span className={`badge bg-${currentUser.role === 'admin' ? 'success' : 'secondary'}`}>{currentUser.role}</span>
        </Alert>

        {currentUser.role === 'admin' ? (
          <Alert variant="success">
            <i className="fas fa-crown me-2"></i>
            You are already an admin! You can access the admin panel from your profile menu.
          </Alert>
        ) : (
          <>
            <Alert variant="warning">
              <strong>⚠️ Development Tool:</strong> This button promotes your current user to admin role. 
              In production, this would be done through a secure admin interface.
            </Alert>
            <Button 
              variant="warning" 
              onClick={promoteToAdmin}
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Promoting to Admin...
                </>
              ) : (
                <>
                  <i className="fas fa-crown me-2"></i>
                  Promote {currentUser.displayName} to Admin
                </>
              )}
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default AdminPromotion;