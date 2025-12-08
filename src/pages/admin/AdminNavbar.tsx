import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

interface NavbarTheme {
  theme: 'light' | 'dark' | 'gradient' | 'retro' | 'pastel' | 'aqua' | 'pink-orange' | 'indigo';
}

const AdminNavbar: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<NavbarTheme['theme']>('dark');
  // const [loading, setLoading] = useState(true); // removed unused variable
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; variant: 'success' | 'danger'; message: string }>({
    show: false,
    variant: 'success',
    message: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const navbarDocRef = doc(db, 'settings', 'navbar');
        const navbarDoc = await getDoc(navbarDocRef);
        if (navbarDoc.exists()) {
          const data = navbarDoc.data();
          if (data && data.theme) {
            setCurrentTheme(data.theme);
          }
        }
      } catch (error) {
        // Optionally handle error
        setAlert({ show: true, variant: 'danger', message: 'Failed to load theme settings.' });
      } finally {
        // setLoading(false); // removed unused variable
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const navbarDocRef = doc(db, 'settings', 'navbar');
      await setDoc(navbarDocRef, { theme: currentTheme }, { merge: true });
      // Update localStorage.siteSettings instantly for live theme update
      try {
        const local = typeof window !== 'undefined' ? localStorage.getItem('siteSettings') : null;
        let siteSettings = { siteName: 'EliteStore', storeLogo: '', navbarTheme: 'light' };
        if (local) {
          try {
            const parsed = JSON.parse(local);
            siteSettings = { ...siteSettings, ...parsed };
          } catch {}
        }
        siteSettings.navbarTheme = currentTheme;
        localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
      } catch {}
      setAlert({ show: true, variant: 'success', message: 'Theme applied successfully!' });
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: 'Failed to save theme.' });
    } finally {
      setSaving(false);
    }
  };
  // Theme preview styles for admin panel
  const themePreviewStyles: Record<string, { background: string; color: string }> = {
    light: { background: '#f8f9fa', color: '#212529' },
    dark: { background: '#212529', color: '#fff' },
    gradient: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
    retro: { background: 'linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)', color: '#fff' },
    pastel: { background: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)', color: '#212529' },
    aqua: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
    'pink-orange': { background: 'linear-gradient(90deg, #ffb347 0%, #ff758c 50%, #ff7eb3 100%)', color: '#fff' },
    indigo: { background: 'linear-gradient(90deg, #3f2b96 0%, #a8c0ff 100%)', color: '#fff' },
  };
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-palette me-2"></i>
            Navbar Theme Customization
          </h2>
          <p className="text-muted mb-0">Choose a theme for your website navigation bar</p>
        </div>
      </div>
      {/* Live preview of the selected theme */}
      <div className="mb-4">
        <nav
          className="navbar rounded shadow mb-2"
          style={{
            background: (themePreviewStyles[currentTheme]?.background ?? '#f8f9fa'),
            color: (themePreviewStyles[currentTheme]?.color ?? '#212529'),
            minHeight: 56,
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>EliteStore Admin Navbar</span>
          <span style={{ fontSize: 14, fontWeight: 400 }}>Preview</span>
        </nav>
      </div>
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}
      <Form onSubmit={handleSave}>
        <Row xs={1} md={2} lg={4} className="g-4">
          {[
            {
              key: 'light',
              name: 'Light',
              preview: { background: '#f8f9fa', color: '#212529' },
            },
            {
              key: 'dark',
              name: 'Dark',
              preview: { background: '#212529', color: '#fff' },
            },
            {
              key: 'gradient',
              name: 'Gradient',
              preview: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
            },
            {
              key: 'retro',
              name: 'Retro Sunset',
              preview: { background: 'linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)', color: '#fff' },
            },
            {
              key: 'pastel',
              name: 'Pastel',
              preview: { background: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)', color: '#212529' },
            },
            {
              key: 'aqua',
              name: 'Aqua',
              preview: { background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
            },
            {
              key: 'pink-orange',
              name: 'Pink-Orange',
              preview: { background: 'linear-gradient(90deg, #ffb347 0%, #ff758c 50%, #ff7eb3 100%)', color: '#fff' },
            },
            {
              key: 'indigo',
              name: 'Indigo',
              preview: { background: 'linear-gradient(90deg, #3f2b96 0%, #a8c0ff 100%)', color: '#fff' },
            },
          ].map(theme => (
            <Col key={theme.key}>
              <Card
                className={`h-100 shadow-sm border-2 ${currentTheme === theme.key ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer', borderWidth: currentTheme === theme.key ? 3 : 1 }}
                onClick={() => setCurrentTheme(theme.key as NavbarTheme['theme'])}
                aria-label={`Select ${theme.name} theme`}
              >
                <div
                  style={{
                    height: 60,
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem',
                    background: theme.preview.background,
                    color: theme.preview.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {theme.name} Theme
                </div>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <Form.Check
                    type="radio"
                    name="navbarTheme"
                    id={`theme-${theme.key}`}
                    checked={currentTheme === theme.key}
                    onChange={() => setCurrentTheme(theme.key as NavbarTheme['theme'])}
                    label={currentTheme === theme.key ? 'Selected' : 'Choose'}
                  />
                </Card.Body>
              </Card>
            </Col>
          ))}
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
                Apply Theme
              </>
            )}
          </Button>
        </div>
      </Form>
      <Card className="mt-4 border-warning">
        <Card.Body className="bg-warning bg-opacity-10">
          <div className="d-flex align-items-start">
            <i className="fas fa-info-circle text-warning fs-4 me-3 mt-1"></i>
            <div>
              <h6 className="fw-bold mb-2">Note:</h6>
              <p className="mb-0 text-muted">
                    After applying a theme, you may need to refresh the page to see the changes take effect on the main website navigation bar.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    };

    export default AdminNavbar;
