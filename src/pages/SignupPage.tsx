import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, signup, logout } = useAuth();
  // const { showToast } = useToast();
  const navigate = useNavigate();

  if (currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5 text-center">
                <i className="fas fa-user-check text-success mb-3" style={{ fontSize: '3rem' }}></i>
                <h3 className="text-success mb-3">Already Logged In</h3>
                <p className="text-muted mb-4">
                  You are currently logged in as <strong>{currentUser.displayName}</strong>
                </p>
                <div className="d-grid gap-3">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/')}
                  >
                    <i className="fas fa-home me-2"></i>
                    Go to Homepage
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={async () => {
                      await logout();
                      // showToast('success', 'Logged Out', 'You have been logged out. You can now create a new account.');
                    }}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout & Create New Account
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return setError('Please fill in all fields');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      console.log('Starting signup for:', formData.email);
      
      const displayName = `${formData.firstName} ${formData.lastName}`;
      await signup(formData.email, formData.password, displayName);
      
      console.log('Signup completed successfully');
      // showToast('success', 'Account Created!', `Welcome ${displayName}! Your account has been created successfully.`);
      
      // Small delay to show the toast, then redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account. ';
      
      if (firebaseError.code) {
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Try signing in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMessage += `Error: ${firebaseError.message}`;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google');
    }
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Create Account</h2>
                <p className="text-muted">Join EliteStore today</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="w-100 mb-3"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              {/* Google sign-up removed. Only email/password signup allowed. */}

              <hr className="my-4" />

              <div className="text-center">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-decoration-none fw-medium">
                  Sign in here
                </Link>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-decoration-none">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-decoration-none">
                    Privacy Policy
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;