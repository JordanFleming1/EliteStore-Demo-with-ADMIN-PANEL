import React, { useState, useEffect } from 'react';
import api from '../../api/simple-api';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

interface AboutSettings {
  storeName: string;
  heroTitle: string;
  heroDescription: string;
  foundedYear: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyParagraph3: string;
  missionTitle: string;
  missionDescription: string;
  teamMembers: Array<{ name: string; role: string; image: string; bio: string }>;
  sustainabilityTitle: string;
  sustainabilityDescription: string;
  sustainabilityList: string[];
  communityTitle: string;
  communityDescription: string;
  communityList: string[];
}

const AdminAbout: React.FC = () => {
  const [settings, setSettings] = useState<AboutSettings>({
    storeName: '',
    heroTitle: '',
    heroDescription: '',
    foundedYear: '',
    storyTitle: '',
    storyParagraph1: '',
    storyParagraph2: '',
    storyParagraph3: '',
    missionTitle: '',
    missionDescription: '',
    teamMembers: [],
    sustainabilityTitle: '',
    sustainabilityDescription: '',
    sustainabilityList: [],
    communityTitle: '',
    communityDescription: '',
    communityList: []
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getAboutPageSettings();
      setSettings({
        storeName: typeof data.storeName === 'string' ? data.storeName : '',
        heroTitle: typeof data.heroTitle === 'string' ? data.heroTitle : '',
        heroDescription: typeof data.heroDescription === 'string' ? data.heroDescription : '',
        foundedYear: typeof data.foundedYear === 'string' ? data.foundedYear : '',
        storyTitle: typeof data.storyTitle === 'string' ? data.storyTitle : '',
        storyParagraph1: typeof data.storyParagraph1 === 'string' ? data.storyParagraph1 : '',
        storyParagraph2: typeof data.storyParagraph2 === 'string' ? data.storyParagraph2 : '',
        storyParagraph3: typeof data.storyParagraph3 === 'string' ? data.storyParagraph3 : '',
        missionTitle: typeof data.missionTitle === 'string' ? data.missionTitle : '',
        missionDescription: typeof data.missionDescription === 'string' ? data.missionDescription : '',
        teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
        sustainabilityTitle: typeof data.sustainabilityTitle === 'string' ? data.sustainabilityTitle : '',
        sustainabilityDescription: typeof data.sustainabilityDescription === 'string' ? data.sustainabilityDescription : '',
        sustainabilityList: Array.isArray(data.sustainabilityList) ? data.sustainabilityList : [],
        communityTitle: typeof data.communityTitle === 'string' ? data.communityTitle : '',
        communityDescription: typeof data.communityDescription === 'string' ? data.communityDescription : '',
        communityList: Array.isArray(data.communityList) ? data.communityList : [],
      });
    } catch (error) {
      console.error('Error fetching about settings:', error);
      showAlert('danger', 'Failed to load settings');
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

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const newTeam = [...settings.teamMembers];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setSettings(prev => ({ ...prev, teamMembers: newTeam }));
  };

  const addTeamMember = () => {
    setSettings(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: '', role: '', image: '', bio: '' }]
    }));
  };

  const removeTeamMember = (index: number) => {
    setSettings(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleListChange = (field: 'sustainabilityList' | 'communityList', index: number, value: string) => {
    setSettings(prev => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field: 'sustainabilityList' | 'communityList') => {
    setSettings(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeListItem = (field: 'sustainabilityList' | 'communityList', index: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveAboutPageSettings(settings);
      showAlert('success', 'About page settings saved successfully!');
      // Reload settings to confirm save
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
        <p className="mt-3">Loading about page settings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-info-circle me-2"></i>
            About Page Customization
          </h2>
          <p className="text-muted mb-0">Customize your store's about page content</p>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      <Form onSubmit={handleSave}>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Store Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="storeName"
                    value={settings.storeName}
                    onChange={handleInputChange}
                    placeholder="EliteStore"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Founded Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="foundedYear"
                    value={settings.foundedYear}
                    onChange={handleInputChange}
                    placeholder="2018"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Hero Title</Form.Label>
              <Form.Control
                type="text"
                name="heroTitle"
                value={settings.heroTitle}
                onChange={handleInputChange}
                placeholder="About EliteStore"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Hero Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="heroDescription"
                value={settings.heroDescription}
                onChange={handleInputChange}
                placeholder="Your premier destination for quality products..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Story Title</Form.Label>
              <Form.Control
                type="text"
                name="storyTitle"
                value={settings.storyTitle}
                onChange={handleInputChange}
                placeholder="Our Story"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Story Paragraph 1</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="storyParagraph1"
                value={settings.storyParagraph1}
                onChange={handleInputChange}
                placeholder="Founded in 2018..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Story Paragraph 2</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="storyParagraph2"
                value={settings.storyParagraph2}
                onChange={handleInputChange}
                placeholder="We believe that shopping online..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Story Paragraph 3</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="storyParagraph3"
                value={settings.storyParagraph3}
                onChange={handleInputChange}
                placeholder="Today, we're proud to offer..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mission Title</Form.Label>
              <Form.Control
                type="text"
                name="missionTitle"
                value={settings.missionTitle}
                onChange={handleInputChange}
                placeholder="Our Mission"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mission Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="missionDescription"
                value={settings.missionDescription}
                onChange={handleInputChange}
                placeholder="To provide an exceptional online shopping experience..."
              />
            </Form.Group>

            {/* Team Members */}
            <div className="mb-4">
              <h4 className="fw-bold mb-3">Meet Our Team</h4>
              {(settings.teamMembers || []).map((member, index) => (
                <Card key={index} className="mb-3 border">
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={member.name}
                            onChange={e => handleTeamMemberChange(index, 'name', e.target.value)}
                            placeholder="Sarah Johnson"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Form.Control
                            type="text"
                            value={member.role}
                            onChange={e => handleTeamMemberChange(index, 'role', e.target.value)}
                            placeholder="Founder & CEO"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Image URL</Form.Label>
                          <Form.Control
                            type="text"
                            value={member.image}
                            onChange={e => handleTeamMemberChange(index, 'image', e.target.value)}
                            placeholder="/api/placeholder/300/300"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-0">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={member.bio}
                        onChange={e => handleTeamMemberChange(index, 'bio', e.target.value)}
                        placeholder="With over 15 years in retail..."
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end mt-2">
                      <Button variant="danger" size="sm" onClick={() => removeTeamMember(index)}>
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
              <Button variant="secondary" onClick={addTeamMember}>
                Add Team Member
              </Button>
            </div>

            {/* 1st Box */}
            <div className="mb-4">
              <h4 className="fw-bold mb-3">1st Box</h4>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="sustainabilityTitle"
                  value={settings.sustainabilityTitle}
                  onChange={handleInputChange}
                  placeholder="1st Box Title"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="sustainabilityDescription"
                  value={settings.sustainabilityDescription}
                  onChange={handleInputChange}
                  placeholder="1st Box Description..."
                />
              </Form.Group>
              <Form.Label>List Items</Form.Label>
              {(settings.sustainabilityList || []).map((item, idx) => (
                <div key={idx} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    value={item}
                    onChange={e => handleListChange('sustainabilityList', idx, e.target.value)}
                    placeholder="1st Box List Item"
                  />
                  <Button variant="danger" size="sm" className="ms-2" onClick={() => removeListItem('sustainabilityList', idx)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addListItem('sustainabilityList')}>
                Add List Item
              </Button>
            </div>

            {/* 2nd Box */}
            <div className="mb-4">
              <h4 className="fw-bold mb-3">2nd Box</h4>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="communityTitle"
                  value={settings.communityTitle}
                  onChange={handleInputChange}
                  placeholder="2nd Box Title"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="communityDescription"
                  value={settings.communityDescription}
                  onChange={handleInputChange}
                  placeholder="2nd Box Description..."
                />
              </Form.Group>
              <Form.Label>List Items</Form.Label>
              {(settings.communityList || []).map((item, idx) => (
                <div key={idx} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    value={item}
                    onChange={e => handleListChange('communityList', idx, e.target.value)}
                    placeholder="2nd Box List Item"
                  />
                  <Button variant="danger" size="sm" className="ms-2" onClick={() => removeListItem('communityList', idx)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addListItem('communityList')}>
                Add List Item
              </Button>
            </div>

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
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </Container>
  );
};

export default AdminAbout;
