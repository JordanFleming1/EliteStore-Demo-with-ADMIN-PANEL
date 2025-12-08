
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const Footer: React.FC = () => {

  const { siteName } = useSiteSettings();
  const [footerSettings, setFooterSettings] = useState({
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
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const { db } = await import('../firebase/firebase.config');
        const { doc, getDoc } = await import('firebase/firestore');
        const footerDoc = await getDoc(doc(db, 'settings', 'footer'));
        if (footerDoc.exists()) {
          const data = footerDoc.data();
          setFooterSettings({
            brandName: typeof data.brandName === 'string' ? data.brandName : siteName,
            brandDescription: typeof data.brandDescription === 'string' ? data.brandDescription : '',
            copyrightText: typeof data.copyrightText === 'string' ? data.copyrightText : `${siteName}. All rights reserved.`,
            socialLinks: {
              facebook: data.socialLinks?.facebook || '',
              twitter: data.socialLinks?.twitter || '',
              instagram: data.socialLinks?.instagram || '',
              linkedin: data.socialLinks?.linkedin || ''
            }
          });
        } else {
          setFooterSettings(prev => ({ ...prev, brandName: siteName, copyrightText: `${siteName}. All rights reserved.` }));
        }
      } catch {
        setFooterSettings(prev => ({ ...prev, brandName: siteName, copyrightText: `${siteName}. All rights reserved.` }));
      }
    };
    fetchFooterSettings();
  }, [siteName]);

  return (
    <footer className="bg-dark text-light mt-auto">
      <Container className="py-5">
        <Row className="g-4">
          {/* Brand Section */}
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h4 className="fw-bold mb-3" style={{ letterSpacing: '0.5px' }}>
              <i className="fas fa-shopping-bag me-2 text-primary"></i>
              <span className="text-white">{footerSettings.brandName || siteName}</span>
            </h4>
            <p className="text-white-50 mb-4 pe-lg-4" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
              {footerSettings.brandDescription || "Your premier destination for quality products at unbeatable prices. We're committed to providing exceptional customer service and fast, reliable shipping."}
            </p>
            <div className="d-flex gap-3 mt-2">
              {footerSettings.socialLinks.facebook && (
                <a href={footerSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="Facebook"><i className="fab fa-facebook fa-lg"></i></a>
              )}
              {footerSettings.socialLinks.twitter && (
                <a href={footerSettings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="Twitter"><i className="fab fa-twitter fa-lg"></i></a>
              )}
              {footerSettings.socialLinks.instagram && (
                <a href={footerSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="Instagram"><i className="fab fa-instagram fa-lg"></i></a>
              )}
              {footerSettings.socialLinks.linkedin && (
                <a href={footerSettings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white-50 hover-primary" aria-label="LinkedIn"><i className="fab fa-linkedin fa-lg"></i></a>
              )}
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} sm={6} className="mb-4 mb-lg-0">
            <h6 className="text-uppercase fw-semibold mb-3 text-white" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              Quick Links
            </h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/categories" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Categories
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/deals" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Deals
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Contact
                </Link>
              </li>
            </ul>
          </Col>

          {/* Customer Service */}
          <Col lg={3} md={6} sm={6} className="mb-4 mb-lg-0">
            <h6 className="text-uppercase fw-semibold mb-3 text-white" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              Customer Service
            </h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/help" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Shipping Info
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/returns" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Returns & Exchanges
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/track-order" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Track Order
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Order History
                </Link>
              </li>
            </ul>
          </Col>

          {/* My Account */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h6 className="text-uppercase fw-semibold mb-3 text-white" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
              My Account
            </h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/login" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Sign In
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/signup" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Create Account
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/wishlist" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  Wishlist
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white-50 text-decoration-none d-inline-block" style={{ fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  <i className="fas fa-chevron-right me-2" style={{ fontSize: '0.7rem' }}></i>
                  My Profile
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Divider */}
        <hr className="border-secondary my-4 opacity-25" />

        {/* Bottom Section */}
        <Row className="align-items-center g-3">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0 text-white-50" style={{ fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} <span className="text-white">{footerSettings.copyrightText || `${siteName}. All rights reserved.`}</span>
            </p>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-center justify-content-md-end gap-3 flex-wrap">
              <Link to="/privacy" className="text-white-50 text-decoration-none" style={{ fontSize: '0.85rem', transition: 'color 0.2s' }}>
                Privacy Policy
              </Link>
              <span className="text-white-50">|</span>
              <Link to="/terms" className="text-white-50 text-decoration-none" style={{ fontSize: '0.85rem', transition: 'color 0.2s' }}>
                Terms of Service
              </Link>
              <span className="text-white-50">|</span>
              <Link to="/cookies" className="text-white-50 text-decoration-none" style={{ fontSize: '0.85rem', transition: 'color 0.2s' }}>
                Cookies
              </Link>
            </div>
          </Col>
        </Row>

        {/* Payment Methods */}
        <Row className="mt-4 pt-3 border-top border-secondary border-opacity-25">
          <Col className="text-center">
            <p className="text-white-50 mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              We Accept
            </p>
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
              <i className="fab fa-cc-visa fs-3 text-white-50" style={{ opacity: '0.7' }}></i>
              <i className="fab fa-cc-mastercard fs-3 text-white-50" style={{ opacity: '0.7' }}></i>
              <i className="fab fa-cc-amex fs-3 text-white-50" style={{ opacity: '0.7' }}></i>
              <i className="fab fa-apple-pay fs-3 text-white-50" style={{ opacity: '0.7' }}></i>
              <i className="fab fa-google-pay fs-3 text-white-50" style={{ opacity: '0.7' }}></i>
            </div>
          </Col>
        </Row>
      </Container>

      <style>
        {`
          footer a:hover {
            color: #0d6efd !important;
            transform: translateX(3px);
          }
          
          footer .hover-primary:hover {
            color: #0d6efd !important;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;