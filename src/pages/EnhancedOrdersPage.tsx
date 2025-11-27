// Enhanced Orders Page with Analytics Integration
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useOrders } from '../hooks/useOrders';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import AdminOrders from './admin/AdminOrders';

export const EnhancedOrdersPage: React.FC = () => {
  const { loading, error, connected, refreshData, checkConnection } = useOrders();
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [refreshing, setRefreshing] = useState(false);

  // Check connection status periodically
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartAPI = () => {
    // Show instructions for starting the API
    alert(
      'To start the JSON Server API:\n\n' +
      '1. Open a new terminal\n' +
      '2. Run: npm run api\n' +
      '3. Keep the terminal open\n' +
      '4. Refresh this page\n\n' +
      'The API will run on http://localhost:3001'
    );
  };

  return (
    <div style={{ backgroundColor: 'white', marginBottom: '0' }}>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-1">🚀 Enhanced Orders Management</h1>
                <p className="text-muted mb-0">
                  Real-time order management with comprehensive analytics
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="sm"
                >
                  {refreshing ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Refreshing...
                  </>
                ) : (
                  '🔄 Refresh Data'
                )}
              </Button>
              
              {!connected && (
                <Button
                  variant="warning"
                  onClick={handleStartAPI}
                  size="sm"
                >
                  🚀 Start API Server
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Connection Status Alert */}
      {!connected && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>🔌 API Server Offline</Alert.Heading>
          <p className="mb-2">
            The JSON Server is not running. To enable real-time data management:
          </p>
          <ol className="mb-3">
            <li>Open a new terminal in your project directory</li>
            <li>Run: <code>npm run api</code></li>
            <li>Keep the terminal window open</li>
            <li>Refresh this page</li>
          </ol>
          <Button variant="warning" onClick={handleStartAPI} size="sm">
            📋 Show Instructions
          </Button>
        </Alert>
      )}

      {/* System Status */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <Badge bg={connected ? 'success' : 'danger'} className="px-3 py-2">
                    {connected ? '🟢 System Online' : '🔴 System Offline'}
                  </Badge>
                  
                  {loading && (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner size="sm" />
                      <small className="text-muted">Loading data...</small>
                    </div>
                  )}
                  
                  {error && (
                    <Badge bg="warning" className="px-2 py-1">
                      ⚠️ {error.includes('API') ? 'API Error' : 'Data Error'}
                    </Badge>
                  )}
                </div>
                
                <small className="text-muted">
                  Backend: JSON Server • Database: db.json • Real-time updates enabled
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'analytics')}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="analytics" title="📊 Analytics Dashboard">
          <AnalyticsDashboard />
        </Tab>
        
        <Tab eventKey="orders" title="📦 Orders Management">
          <AdminOrders />
        </Tab>
        
        <Tab eventKey="system" title="⚙️ System Information">
          <Container>
            <Row>
              <Col lg={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">🔧 System Configuration</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Backend Type:</strong></td>
                            <td>JSON Server (RESTful API)</td>
                          </tr>
                          <tr>
                            <td><strong>Database:</strong></td>
                            <td>db.json (File-based storage)</td>
                          </tr>
                          <tr>
                            <td><strong>API Endpoint:</strong></td>
                            <td>
                              <code>http://localhost:3001</code>
                              <Badge bg={connected ? 'success' : 'danger'} className="ms-2">
                                {connected ? 'Connected' : 'Offline'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Real-time Updates:</strong></td>
                            <td>Polling every 30 seconds</td>
                          </tr>
                          <tr>
                            <td><strong>Data Persistence:</strong></td>
                            <td>Permanent (stored in db.json)</td>
                          </tr>
                          <tr>
                            <td><strong>CORS:</strong></td>
                            <td>Enabled for localhost</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="mt-4">
                  <Card.Header>
                    <h5 className="mb-0">🚀 Getting Started</h5>
                  </Card.Header>
                  <Card.Body>
                    <h6>To run the complete system:</h6>
                    <ol>
                      <li><strong>Start the API server:</strong>
                        <pre className="bg-dark text-light p-2 rounded mt-1 mb-2">
                          <code>npm run api</code>
                        </pre>
                      </li>
                      <li><strong>Start the frontend (in another terminal):</strong>
                        <pre className="bg-dark text-light p-2 rounded mt-1 mb-2">
                          <code>npm run dev</code>
                        </pre>
                      </li>
                      <li><strong>Or run both together:</strong>
                        <pre className="bg-dark text-light p-2 rounded mt-1">
                          <code>npm run dev:full</code>
                        </pre>
                      </li>
                    </ol>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">✨ Features</h5>
                  </Card.Header>
                  <Card.Body>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className="text-success">✅</i> Real database with JSON Server
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Complete CRUD operations
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Analytics dashboard with charts
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Order status management
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Search and filtering
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Bulk operations
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Real-time updates
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Data persistence
                      </li>
                      <li className="mb-2">
                        <i className="text-success">✅</i> Professional UI/UX
                      </li>
                      <li>
                        <i className="text-success">✅</i> TypeScript support
                      </li>
                    </ul>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <h5 className="mb-0">🎯 Advantages</h5>
                  </Card.Header>
                  <Card.Body>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <strong>🚀 Fast Setup:</strong> No complex configurations
                      </li>
                      <li className="mb-2">
                        <strong>💾 Real Data:</strong> Persistent storage in JSON
                      </li>
                      <li className="mb-2">
                        <strong>🔄 RESTful API:</strong> Standard HTTP operations
                      </li>
                      <li className="mb-2">
                        <strong>🎨 Rich Analytics:</strong> Charts and metrics
                      </li>
                      <li className="mb-2">
                        <strong>🔧 Easy Testing:</strong> Inspect data directly
                      </li>
                      <li>
                        <strong>📈 Scalable:</strong> Easy migration to production DB
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Tab>
      </Tabs>
    </Container>
    </div>
  );
};