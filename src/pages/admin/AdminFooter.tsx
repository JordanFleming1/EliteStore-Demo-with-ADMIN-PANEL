import React, { useState, useEffect } from 'react';
import api from '../../api/simple-api';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

interface FooterSettings {
  brandName: string;
  brandDescription: string;
  copyrightText: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

const AdminFooter: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    brandName: '',
    brandDescription: '',
    copyrightText: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; variant: 'success' | 'danger'; message: string }>({
    show: false,
    variant: 'success',
    message: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getFooterSettings();
      setSettings({
        ...data,
        socialLinks: {
          facebook: data?.socialLinks?.facebook || '',
          twitter: data?.socialLinks?.twitter || '',
          instagram: data?.socialLinks?.instagram || '',
          linkedin: data?.socialLinks?.linkedin || '',
        },
      });
    } catch (error) {
      console.error('Error fetching footer settings:', error);
      showAlert('danger', 'Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (variant: 'success' | 'danger', message: string) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: 'success', message: '' }), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (platform: keyof FooterSettings['socialLinks'], value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('http://localhost:3001/footerSettings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      showAlert('success', 'Footer settings saved successfully!');
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('danger', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading footer settings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-layout-text-sidebar-reverse me-2"></i>
            Footer Customization
          </h2>
          <p className="text-muted mb-0">Customize your website footer content</p>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      <Form onSubmit={handleSave}>
        <Row>
          {/* Brand Section */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-bookmark-star me-2"></i>
                  Brand Information
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Brand Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="brandName"
                    value={settings.brandName}
                    onChange={handleInputChange}
                    placeholder="EliteStore"
                    required
                  />
                  <Form.Text className="text-muted">
                    Your store name displayed in the footer
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Brand Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="brandDescription"
                    value={settings.brandDescription}
                    onChange={handleInputChange}
                    placeholder="Your premier destination for quality products at unbeatable prices..."
                    required
                  />
                  <Form.Text className="text-muted">
                    A brief description of your store
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="fw-bold">Copyright Text</Form.Label>
                  <Form.Control
                    type="text"
                    name="copyrightText"
                    value={settings.copyrightText}
                    onChange={handleInputChange}
                    placeholder="EliteStore. All rights reserved."
                    required
                  />
                  <Form.Text className="text-muted">
                    Text displayed in the copyright notice
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Social Media Links */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-share me-2"></i>
                  Social Media Links
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fab fa-facebook me-2"></i>
                    Facebook URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={settings.socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourstore"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fab fa-twitter me-2"></i>
                    Twitter URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={settings.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/yourstore"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fab fa-instagram me-2"></i>
                    Instagram URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourstore"
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label className="fw-bold">
                    <i className="fab fa-linkedin me-2"></i>
                    LinkedIn URL
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={settings.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourstore"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Footer Settings
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AdminFooter;
