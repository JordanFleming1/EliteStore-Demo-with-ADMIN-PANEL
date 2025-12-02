// Support all themes
// ...existing code...
import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Navbar, Nav, Container, NavDropdown, Badge, Form, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import NavbarEmployerButton from './NavbarEmployerButton';

import { productService } from '../services/productService';




const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { totalItems } = useCart();
  // const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { siteName, storeLogo, navbarTheme } = useSiteSettings();

  // (No local settings loading or fetch logic; use global context)

  // Load categories from products
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const products = await productService.getAllProducts();
        const uniqueCategories = Array.from(
          new Set(products.map(product => product.category).filter(Boolean))
        ).slice(0, 6); // Limit to 6 categories for the dropdown
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Helper function to check if a nav item is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to check if we're in a category page
  const isCategoryActive = () => {
    return location.pathname.startsWith('/category') || location.pathname === '/categories';
  };

  const handleLogout = async () => {
    try {
      await logout();
      // showToast('success', 'Logged Out', 'You have been logged out successfully.');
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
      // showToast('error', 'Logout Failed', 'Failed to log out. Please try again.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  // Get navbar styles based on theme
  const getNavbarStyles = () => {
    switch (navbarTheme) {
      case 'light':
        return {
          bg: 'light',
          variant: 'light' as const,
          className: 'navbar-minimal shadow-sm bg-light sticky-top',
          textClass: 'text-dark'
        };
      case 'gradient':
        return {
          bg: '',
          variant: 'dark' as const,
          className: 'navbar-gradient-blue shadow-sm sticky-top',
          style: {},
          textClass: 'text-white'
        };
      case 'frosted':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-frosted shadow-sm sticky-top',
          style: {},
          textClass: 'text-dark'
        };
      case 'retro':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-retro-sunset shadow-sm sticky-top',
          style: {},
          textClass: 'text-dark'
        };
      case 'pink-orange':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-gradient-pink shadow-sm sticky-top',
          style: {},
          textClass: 'text-white'
        };
      case 'indigo':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-gradient-indigo shadow-sm sticky-top',
          style: {},
          textClass: 'text-white'
        };
      case 'minimal':
        return {
          bg: 'white',
          variant: 'light' as const,
          className: 'navbar-minimal shadow-sm sticky-top',
          style: {},
          textClass: 'text-dark'
        };
      case 'pastel':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-pastel shadow-sm sticky-top',
          style: {},
          textClass: 'text-dark'
        };
      case 'underline':
        return {
          bg: 'white',
          variant: 'light' as const,
          className: 'navbar-underline shadow-sm sticky-top',
          style: {},
          textClass: 'text-dark'
        };
      case 'aqua':
        return {
          bg: '',
          variant: 'light' as const,
          className: 'navbar-gradient-aqua shadow-sm sticky-top',
          style: {},
          textClass: 'text-white'
        };
      case 'dark':
      default:
        return {
          bg: 'dark',
          variant: 'dark' as const,
          className: 'navbar-darkmode shadow-sm bg-dark sticky-top',
          style: {},
          textClass: 'text-white'
        };
    }
  };

  const navbarStyles = getNavbarStyles();

  // Theme options for selector


  // (No local loading spinner; handled globally)

  // Render the full navbar as before
  return (
    <>
      <Navbar 
        expand="lg" 
        bg={navbarStyles.bg}
        variant={navbarStyles.variant}
        className={navbarStyles.className}
        style={{ minHeight: '70px', ...navbarStyles.style }}
      >
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className={`fw-bold fs-3 ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''} d-flex align-items-center`}>
            {storeLogo ? (
              <>
                <img 
                  src={storeLogo} 
                  alt={siteName}
                  style={{ height: '40px', width: 'auto', maxWidth: '150px', objectFit: 'contain' }}
                  className="me-2"
                  onError={(e) => {
                    // If logo fails to load, hide it and show text only
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{siteName}</span>
              </>
            ) : (
              <>
                <i className="fas fa-shopping-bag me-2"></i>
                {siteName}
              </>
            )}
          </Navbar.Brand>

          <div className="d-flex d-lg-none align-items-center">
            <Link 
              to="/cart" 
              className={`btn ${navbarTheme === 'light' ? 'btn-outline-primary' : 'btn-outline-light'} position-relative me-2`}
              style={{ minWidth: '48px', minHeight: '48px' }}
              aria-label="Shopping cart"
            >
              <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.75rem' }}
                >
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Navbar.Toggle 
              aria-controls="offcanvas-navbar" 
              onClick={handleShowOffcanvas}
              className="border-0"
              style={{ minWidth: '48px', minHeight: '48px', padding: '12px' }}
              aria-label="Toggle navigation menu"
            />
          </div>

          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`fw-medium ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''} ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Nav.Link>
              <NavDropdown 
                title={<span className={(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'}>{'Categories'}</span>} 
                id="categories-dropdown" 
                className={`fw-medium ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''}`}
                data-active={isCategoryActive() ? 'true' : 'false'}
              >
                {categories.length > 0 ? (
                  <>
                    {categories.map((category) => (
                      <NavDropdown.Item 
                        key={category}
                        as={Link} 
                        to={`/categories?filter=${encodeURIComponent(category)}`}
                      >
                        {category}
                      </NavDropdown.Item>
                    ))}
                    <NavDropdown.Divider />
                  </>
                ) : (
                  <NavDropdown.Item disabled>
                    <span className="text-muted">No categories available</span>
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/categories">All Categories</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link 
                as={Link} 
                to="/products" 
                className={`fw-medium ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''} ${isActive('/products') ? 'active' : ''}`}
              >
                Products
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/deals" 
                className={`fw-medium ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''} ${isActive('/deals') ? 'active' : ''}`}
              >
                Deals
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/about" 
                className={`fw-medium ${(navbarTheme === 'light' || navbarTheme === 'frosted' || navbarTheme === 'minimal' || navbarTheme === 'pastel' || navbarTheme === 'underline' || navbarTheme === 'aqua') ? 'text-dark' : 'text-white'} ${(navbarTheme === 'pink-orange') ? 'text-white' : ''} ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/contact" 
                className={`fw-medium ${navbarTheme === 'light' ? 'text-dark' : 'text-white'} ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact
              </Nav.Link>
              <div className="d-inline-block align-middle ms-2">
                <NavbarEmployerButton />
              </div>
            </Nav>

            <Form className="d-flex mx-3 flex-grow-1" style={{ maxWidth: '400px' }} onSubmit={handleSearch}>
              <div className="input-group">
                <Form.Control
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`border-end-0 ${navbarTheme === 'light' ? '' : 'bg-dark text-white search-dark-theme'}`}
                />
                <Button 
                  variant={navbarTheme === 'light' ? 'outline-secondary' : 'outline-light'} 
                  type="submit" 
                  className="border-start-0"
                >
                  <i className="fas fa-search"></i>
                </Button>
              </div>
            </Form>

            <Nav className="align-items-center">
              <Nav.Link as={Link} to="/cart" className={`position-relative me-3 ${navbarTheme === 'light' ? 'text-dark' : 'text-white'}`}>
                <i className="fas fa-shopping-cart fs-5"></i>
                {totalItems > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {totalItems}
                  </Badge>
                )}
              </Nav.Link>

              {currentUser ? (
                <NavDropdown 
                  title={
                    <span className={navbarTheme === 'light' ? 'text-dark' : 'text-white'}>
                      <i className="fas fa-user-circle me-2"></i>
                      My Account
                    </span>
                  } 
                  id="user-dropdown" 
                  align="end"
                >
                  <NavDropdown.Header>
                    <div className="text-center">
                      <strong>{currentUser.displayName}</strong>
                      <br />
                      <small className="text-muted">{currentUser.email}</small>
                    </div>
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/account/settings">
                    <i className="fas fa-cog me-2"></i>Account Settings
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    <i className="fas fa-box me-2"></i>My Orders
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/wishlist">
                    <i className="fas fa-heart me-2"></i>Wishlist
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/addresses">
                    <i className="fas fa-map-marker-alt me-2"></i>Addresses
                  </NavDropdown.Item>
                  {currentUser.role === 'admin' && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin">
                        <i className="fas fa-cogs me-2"></i>Admin Panel
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className={`btn btn-sm ${navbarTheme === 'light' ? 'btn-outline-primary' : 'btn-outline-light'} text-dark`}>
                    Login
                  </Link>
                  <Link to="/signup" className={`btn btn-sm ${navbarTheme === 'light' ? 'btn-primary' : 'btn-light'} text-dark`}>
                    Sign Up
                  </Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="mb-4" onSubmit={handleSearch}>
            <div className="input-group">
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </Form>

          <Nav className="flex-column">
            <div className="navbar-employer-mobile" style={{ marginBottom: 12 }}>
              <NavbarEmployerButton />
            </div>

            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={handleCloseOffcanvas} 
              className={isActive('/') ? 'active' : ''}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/categories" 
              onClick={handleCloseOffcanvas} 
              className={isActive('/categories') || isCategoryActive() ? 'active' : ''}
            >
              Categories
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/deals" 
              onClick={handleCloseOffcanvas} 
              className={isActive('/deals') ? 'active' : ''}
            >
              Deals
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about" 
              onClick={handleCloseOffcanvas} 
              className={isActive('/about') ? 'active' : ''}
            >
              About
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              onClick={handleCloseOffcanvas} 
              className={isActive('/contact') ? 'active' : ''}
            >
              Contact
            </Nav.Link>
            
            <hr />
            
            {currentUser ? (
              <>
                <Nav.Link as={Link} to="/profile" onClick={handleCloseOffcanvas}>
                  <i className="fas fa-user me-2"></i>Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas}>
                  <i className="fas fa-box me-2"></i>My Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas}>
                  <i className="fas fa-heart me-2"></i>Wishlist
                </Nav.Link>
                {currentUser.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" onClick={handleCloseOffcanvas}>
                    <i className="fas fa-cogs me-2"></i>Admin Panel
                  </Nav.Link>
                )}
                <Nav.Link onClick={() => { handleLogout(); handleCloseOffcanvas(); }}>
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </Nav.Link>
              </>
            ) : (
              <div className="d-grid gap-2">
                <Link to="/login" className="btn btn-outline-primary" onClick={handleCloseOffcanvas}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={handleCloseOffcanvas}>
                  Sign Up
                </Link>
              </div>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;