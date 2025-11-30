import React, { useState } from 'react';
import { Button, Alert, Card, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, login, currentUser } = useAuth();

  const handleTestSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !displayName) {
      setError('Please fill all fields');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      console.log('Testing signup with:', { email, displayName });
      await signup(email, password, displayName);
      
      setMessage('✅ Signup successful! Check AuthDebug component above for user state.');
      
      // Clear form
      setEmail('');
      setPassword('');
      setDisplayName('');
      
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Signup test error:', error);
      setError(`Signup failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill email and password');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      console.log('Testing login with:', email);
      await login(email, password);
      
      setMessage('✅ Login successful!');
      
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Login test error:', error);
      setError(`Login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-3">
      <Card.Header>
        <h5>🧪 Authentication Testing</h5>
      </Card.Header>
      <Card.Body>
        {currentUser && (
          <Alert variant="success">
            Currently logged in as: <strong>{currentUser.displayName}</strong> ({currentUser.email})
          </Alert>
        )}
        
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Display Name</Form.Label>
                <Form.Control
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Test User"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="mb-3">
            <Button 
              variant="primary" 
              onClick={handleTestSignup} 
              disabled={loading}
              className="me-2"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleTestLogin} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Login'}
            </Button>
          </div>
        </Form>
        
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <small className="text-muted">
          <strong>Instructions:</strong><br/>
          1. Fill in the form above<br/>
          2. Click "Test Signup" to create a new account<br/>
          3. Watch the AuthDebug component above to see if user state updates<br/>
          4. Check browser console for detailed logs
        </small>
      </Card.Body>
    </Card>
  );
};

export default AuthTest;