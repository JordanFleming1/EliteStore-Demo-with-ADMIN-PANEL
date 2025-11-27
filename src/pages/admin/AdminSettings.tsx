import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Tab, Alert } from 'react-bootstrap';
import StripeAccountSettings from './StripeAccountSettings';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'My E-Commerce Store',
    storeLogo: '',
    // timezone: 'America/New_York',
    
    // Payment Settings
    paymentGateway: 'stripe',
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    acceptCreditCard: true,
    acceptPaypal: true,
    acceptCrypto: false,
    
    // Shipping Settings
    freeShippingThreshold: 50,
    standardShippingCost: 9.99,
    expressShippingCost: 19.99,
    internationalShipping: false,
    shippingCarriers: ['FedEx', 'UPS', 'USPS'],
    
    // Email Notifications
    orderConfirmationEmail: true,
    orderShippedEmail: true,
    orderDeliveredEmail: true,
    lowStockAlert: true,
    newCustomerWelcome: true,
    emailFromName: 'My Store Team',
    emailFromAddress: 'noreply@mystore.com',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    
    // Security Settings
    requireEmailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: '',
    enableCaptcha: true,
    
    // API Settings
    enableApi: true,
    apiKey: 'sk_live_xxxxxxxxxxxxxxxx',
    webhookUrl: '',
    rateLimitPerHour: 1000,
    
    // Appearance
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    logoUrl: '',
    faviconUrl: '',
    homePageLayout: 'grid',
    
    // Analytics
    googleAnalyticsId: '',
    facebookPixelId: '',
    enableTracking: true
  });

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    if (field === 'currency') return; // Ignore currency changes (removed)
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(file);
      });
      
      setSettings(prev => ({
        ...prev,
        storeLogo: base64
      }));
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Load settings from Firestore
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { db } = await import('../../firebase/firebase.config');
        const { doc, getDoc } = await import('firebase/firestore');
        const siteDoc = await getDoc(doc(db, 'settings', 'site'));
        if (siteDoc.exists()) {
          const data = siteDoc.data();
          setSettings(prev => ({
            ...prev,
            siteName: data.siteName || prev.siteName,
            storeLogo: data.storeLogo || prev.storeLogo,
          }));
        }
      } catch (error) {
        console.error('Error loading settings from Firestore:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      // Save to Firestore (settings.site)
      const { db } = await import('../../firebase/firebase.config');
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'site'), {
        siteName: settings.siteName,
        storeLogo: settings.storeLogo,
      }, { merge: true });
      // Also update localStorage for instant UI update
      localStorage.setItem('siteSettings', JSON.stringify({
        siteName: settings.siteName,
        storeLogo: settings.storeLogo,
      }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-gear-fill me-2"></i>
            Admin Settings
          </h2>
          <p className="text-muted mb-0">Configure your store settings and preferences</p>
        </div>
        <Button variant="primary" onClick={handleSaveSettings}>
          Save All Changes
        </Button>
      </div>

      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="general" className="d-flex align-items-center">
                      <i className="bi bi-shop me-2"></i>
                      General
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payment" className="d-flex align-items-center">
                      <i className="bi bi-credit-card me-2"></i>
                      Payment
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="shipping" className="d-flex align-items-center">
                      <i className="bi bi-truck me-2"></i>
                      Shipping
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="email" className="d-flex align-items-center">
                      <i className="bi bi-envelope me-2"></i>
                      Email & Notifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center">
                      <i className="bi bi-shield-lock me-2"></i>
                      Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="api" className="d-flex align-items-center">
                      <i className="bi bi-key me-2"></i>
                      API & Integrations
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appearance" className="d-flex align-items-center">
                      <i className="bi bi-palette me-2"></i>
                      Appearance
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="analytics" className="d-flex align-items-center">
                      <i className="bi bi-graph-up me-2"></i>
                      Analytics
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* General Settings */}
              <Tab.Pane eventKey="general">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">General Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Site Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.siteName}
                              onChange={(e) => handleInputChange('siteName', e.target.value)}
                            />
                            <Form.Text className="text-muted">
                              This will appear in the navigation bar
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Store Logo</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={uploadingLogo}
                            />
                            <Form.Text className="text-muted">
                              Upload an image file (max 2MB). Recommended size: 200x60px
                            </Form.Text>
                            {uploadingLogo && (
                              <div className="mt-2 text-primary">
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Uploading...
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      {settings.storeLogo && (
                        <Row className="mb-3">
                          <Col md={12}>
                            <div className="border rounded p-3 bg-light">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <p className="mb-0 fw-bold">Logo Preview:</p>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleInputChange('storeLogo', '')}
                                >
                                  <i className="fas fa-trash me-1"></i>
                                  Remove Logo
                                </Button>
                              </div>
                              <img 
                                src={settings.storeLogo} 
                                alt="Store Logo" 
                                style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                      )}
                    </Form>
                    {/* Stripe onboarding */}
                    <StripeAccountSettings />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Payment Settings */}
              <Tab.Pane eventKey="payment">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Payment Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Primary Payment Gateway</Form.Label>
                        <Form.Select
                          value={settings.paymentGateway}
                          onChange={(e) => handleInputChange('paymentGateway', e.target.value)}
                        >
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                          <option value="square">Square</option>
                        </Form.Select>
                      </Form.Group>

                      <h6 className="mt-4 mb-3">Stripe Configuration</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Publishable Key</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="pk_live_..."
                              value={settings.stripePublishableKey}
                              onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Secret Key</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="sk_live_..."
                              value={settings.stripeSecretKey}
                              onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="mt-4 mb-3">PayPal Configuration</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Client ID</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Client ID"
                              value={settings.paypalClientId}
                              onChange={(e) => handleInputChange('paypalClientId', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Client Secret</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Client Secret"
                              value={settings.paypalSecret}
                              onChange={(e) => handleInputChange('paypalSecret', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="mt-4 mb-3">Payment Methods</h6>
                      <Form.Check
                        type="checkbox"
                        label="Accept Credit/Debit Cards"
                        checked={settings.acceptCreditCard}
                        onChange={(e) => handleInputChange('acceptCreditCard', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Accept PayPal"
                        checked={settings.acceptPaypal}
                        onChange={(e) => handleInputChange('acceptPaypal', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Accept Cryptocurrency"
                        checked={settings.acceptCrypto}
                        onChange={(e) => handleInputChange('acceptCrypto', e.target.checked)}
                      />
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Shipping Settings */}
              <Tab.Pane eventKey="shipping">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Shipping Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Free Shipping Threshold ($)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              value={settings.freeShippingThreshold}
                              onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value))}
                            />
                            <Form.Text className="text-muted">
                              Orders above this amount get free shipping
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Standard Shipping Cost ($)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              value={settings.standardShippingCost}
                              onChange={(e) => handleInputChange('standardShippingCost', parseFloat(e.target.value))}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Express Shipping Cost ($)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              value={settings.expressShippingCost}
                              onChange={(e) => handleInputChange('expressShippingCost', parseFloat(e.target.value))}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Check
                        type="checkbox"
                        label="Enable International Shipping"
                        checked={settings.internationalShipping}
                        onChange={(e) => handleInputChange('internationalShipping', e.target.checked)}
                        className="mb-3"
                      />

                      <Form.Group className="mb-3">
                        <Form.Label>Supported Shipping Carriers</Form.Label>
                        <div>
                          {['FedEx', 'UPS', 'USPS', 'DHL'].map(carrier => (
                            <Form.Check
                              key={carrier}
                              type="checkbox"
                              label={carrier}
                              checked={settings.shippingCarriers.includes(carrier)}
                              onChange={(e) => {
                                const carriers = e.target.checked
                                  ? [...settings.shippingCarriers, carrier]
                                  : settings.shippingCarriers.filter(c => c !== carrier);
                                handleInputChange('shippingCarriers', carriers);
                              }}
                              inline
                            />
                          ))}
                        </div>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Email & Notifications */}
              <Tab.Pane eventKey="email">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Email & Notification Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <h6 className="mb-3">Email Notifications</h6>
                      <Form.Check
                        type="checkbox"
                        label="Send order confirmation emails"
                        checked={settings.orderConfirmationEmail}
                        onChange={(e) => handleInputChange('orderConfirmationEmail', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Send order shipped notifications"
                        checked={settings.orderShippedEmail}
                        onChange={(e) => handleInputChange('orderShippedEmail', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Send order delivered notifications"
                        checked={settings.orderDeliveredEmail}
                        onChange={(e) => handleInputChange('orderDeliveredEmail', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Low stock alerts (admin only)"
                        checked={settings.lowStockAlert}
                        onChange={(e) => handleInputChange('lowStockAlert', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Welcome email for new customers"
                        checked={settings.newCustomerWelcome}
                        onChange={(e) => handleInputChange('newCustomerWelcome', e.target.checked)}
                        className="mb-3"
                      />

                      <h6 className="mt-4 mb-3">Email Configuration</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>From Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.emailFromName}
                              onChange={(e) => handleInputChange('emailFromName', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>From Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              value={settings.emailFromAddress}
                              onChange={(e) => handleInputChange('emailFromAddress', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="mt-4 mb-3">SMTP Settings</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP Host</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="smtp.gmail.com"
                              value={settings.smtpHost}
                              onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP Port</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.smtpPort}
                              onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP Username</Form.Label>
                            <Form.Control
                              type="text"
                              value={settings.smtpUsername}
                              onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>SMTP Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={settings.smtpPassword}
                              onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security Settings */}
              <Tab.Pane eventKey="security">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Security Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Check
                        type="checkbox"
                        label="Require email verification for new accounts"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Enable two-factor authentication"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Enable CAPTCHA on login and registration"
                        checked={settings.enableCaptcha}
                        onChange={(e) => handleInputChange('enableCaptcha', e.target.checked)}
                        className="mb-3"
                      />

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Session Timeout (minutes)</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.sessionTimeout}
                              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                            />
                            <Form.Text className="text-muted">
                              Auto-logout after inactivity
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Login Attempts</Form.Label>
                            <Form.Control
                              type="number"
                              value={settings.maxLoginAttempts}
                              onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                            />
                            <Form.Text className="text-muted">
                              Block account after failed attempts
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>IP Whitelist</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter IP addresses (one per line) that can access admin panel"
                          value={settings.ipWhitelist}
                          onChange={(e) => handleInputChange('ipWhitelist', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Leave empty to allow all IPs
                        </Form.Text>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* API Settings */}
              <Tab.Pane eventKey="api">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">API & Integration Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Check
                        type="checkbox"
                        label="Enable API Access"
                        checked={settings.enableApi}
                        onChange={(e) => handleInputChange('enableApi', e.target.checked)}
                        className="mb-3"
                      />

                      <Form.Group className="mb-3">
                        <Form.Label>API Key</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="text"
                            value={settings.apiKey}
                            readOnly
                          />
                          <Button variant="outline-secondary">
                            Regenerate
                          </Button>
                        </div>
                        <Form.Text className="text-muted">
                          Keep this key secure. Do not share publicly.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Webhook URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://your-app.com/webhook"
                          value={settings.webhookUrl}
                          onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Receive real-time notifications for order events
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Rate Limit (requests per hour)</Form.Label>
                        <Form.Control
                          type="number"
                          value={settings.rateLimitPerHour}
                          onChange={(e) => handleInputChange('rateLimitPerHour', parseInt(e.target.value))}
                        />
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Appearance Settings */}
              <Tab.Pane eventKey="appearance">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Appearance Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Primary Color</Form.Label>
                            <div className="d-flex align-items-center">
                              <Form.Control
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                style={{ width: '60px', marginRight: '10px' }}
                              />
                              <Form.Control
                                type="text"
                                value={settings.primaryColor}
                                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Secondary Color</Form.Label>
                            <div className="d-flex align-items-center">
                              <Form.Control
                                type="color"
                                value={settings.secondaryColor}
                                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                style={{ width: '60px', marginRight: '10px' }}
                              />
                              <Form.Control
                                type="text"
                                value={settings.secondaryColor}
                                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Logo URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://your-cdn.com/logo.png"
                          value={settings.logoUrl}
                          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Favicon URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://your-cdn.com/favicon.ico"
                          value={settings.faviconUrl}
                          onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Home Page Layout</Form.Label>
                        <Form.Select
                          value={settings.homePageLayout}
                          onChange={(e) => handleInputChange('homePageLayout', e.target.value)}
                        >
                          <option value="grid">Grid Layout</option>
                          <option value="list">List Layout</option>
                          <option value="masonry">Masonry Layout</option>
                        </Form.Select>
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Analytics Settings */}
              <Tab.Pane eventKey="analytics">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Analytics Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Check
                        type="checkbox"
                        label="Enable Tracking"
                        checked={settings.enableTracking}
                        onChange={(e) => handleInputChange('enableTracking', e.target.checked)}
                        className="mb-3"
                      />

                      <Form.Group className="mb-3">
                        <Form.Label>Google Analytics ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                          value={settings.googleAnalyticsId}
                          onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Track website traffic and user behavior
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Facebook Pixel ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your Facebook Pixel ID"
                          value={settings.facebookPixelId}
                          onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Track conversions from Facebook ads
                        </Form.Text>
                      </Form.Group>

                      <Alert variant="info" className="mt-3">
                        <i className="bi bi-bell me-2"></i>
                        Analytics data helps you understand customer behavior and optimize your store performance.
                      </Alert>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AdminSettings;
