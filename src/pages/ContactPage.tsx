import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  businessHours: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: 'support@elitestore.com',
    phone: '+1 (234) 567-8900',
    address: '123 Commerce Street, Business District, NY 10001',
    businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM\nSun: Closed'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const api = await import('../api/simple-api');
      const data = await api.default.getContactSettings();
      setContactSettings(data as unknown as ContactSettings);
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Save message to Firestore
      const api = await import('../api/simple-api');
        await api.default.saveContactMessage();
      setAlertVariant('success');
      setAlertMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setShowAlert(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setShowAlert(false), 5000);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setAlertVariant('danger');
      setAlertMessage('Sorry, there was an error sending your message. Please try again.');
      setShowAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="display-4 fw-bold mb-3">Get In Touch</h1>
          <p className="lead text-muted">
            We'd love to hear from you! Whether you have questions about our products, 
            need support, or want to provide feedback, we're here to help.
          </p>
        </Col>
      </Row>

      {showAlert && (
        <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)} className="mb-4">
          {alertMessage}
        </Alert>
      )}

      <Row>
        {/* Contact Form */}
        <Col lg={8} className="mb-5">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-envelope me-2"></i>
                Send Us a Message
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(optional)"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject *</Form.Label>
                      <Form.Select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="orders">Order Questions</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="partnership">Business Partnership</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please provide details about your inquiry..."
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Contact Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="contact-item mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Address</h6>
                    <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {contactSettings.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-item mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success text-white rounded-circle p-2 me-3">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Phone</h6>
                    <p className="text-muted mb-0">
                      <a
                        href={
                          contactSettings.phone
                            ? `tel:${contactSettings.phone.replace(/[^0-9+]/g, '')}`
                            : undefined
                        }
                        className="text-decoration-none"
                      >
                        {contactSettings.phone || 'N/A'}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-item mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-info text-white rounded-circle p-2 me-3">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Email</h6>
                    <p className="text-muted mb-0">
                      <a href={`mailto:${contactSettings.email}`} className="text-decoration-none">
                        {contactSettings.email}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="d-flex align-items-center">
                  <div className="bg-warning text-white rounded-circle p-2 me-3">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Business Hours</h6>
                    <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {contactSettings.businessHours}
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* FAQ Link */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <i className="fas fa-question-circle fa-3x text-primary mb-3"></i>
              <h5>Frequently Asked Questions</h5>
              <p className="text-muted">
                Find quick answers to common questions about orders, shipping, and returns.
              </p>
              <Button variant="outline-primary">
                <i className="fas fa-external-link-alt me-2"></i>
                View FAQ
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Information */}
      <Row className="mt-5">
        <Col lg={12}>
          <Card className="border-0 bg-light">
            <Card.Body className="text-center py-4">
              <h4 className="mb-3">Need Immediate Help?</h4>
              <Row>
                <Col md={4} className="mb-3">
                  <div className="h-100">
                    <i className="fas fa-headset fa-2x text-primary mb-2"></i>
                    <h6>Live Chat Support</h6>
                    <p className="text-muted small">Available Mon-Fri, 9 AM - 6 PM</p>
                    <Button variant="outline-primary" size="sm">Start Chat</Button>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="h-100">
                    <i className="fas fa-phone-alt fa-2x text-success mb-2"></i>
                    <h6>Call Us</h6>
                    <p className="text-muted small">Speak with our customer service team</p>
                    <Button variant="outline-success" size="sm" href="tel:+1234567890">
                      Call Now
                    </Button>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="h-100">
                    <i className="fas fa-ticket-alt fa-2x text-warning mb-2"></i>
                    <h6>Support Ticket</h6>
                    <p className="text-muted small">Submit a detailed support request</p>
                    <Button variant="outline-warning" size="sm">Create Ticket</Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;