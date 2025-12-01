import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import api from '../api/simple-api';

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
  stats: Array<{ number: string; label: string; icon: string }>;
  values: Array<{ icon: string; title: string; description: string; color: string }>;
  teamMembers: Array<{ name: string; role: string; image: string; bio: string }>;
  sustainabilityTitle?: string;
  sustainabilityDescription?: string;
  sustainabilityList?: string[];
  communityTitle?: string;
  communityDescription?: string;
  communityList?: string[];
}

const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getAboutPageSettings();
        setSettings(data as AboutSettings);
    } catch (error) {
      console.error('Error fetching about settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  if (!settings) {
    return (
      <Container className="py-5 text-center">
        <p>Failed to load about page content.</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto text-center">
          <h1 className="display-4 fw-bold mb-3">{settings.heroTitle}</h1>
          <p className="lead text-muted">
            {settings.heroDescription}
          </p>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="mb-5">
        {(settings.stats || []).map((stat, index) => (
          <Col lg={3} md={6} className="mb-4" key={index}>
            <Card className="text-center border-0 h-100 shadow-sm">
              <Card.Body>
                <div className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-3" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`${stat.icon} fa-2x text-primary`}></i>
                </div>
                <h3 className="fw-bold text-primary">{stat.number}</h3>
                <p className="text-muted mb-0">{stat.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Our Story (centered) */}
      <Row className="mb-5 justify-content-center">
        <Col lg={8} md={10} className="mb-4 mx-auto">
          <Card className="border-0 h-100 text-center">
            <Card.Body>
              <h2 className="mb-4">{settings.storyTitle}</h2>
              <p className="text-muted mb-3">{settings.storyParagraph1}</p>
              <p className="text-muted mb-3">{settings.storyParagraph2}</p>
              <p className="text-muted">{settings.storyParagraph3}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Our Values */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h2 className="fw-bold">Our Values</h2>
          <p className="text-muted">The principles that guide everything we do</p>
        </Col>
        {(settings.values || []).map((value, index) => (
          <Col lg={3} md={6} className="mb-4" key={index}>
            <Card className={`border-${value.color} h-100 shadow-sm`}>
              <Card.Body className="text-center">
                <div className={`bg-${value.color} bg-opacity-10 rounded-circle mx-auto mb-3`} 
                     style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`${value.icon} fa-lg text-${value.color}`}></i>
                </div>
                <h5 className="fw-bold mb-2">{value.title}</h5>
                <p className="text-muted small">{value.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Team Section (editable) */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h2 className="fw-bold">Meet Our Team</h2>
          <p className="text-muted">The people behind {settings.storeName}'s success</p>
        </Col>
        {(settings.teamMembers || []).length === 0 ? (
          <Col className="text-center text-muted">No team members added yet.</Col>
        ) : (
          (settings.teamMembers || []).map((member, index) => (
            <Col lg={4} md={6} className="mb-4" key={index}>
              <Card className="border-0 shadow-sm h-100">
                <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <Card.Body className="text-center">
                  <h5 className="fw-bold mb-1">{member.name}</h5>
                  <p className="text-primary fw-semibold mb-2">{member.role}</p>
                  <p className="text-muted small">{member.bio}</p>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Mission Statement */}
      <Row className="mb-5">
        <Col lg={12}>
          <Card className="border-0 shadow-lg" style={{ backgroundColor: '#0d6efd' }}>
            <Card.Body className="text-center py-5 px-4">
              <h2 className="fw-bold mb-4 text-white">{settings.missionTitle}</h2>
              <p className="lead mb-4 text-white" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {settings.missionDescription}
              </p>
              <div className="d-flex justify-content-center gap-4 flex-wrap mt-4">
                <div className="text-white">
                  <i className="fas fa-globe fa-2x mb-2 opacity-75"></i>
                  <p className="small mb-0 fw-semibold">Global Reach</p>
                </div>
                <div className="text-white">
                  <i className="fas fa-award fa-2x mb-2 opacity-75"></i>
                  <p className="small mb-0 fw-semibold">Quality Assurance</p>
                </div>
                <div className="text-white">
                  <i className="fas fa-handshake fa-2x mb-2 opacity-75"></i>
                  <p className="small mb-0 fw-semibold">Customer Trust</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sustainability & Community Section (editable) */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="border-0 h-100">
            <Card.Body>
              <h3 className="mb-3">
                <i className="fas fa-leaf text-success me-2"></i>
                {settings.sustainabilityTitle || 'Sustainability Commitment'}
              </h3>
              <p className="text-muted mb-3">
                {settings.sustainabilityDescription || "We're committed to reducing our environmental impact through sustainable business practices."}
              </p>
              <ul className="list-unstyled text-muted">
                {(settings.sustainabilityList || []).map((item: string, idx: number) => (
                  <li className="mb-2" key={idx}>
                    <i className="fas fa-check text-success me-2"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="border-0 h-100">
            <Card.Body>
              <h3 className="mb-3">
                <i className="fas fa-users text-primary me-2"></i>
                {settings.communityTitle || 'Community Impact'}
              </h3>
              <p className="text-muted mb-3">
                {settings.communityDescription || "We believe in giving back to the communities we serve."}
              </p>
              <ul className="list-unstyled text-muted">
                {(settings.communityList || []).map((item: string, idx: number) => (
                  <li className="mb-2" key={idx}>
                    <i className="fas fa-heart text-danger me-2"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;