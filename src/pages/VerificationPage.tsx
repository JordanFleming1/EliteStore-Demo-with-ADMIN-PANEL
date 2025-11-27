import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // If already verified, go to homepage
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [currentUser, navigate]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <i className="fas fa-shield-alt text-primary mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="mb-3">Verification Required</h3>
              <p className="text-muted mb-4">
                Please verify your identity to access the website.<br />
                Only verified customers and the admin can proceed.
              </p>
              <div className="d-grid gap-3">
                <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outline-secondary" size="lg" onClick={() => navigate('/signup')}>
                  Sign Up as Customer
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerificationPage;
