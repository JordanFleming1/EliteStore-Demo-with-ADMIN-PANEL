import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Tab, Alert, ListGroup, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal';
  last4?: string;
  brand?: string;
  email?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

const AccountSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    dateOfBirth: '',
    profilePicture: (typeof (currentUser as any)?.photoURL === 'string' ? (currentUser as any).photoURL : '') || ''
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      phone: '555-0100',
      isDefault: true
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    }
  ]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: true,
    smsNotifications: false,
    newsletterSubscription: true,
    productRecommendations: true
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showEmail: false,
    allowDataCollection: true,
    allowPersonalization: true
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSavePreferences = () => {
    console.log('Saving preferences:', preferences);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Changing password');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="mb-1">
          <i className="bi bi-person-circle me-2"></i>
          Account Settings
        </h2>
        <p className="text-muted mb-0">Manage your account preferences and settings</p>
      </div>

      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'profile')}>
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="d-flex align-items-center">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="addresses" className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2"></i>
                      Addresses
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payment" className="d-flex align-items-center">
                      <i className="bi bi-credit-card me-2"></i>
                      Payment Methods
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="d-flex align-items-center">
                      <i className="bi bi-bell me-2"></i>
                      Notifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center">
                      <i className="bi bi-lock me-2"></i>
                      Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="privacy" className="d-flex align-items-center">
                      <i className="bi bi-shield-check me-2"></i>
                      Privacy
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* Profile Settings */}
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Profile Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                          <img
                            src={profile.profilePicture || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            className="position-absolute bottom-0 end-0 rounded-circle"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </div>
                      </div>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile.displayName}
                              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              value={profile.email}
                              disabled
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              value={profile.dateOfBirth}
                              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button variant="primary" onClick={handleSaveProfile}>
                        Save Profile
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Addresses */}
              <Tab.Pane eventKey="addresses">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Saved Addresses</h5>
                    <Button variant="primary" size="sm" onClick={() => setShowAddressModal(true)}>
                      <i className="bi bi-plus-lg me-1"></i>
                      Add Address
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {addresses.map((address) => (
                        <ListGroup.Item key={address.id}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <strong>{address.firstName} {address.lastName}</strong>
                                {address.isDefault && (
                                  <Badge bg="primary" className="ms-2">Default</Badge>
                                )}
                                <Badge bg="secondary" className="ms-2">{address.type}</Badge>
                              </div>
                              <div className="text-muted small">
                                {address.street}<br />
                                {address.city}, {address.state} {address.zipCode}<br />
                                {address.country}<br />
                                Phone: {address.phone}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              {!address.isDefault && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Payment Methods */}
              <Tab.Pane eventKey="payment">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Payment Methods</h5>
                    <Button variant="primary" size="sm" onClick={() => setShowPaymentModal(true)}>
                      <i className="bi bi-plus-lg me-1"></i>
                      Add Payment Method
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {paymentMethods.map((pm) => (
                        <ListGroup.Item key={pm.id}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <i className="bi bi-credit-card me-2"></i>
                                {pm.type === 'credit_card' ? (
                                  <>
                                    <strong>{pm.brand} •••• {pm.last4}</strong>
                                    {pm.isDefault && (
                                      <Badge bg="primary" className="ms-2">Default</Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <strong>PayPal - {pm.email}</strong>
                                    {pm.isDefault && (
                                      <Badge bg="primary" className="ms-2">Default</Badge>
                                    )}
                                  </>
                                )}
                              </div>
                              {pm.type === 'credit_card' && (
                                <div className="text-muted small">
                                  Expires {pm.expiryMonth}/{pm.expiryYear}
                                </div>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              {!pm.isDefault && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleSetDefaultPayment(pm.id)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeletePaymentMethod(pm.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Notifications */}
              <Tab.Pane eventKey="notifications">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Notification Preferences</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <h6 className="mb-3">Email Notifications</h6>
                      <Form.Check
                        type="checkbox"
                        label="Enable email notifications"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Order updates and shipping notifications"
                        checked={preferences.orderUpdates}
                        onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Promotional emails and special offers"
                        checked={preferences.promotionalEmails}
                        onChange={(e) => setPreferences({ ...preferences, promotionalEmails: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Newsletter subscription"
                        checked={preferences.newsletterSubscription}
                        onChange={(e) => setPreferences({ ...preferences, newsletterSubscription: e.target.checked })}
                        className="mb-3"
                      />

                      <h6 className="mb-3">Other Notifications</h6>
                      <Form.Check
                        type="checkbox"
                        label="SMS notifications (charges may apply)"
                        checked={preferences.smsNotifications}
                        onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Product recommendations based on your preferences"
                        checked={preferences.productRecommendations}
                        onChange={(e) => setPreferences({ ...preferences, productRecommendations: e.target.checked })}
                        className="mb-3"
                      />

                      <Button variant="primary" onClick={handleSavePreferences}>
                        Save Preferences
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security */}
              <Tab.Pane eventKey="security">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Security Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <h6 className="mb-3">Change Password</h6>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                        />
                        <Form.Text className="text-muted">
                          Must be at least 8 characters with uppercase, lowercase, and numbers
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={handleChangePassword} className="mb-4">
                        Change Password
                      </Button>

                      <h6 className="mb-3">Two-Factor Authentication</h6>
                      <Form.Check
                        type="checkbox"
                        label="Enable two-factor authentication (Recommended)"
                        checked={security.twoFactorEnabled}
                        onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                        className="mb-3"
                      />
                      {security.twoFactorEnabled && (
                        <Alert variant="info">
                          Two-factor authentication adds an extra layer of security to your account. 
                          You'll need to enter a code from your phone in addition to your password.
                        </Alert>
                      )}
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Privacy */}
              <Tab.Pane eventKey="privacy">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Privacy Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Profile Visibility</Form.Label>
                        <Form.Select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        >
                          <option value="private">Private - Only me</option>
                          <option value="public">Public - Everyone</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Check
                        type="checkbox"
                        label="Show email address on public profile"
                        checked={privacy.showEmail}
                        onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Allow data collection for improving service"
                        checked={privacy.allowDataCollection}
                        onChange={(e) => setPrivacy({ ...privacy, allowDataCollection: e.target.checked })}
                        className="mb-2"
                      />
                      <Form.Check
                        type="checkbox"
                        label="Allow personalized shopping experience"
                        checked={privacy.allowPersonalization}
                        onChange={(e) => setPrivacy({ ...privacy, allowPersonalization: e.target.checked })}
                        className="mb-3"
                      />

                      <Alert variant="warning">
                        <strong>Data Rights:</strong> You have the right to request a copy of your data or 
                        request deletion of your account. Contact support for assistance.
                      </Alert>

                      <Button variant="danger" className="me-2">
                        Request Data Export
                      </Button>
                      <Button variant="outline-danger">
                        Delete Account
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Add Address Modal */}
      <Modal show={showAddressModal} onHide={() => setShowAddressModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" placeholder="John" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" placeholder="Doe" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control type="text" placeholder="123 Main St" />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" placeholder="New York" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control type="text" placeholder="NY" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control type="text" placeholder="10001" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" placeholder="+1 (555) 000-0000" />
            </Form.Group>
            <Form.Check type="checkbox" label="Set as default address" className="mb-3" />
            <Form.Check type="radio" name="addressType" label="Shipping Address" defaultChecked className="mb-2" />
            <Form.Check type="radio" name="addressType" label="Billing Address" />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowAddressModal(false)}>
            Save Address
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control type="text" placeholder="1234 5678 9012 3456" />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Month</Form.Label>
                  <Form.Control type="number" placeholder="12" min="1" max="12" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Year</Form.Label>
                  <Form.Control type="number" placeholder="2025" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control type="text" placeholder="123" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check type="checkbox" label="Set as default payment method" />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowPaymentModal(false)}>
            Add Payment Method
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountSettings;
