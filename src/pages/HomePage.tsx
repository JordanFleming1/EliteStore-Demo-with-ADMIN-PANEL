import React, { useState, useEffect } from 'react';
import '../styles/homepage.css';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Container, Row, Col, Card, Carousel, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { type Product } from '../types/index';
import { getProductImageSrc } from '../utils/imageUtils';
import { getCurrencySymbol } from '../utils/currencies';
import api from '../api/simple-api';
import type { HeroSlide } from '../types/api-types';

const HomePage: React.FC = () => {
  // Try to load homepage data from localStorage first
  let initialProducts: Product[] = [];
  let initialHeroSlides: HeroSlide[] = [];
  let initialCategories: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem('homepageData');
      if (local) {
        const parsed = JSON.parse(local);
        initialProducts = parsed.products || [];
        initialHeroSlides = parsed.heroSlides || [];
        initialCategories = parsed.categories || [];
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProducts, slides] = await Promise.all([
          productService.getAllProducts(),
          api.getHeroSlides()
        ]);
        setProducts(allProducts);
        // Filter active slides and sort by order
        const activeSlides = slides
          .filter((slide: HeroSlide) => slide.isActive)
          .sort((a: HeroSlide, b: HeroSlide) => a.order - b.order);
        setHeroSlides(activeSlides);
        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(allProducts.map(product => product.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
        // Save to localStorage for instant reload next time
        localStorage.setItem('homepageData', JSON.stringify({
          products: allProducts,
          heroSlides: activeSlides,
          categories: uniqueCategories
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Mock data for demonstration
  // Get featured products from real data
  const featuredProducts = products.filter(product => product.featured).slice(0, 8);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);



  const { siteName } = useSiteSettings();
  return (
    <div className="homepage">
      {/* Hero Carousel */}
      <Carousel className="hero-carousel mb-0">
        {heroSlides.length > 0 ? (
          heroSlides.map((slide) => (
            <Carousel.Item key={slide.id}>
              <div 
                className="d-flex align-items-center justify-content-center" 
                style={{ 
                  height: '500px', 
                  background: slide.gradient || slide.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Container>
                  <Row className="align-items-center">
                    <Col lg={6} className="text-white">
                      <h1 className="display-4 fw-bold mb-4">{slide.title}</h1>
                      <p className="lead mb-4">{slide.subtitle}</p>
                    </Col>
                    <Col lg={6} className="d-none d-lg-block">
                      <img 
                        src={slide.image} 
                        alt={slide.title} 
                        className="img-fluid rounded-3 shadow-lg"
                        style={{ marginLeft: '80px' }} // Move hero image further right
                      />
                    </Col>
                  </Row>
                </Container>
              </div>
            </Carousel.Item>
          ))
        ) : (
          <Carousel.Item>
            <div className="d-flex align-items-center justify-content-center" style={{ height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Container>
                <Row className="align-items-center">
                  <Col lg={6} className="text-white">
                    <h1 className="display-4 fw-bold mb-4">Welcome to {siteName}</h1>
                    <p className="lead mb-4">
                      No hero slides configured. Please add slides from the admin panel.
                    </p>
                  </Col>
                </Row>
              </Container>
            </div>
          </Carousel.Item>
        )}
      </Carousel>

      {/* Categories Section - Match carousel layout exactly */}
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'auto', padding: '80px 0' }}>
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="text-center fw-bold mb-3">Shop by Category</h2>
              <p className="text-center text-muted">
                Discover our wide range of product categories
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {categories.length > 0 ? categories.map((category, index) => {
              const categoryProducts = products.filter(product => product.category === category);
              return (
                <Col lg={3} md={6} key={index}>
                  <Link to={`/products?category=${encodeURIComponent(category)}`} style={{ textDecoration: 'none' }} aria-label={`Browse ${category}`}>
                    <Card className="h-100 category-card border-0 shadow-sm position-relative">
                      <div className="position-relative overflow-hidden">
                        <Card.Img 
                          variant="top" 
                          src={categoryProducts[0] ? getProductImageSrc(categoryProducts[0]) : '/api/placeholder/250/200'}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <span className="btn btn-light opacity-0 category-btn">
                            Browse {category}
                          </span>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="h5 mb-2">{category}</Card.Title>
                        <Card.Text className="text-muted small">
                          {categoryProducts.length} products available
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              );
            }) : (
              <Col xs={12} className="text-center py-5">
                <p className="text-muted">No categories available yet. Add some products in the admin panel!</p>
              </Col>
            )}
          </Row>
        </Container>
      </div>

        {/* Featured Products Section - Match carousel layout exactly */}
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'auto', padding: '80px 0' }}>
          <Container>
            <Row className="mb-5">
              <Col>
                <h2 className="text-center fw-bold mb-3">Featured Products</h2>
                <p className="text-center text-muted">
                  Hand-picked products just for you
                </p>
              </Col>
            </Row>
            <Row className="g-4">
              {loading ? (
                <Col xs={12} className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </Col>
              ) : displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                  <Col lg={3} md={6} key={product.id}>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }} aria-label={`View ${product.name}`}>
                      <Card className="h-100 product-card border-0 shadow-sm position-relative">
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={getProductImageSrc(product)}
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                          {product.discountPrice && (
                            <Badge 
                              bg="danger" 
                              className="position-absolute top-0 start-0 m-2"
                            >
                              {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                            </Badge>
                          )}
                          <div className="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <span className="btn btn-primary opacity-0 product-btn">
                              Quick View
                            </span>
                          </div>
                        </div>
                        <Card.Body>
                          <Card.Title className="h6 mb-2 text-truncate">
                            {product.name}
                          </Card.Title>
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-2">
                              {[...Array(5)].map((_, i) => (
                                <i 
                                  key={i} 
                                  className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}`}
                                  style={{ fontSize: '0.8rem' }}
                                ></i>
                              ))}
                            </div>
                            <small className="text-muted">({product.reviewCount})</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              {product.discountPrice ? (
                                <>
                                  <span className="fw-bold text-primary">
                                    {getCurrencySymbol(product.currency || 'USD')}{product.discountPrice}
                                  </span>
                                  <span className="text-muted text-decoration-line-through ms-1 small">
                                    {getCurrencySymbol(product.currency || 'USD')}{product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="fw-bold text-primary">
                                  {getCurrencySymbol(product.currency || 'USD')}{product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))
              ) : (
                <Col xs={12} className="text-center py-5">
                  <h5 className="text-muted mb-3">No Products Available</h5>
                  <p className="text-muted">Check back later for new products!</p>
                </Col>
              )}
            </Row>
            <Row className="mt-5">
              <Col className="text-center">
                <Link to="/products" className="btn btn-outline-primary btn-lg">
                  View All Products
                </Link>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Features Section - Match carousel layout exactly */}
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'auto', padding: '80px 0', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <Container>
            <Row className="g-4">
              <Col lg={3} md={6} className="text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-shipping-fast fs-1 text-primary"></i>
                </div>
                <h5 className="fw-bold">Free Shipping</h5>
                <p className="text-muted">
                  Free delivery on orders over $50
                </p>
              </Col>
              <Col lg={3} md={6} className="text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-undo fs-1 text-primary"></i>
                </div>
                <h5 className="fw-bold">Easy Returns</h5>
                <p className="text-muted">
                  30-day money back guarantee
                </p>
              </Col>
              <Col lg={3} md={6} className="text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-headset fs-1 text-primary"></i>
                </div>
                <h5 className="fw-bold">24/7 Support</h5>
                <p className="text-muted">
                  Round-the-clock customer service
                </p>
              </Col>
              <Col lg={3} md={6} className="text-center">
                <div className="feature-icon mb-3">
                  <i className="fas fa-lock fs-1 text-primary"></i>
                </div>
                <h5 className="fw-bold">Secure Payment</h5>
                <p className="text-muted">
                  100% secure payment processing
                </p>
              </Col>
            </Row>
          </Container>
        </div>
    </div>
  );
};

export default HomePage;