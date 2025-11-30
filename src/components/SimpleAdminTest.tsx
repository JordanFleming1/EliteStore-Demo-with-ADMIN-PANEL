import React from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const SimpleAdminTest: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Card className="m-3">
        <Card.Body>
          <Alert variant="warning">
            Please log in to test admin access.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>🔐 Admin Access Test</h5>
      </Card.Header>
      <Card.Body>
        {currentUser.role === 'admin' ? (
          <>
            <Alert variant="success">
              <i className="fas fa-check-circle me-2"></i>
              <strong>Admin Access Confirmed!</strong> You have admin privileges.
            </Alert>
            <div className="d-grid gap-2">
              <Link to="/admin" className="btn btn-primary btn-lg">
                <i className="fas fa-cogs me-2"></i>
                Access Admin Dashboard
              </Link>
              <Link to="/admin/products" className="btn btn-outline-primary">
                <i className="fas fa-box me-2"></i>
                Manage Products
              </Link>
            </div>
            <div className="mt-3 text-muted small">
              <strong>Available Admin Routes:</strong>
              <ul className="mt-2">
                <li>/admin - Dashboard</li>
                <li>/admin/products - Product Management</li>
                <li>/admin/orders - Order Management (coming soon)</li>
                <li>/admin/customers - Customer Management (coming soon)</li>
              </ul>
            </div>
          </>
        ) : (
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            You are logged in as a regular user. Use the "Promote to Admin" button above to gain admin access.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default SimpleAdminTest;