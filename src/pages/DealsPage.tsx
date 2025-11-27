import React, { useState, useEffect } from 'react';
import { getCurrencySymbol } from '../utils/currencies';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { type Product } from '../types/index';
import { getProductImageSrc } from '../utils/imageUtils';

const DealsPage: React.FC = () => {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadDeals = async () => {
      setLoading(true);
      try {
        const allProducts = await productService.getAllProducts();
        const productsWithDeals = allProducts.filter(product => 
          product.salePrice || product.discountPrice
        );
        setDealProducts(productsWithDeals);
      } catch (error) {
        console.error('Error loading deals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const endTime = now + (2 * 24 * 60 * 60 * 1000);
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        const timeString = `${days}d ${hours}h ${minutes}m`;
        const newTimeLeft: { [key: string]: string } = {};
        dealProducts.forEach(product => {
          newTimeLeft[product.id] = timeString;
        });
        setTimeLeft(newTimeLeft);
      }
    };

    if (dealProducts.length > 0) {
      updateCountdowns();
      const interval = setInterval(updateCountdowns, 60000);
      return () => clearInterval(interval);
    }
  }, [dealProducts]);

  const calculateDiscount = (product: Product) => {
    const salePrice = product.salePrice || product.discountPrice;
    if (salePrice) {
      return Math.round((1 - salePrice / product.price) * 100);
    }
    return 0;
  };

  const getSalePrice = (product: Product) => {
    return product.salePrice || product.discountPrice || product.price;
  };

  return (
    <div className="deals-page">
      <div className="bg-danger text-white py-5 mb-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 fw-bold mb-3">🔥 Hot Deals & Special Offers</h1>
              <p className="lead mb-4">
                Limited time offers on our best products. Don't miss out on these amazing savings!
              </p>
              <Alert variant="warning" className="d-inline-block mb-0">
                <i className="fas fa-clock me-2"></i>
                <strong>Flash Sale Ends Soon!</strong> 
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {loading ? (
          <Row>
            <Col xs={12} className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading amazing deals...</p>
            </Col>
          </Row>
        ) : dealProducts.length > 0 ? (
          <>
            <Row className="mb-5">
              <Col xs={12}>
                <h2 className="h3 mb-4">
                  <i className="fas fa-star text-warning me-2"></i>
                  Featured Deals
                </h2>
              </Col>
            </Row>

            <Row className="g-4 mb-5">
              {dealProducts.slice(0, 3).map((product) => (
                <Col lg={4} md={6} key={product.id}>
                  <Card className="h-100 deal-card border-0 shadow">
                    <div className="position-relative">
                      <Card.Img 
                        variant="top" 
                        src={getProductImageSrc(product)}
                        style={{ height: '250px', objectFit: 'cover' }}
                        className="deal-image"
                      />
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 start-0 m-3 fs-6 px-3 py-2"
                      >
                        {calculateDiscount(product)}% OFF
                      </Badge>
                      {timeLeft[product.id] && (
                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-3">
                          <div className="d-flex align-items-center justify-content-center">
                            <i className="fas fa-clock me-2"></i>
                            <span className="fw-bold">{timeLeft[product.id]} left</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="secondary" className="text-uppercase small">
                          {product.category}
                        </Badge>
                        {product.stock && (
                          <Badge 
                            bg={product.stock > 10 ? 'success' : 'warning'} 
                            text={product.stock > 10 ? undefined : 'dark'}
                          >
                            {product.stock} left
                          </Badge>
                        )}
                      </div>
                      <Card.Title className="h5 mb-3">{product.name}</Card.Title>
                      <Card.Text className="text-muted mb-3 small">
                        {product.description}
                      </Card.Text>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                          <span className="h4 text-danger fw-bold mb-0">
                            {getCurrencySymbol(product.currency || 'USD')}{getSalePrice(product).toFixed(2)}
                          </span>
                          <span className="text-muted text-decoration-line-through ms-2">
                            {getCurrencySymbol(product.currency || 'USD')}{product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">You save</div>
                          <div className="fw-bold text-success">
                            {getCurrencySymbol(product.currency || 'USD')}{(product.price - getSalePrice(product)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-3">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}`}
                            ></i>
                          ))}
                        </div>
                        <small className="text-muted">({product.reviewCount} reviews)</small>
                      </div>
                      <Link 
                        to={`/product/${product.id}`} 
                        className="btn btn-danger w-100"
                      >
                        <i className="fas fa-shopping-cart me-2"></i>
                        Shop Now
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {dealProducts.length > 3 && (
              <>
                <Row className="mb-4">
                  <Col xs={12}>
                    <h2 className="h3 mb-4">
                      <i className="fas fa-tags text-primary me-2"></i>
                      All Deals
                    </h2>
                  </Col>
                </Row>

                <Row className="g-4">
                  {dealProducts.slice(3).map((product) => (
                    <Col lg={3} md={6} key={product.id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <div className="position-relative">
                          <Card.Img 
                            variant="top" 
                            src={getProductImageSrc(product)}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                          <Badge 
                            bg="danger" 
                            className="position-absolute top-0 start-0 m-2"
                          >
                            {calculateDiscount(product)}% OFF
                          </Badge>
                        </div>
                        <Card.Body>
                          <Card.Title className="h6 mb-2 text-truncate">
                            {product.name}
                          </Card.Title>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <Badge bg="outline-secondary" text="dark" className="small">
                              {product.category}
                            </Badge>
                            <div className="text-end">
                              <div className="fw-bold text-danger">
                                {getCurrencySymbol(product.currency || 'USD')}{getSalePrice(product).toFixed(2)}
                              </div>
                              <small className="text-muted text-decoration-line-through">
                                {getCurrencySymbol(product.currency || 'USD')}{product.price.toFixed(2)}
                              </small>
                            </div>
                          </div>
                          <Link 
                            to={`/product/${product.id}`} 
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            View Deal
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}

            <Row className="mt-5 pt-5 border-top">
              <Col lg={6} className="mx-auto text-center">
                <h3 className="h4 mb-3">Never Miss a Deal!</h3>
                <p className="text-muted mb-4">
                  Subscribe to our newsletter and be the first to know about exclusive offers and flash sales.
                </p>
                <div className="d-flex gap-2">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Enter your email address" 
                  />
                  <Button variant="primary" className="px-4">
                    Subscribe
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <Row>
            <Col xs={12} className="text-center py-5">
              <div className="text-center py-5">
                <i className="fas fa-tags text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                <h3 className="h4 text-muted mb-3">No Deals Available</h3>
                <p className="text-muted mb-4">
                  Check back later for amazing deals on our products!
                </p>
                <Link to="/products" className="btn btn-primary">
                  Browse All Products
                </Link>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default DealsPage;