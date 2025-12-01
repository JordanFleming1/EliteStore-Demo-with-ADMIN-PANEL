import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/simple-api';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal, Alert, Tab, Tabs } from 'react-bootstrap';

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  businessHours: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const AdminContact: React.FC = () => {
    const [toast, setToast] = useState<{ show: boolean; message: string }>(
      { show: false, message: '' }
    );
  const [settings, setSettings] = useState<ContactSettings>({
    email: '',
    phone: '',
    address: '',
    businessHours: ''
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [alert, setAlert] = useState<{ show: boolean; variant: 'success' | 'danger'; message: string }>({
    show: false,
    variant: 'success',
    message: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const settingsData = await api.getContactSettings();
      const messagesData = await api.getContactMessages();
      setSettings(settingsData as unknown as ContactSettings);
      setMessages(messagesData as unknown as ContactMessage[]);
    } catch (error) {
      console.error('Error fetching contact data:', error);
      showAlert('danger', 'Failed to load contact data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (variant: 'success' | 'danger', message: string) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: 'success', message: '' }), 5000);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveContactSettings(settings as unknown as Record<string, unknown>);
      showAlert('success', 'Contact settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('danger', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    // Mark as read if not already
    if (!message.read) {
      try {
        await api.saveContactMessage({ ...message, read: true });
        const updatedMessage = { ...message, read: true };
        setMessages(prev => prev.map(m => m.id === message.id ? updatedMessage : m));
        setSelectedMessage(updatedMessage);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      setToast({ show: true, message: 'Message deleted successfully.' });
      setShowMessageModal(false);
      setTimeout(() => setToast({ show: false, message: '' }), 3500);
    } catch (error) {
      console.error('Error deleting message:', error);
      showAlert('danger', 'Failed to delete message');
    }
  };

  const unreadCount = useMemo(() => {
    return messages.filter(m => !m.read).length;
  }, [messages]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading contact management...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-envelope me-2"></i>
            Contact Management
          </h2>
          <p className="text-muted mb-0">Manage contact information and customer messages</p>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}
      {toast.show && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999 }}>
          <div className="toast show bg-success text-white border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultActiveKey="settings" className="mb-4">
        {/* Contact Settings Tab */}
        <Tab eventKey="settings" title={
          <span>
            <i className="bi bi-gear me-2"></i>
            Contact Settings
          </span>
        }>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Contact Information Display
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSaveSettings}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="bi bi-envelope-fill me-2"></i>
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleSettingsChange}
                        placeholder="support@yourstore.com"
                        required
                      />
                      <Form.Text className="text-muted">
                        This email will receive all contact form submissions
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="bi bi-telephone-fill me-2"></i>
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={settings.phone}
                        onChange={handleSettingsChange}
                        placeholder="+1 (234) 567-8900"
                        required
                      />
                      <Form.Text className="text-muted">
                        Displayed on contact page
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Business Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleSettingsChange}
                    placeholder="123 Commerce Street, Business District, NY 10001"
                    required
                  />
                  <Form.Text className="text-muted">
                    Your physical business location
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <i className="bi bi-clock-fill me-2"></i>
                    Business Hours
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="businessHours"
                    value={settings.businessHours}
                    onChange={handleSettingsChange}
                    placeholder="Mon - Fri: 9:00 AM - 6:00 PM&#10;Sat: 10:00 AM - 4:00 PM&#10;Sun: Closed"
                    required
                  />
                  <Form.Text className="text-muted">
                    Use line breaks for multiple days
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" size="lg" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* Messages Tab */}
        <Tab eventKey="messages" title={
          <span>
            <i className="bi bi-inbox me-2"></i>
            Messages
            {unreadCount > 0 && (
              <Badge bg="danger" className="ms-2">{unreadCount}</Badge>
            )}
          </span>
        }>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Customer Messages
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {messages.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <p className="text-muted mt-3">No messages yet</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(message => (
                      <tr key={message.id} className={!message.read ? 'table-warning' : ''}>
                        <td>
                          {message.read ? (
                            <Badge bg="secondary">Read</Badge>
                          ) : (
                            <Badge bg="primary">New</Badge>
                          )}
                        </td>
                        <td className="fw-bold">{message.name}</td>
                        <td>
                          <a href={`mailto:${message.email}`} className="text-decoration-none">
                            {message.email}
                          </a>
                        </td>
                        <td>{message.subject}</td>
                        <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Message Detail Modal */}
      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-envelope-open me-2"></i>
            Message Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>From:</strong>
                  <p className="mb-0">{selectedMessage.name}</p>
                </Col>
                <Col md={6}>
                  <strong>Email:</strong>
                  <p className="mb-0">
                    <a href={`mailto:${selectedMessage.email}`}>
                      {selectedMessage.email}
                    </a>
                  </p>
                </Col>
              </Row>

              {selectedMessage.phone && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p className="mb-0">
                      <a href={`tel:${selectedMessage.phone}`}>
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Date:</strong>
                    <p className="mb-0">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </Col>
                </Row>
              )}

              <div className="mb-3">
                <strong>Subject:</strong>
                <p className="mb-0">{selectedMessage.subject}</p>
              </div>

              <div className="mb-3">
                <strong>Message:</strong>
                <div className="border rounded p-3 bg-light">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={() => selectedMessage && handleDeleteMessage(selectedMessage.id)}>
            <i className="bi bi-trash me-2"></i>
            Delete Message
          </Button>
          <Button variant="secondary" onClick={() => setShowMessageModal(false)}>
            Close
          </Button>
          {selectedMessage && (
            <Button
              variant="primary"
              href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
            >
              <i className="bi bi-reply me-2"></i>
              Reply via Email
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminContact;
