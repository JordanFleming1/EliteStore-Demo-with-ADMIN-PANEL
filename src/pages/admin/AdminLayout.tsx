import React from 'react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { Container, Row, Col, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    // Debug banner to show current theme
    const DebugThemeBanner = () => (
      <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 9999, background: '#ffd700', color: '#222', textAlign: 'center', fontWeight: 700, fontSize: 16, padding: '4px 0'}}>
        Admin Theme: <span style={{textTransform: 'capitalize'}}>{currentTheme}</span>
      </div>
    );
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Use global site settings context for theme
  const { navbarTheme: currentTheme } = useSiteSettings();

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  // Determine if theme is custom (not light/dark/pastel)
  // Map theme key to correct CSS class
  const themeClassMap: Record<string, string> = {
    light: 'theme-light',
    dark: 'theme-dark',
    gradient: 'theme-gradient',
    retro: 'theme-retro',
    pastel: 'theme-pastel',
    aqua: 'theme-aqua',
    'pink-orange': 'theme-pink-orange',
    indigo: 'theme-indigo',
  };
  const adminNavbarClass = `admin-navbar fixed-top ${themeClassMap[currentTheme] || themeClassMap['light']}`;
  const isCustomTheme = !['light', 'dark', 'pastel'].includes(currentTheme);
  return (
    <div className="admin-layout">
      <DebugThemeBanner />
      {/* Admin Header */}
      <Navbar
        expand="lg"
        className={adminNavbarClass}
        {...(isCustomTheme ? {} : {
          bg: currentTheme === 'light' || currentTheme === 'pastel' ? 'light' : 'dark',
          variant: currentTheme === 'light' || currentTheme === 'pastel' ? 'light' : 'dark'
        })}
      >
        <Container fluid>
          <Nav className="w-100 align-items-center d-flex flex-row justify-content-between">
            <div className="d-flex align-items-center">
              <Navbar.Brand as={Link} to="/admin" className="me-2">
                <i className="fas fa-cogs me-2"></i>
                Admin Dashboard
              </Navbar.Brand>
              <button className="admin-sidebar-toggle d-lg-none me-2" onClick={handleSidebarToggle} aria-label="Toggle sidebar">
                <i className="fas fa-bars"></i>
              </button>
            </div>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                onClick={() => {
                  // Force reload to ensure theme is instantly applied
                  window.location.href = '/';
                }}
                className="me-2"
              >
                <i className="fas fa-home me-1"></i>
                View Store
              </Button>
              <Button 
                variant="outline-light" 
                onClick={handleLogout}
                className="me-2"
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </Button>
            </div>
          </Nav>
        </Container>
      </Navbar>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay d-lg-none"
          onClick={handleSidebarClose}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 1049,
          }}
        />
      )}

      <Container fluid className="admin-container p-0">
        <Row className="g-0">
          {/* Sidebar */}
          <Col md={3} lg={2} className={`admin-sidebar bg-light${sidebarOpen ? ' show' : ''}`} onClick={handleSidebarClose}>
            {/* Mobile quick actions */}
            <div className="d-lg-none px-3 pt-3 pb-2 border-bottom mb-2">
              <Button 
                variant="outline-secondary"
                onClick={() => { window.location.href = '/'; }}
                className="w-100 mb-2"
              >
                <i className="fas fa-home me-1"></i>
                View Store
              </Button>
              <Button 
                variant="outline-light" 
                onClick={handleLogout}
                className="w-100"
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </Button>
            </div>
            <Nav className="flex-column admin-nav pt-3" onClick={e => e.stopPropagation()}>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/dashboard" className="admin-nav-link">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/products" className="admin-nav-link">
                  <i className="fas fa-box me-2"></i>
                  Products
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/orders" className="admin-nav-link">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Orders
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/customers" className="admin-nav-link">
                  <i className="fas fa-users me-2"></i>
                  Customers
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/analytics" className="admin-nav-link">
                  <i className="fas fa-chart-bar me-2"></i>
                  Analytics
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/hero-slides" className="admin-nav-link">
                  <i className="fas fa-images me-2"></i>
                  Hero Slides
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/contact" className="admin-nav-link">
                  <i className="fas fa-envelope me-2"></i>
                  Contact
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/about" className="admin-nav-link">
                  <i className="fas fa-info-circle me-2"></i>
                  About Page
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/footer" className="admin-nav-link">
                  <i className="fas fa-shoe-prints me-2"></i>
                  Footer
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/navbar" className="admin-nav-link">
                  <i className="fas fa-palette me-2"></i>
                  Navbar Theme
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/admin/settings" className="admin-nav-link">
                  <i className="fas fa-cog me-2"></i>
                  Settings
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="admin-main-content bg-light" style={{ marginTop: 64 }}>
            <div className="p-3 p-lg-4">
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;