import { getCurrencySymbol } from '../utils/currencies';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { type Product } from '../types/index';
import { getProductImageSrc } from '../utils/imageUtils';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
        setFilteredProducts(allProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(allProducts.map(product => product.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'stock':
          return b.stock - a.stock;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <Container className="py-5">
        <Row>
          <Col xs={12} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading products...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="products-page">
      {/* Hero Section */}
      <div className="bg-primary text-white py-4 mb-4">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-5 fw-bold mb-3">All Products</h1>
              <p className="lead mb-0">
                Browse our complete collection of {products.length} products
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Filters */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Search Products</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Filter by Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col lg={3} md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Sort By</Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="stock">Stock (High to Low)</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col lg={3} md={6} className="mb-3 d-flex align-items-end">
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('name');
              }}
            >
              <i className="fas fa-undo me-2"></i>
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Results Summary */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Products</h5>
                <p className="text-muted mb-0">
                  Showing {filteredProducts.length} of {products.length} products
                  {selectedCategory && ` in "${selectedCategory}"`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <Row className="g-4">
            {filteredProducts.map((product) => (
              <Col lg={3} md={6} key={product.id}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={getProductImageSrc(product)}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    {(product.salePrice || product.discountPrice) && (
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 start-0 m-2"
                      >
                        Sale
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge 
                        bg="warning" 
                        text="dark"
                        className="position-absolute top-0 end-0 m-2"
                      >
                        Featured
                      </Badge>
                    )}
                  </div>
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg="secondary" className="small">
                        {product.category}
                      </Badge>
                    </div>
                    <Card.Title className="h6 mb-2">
                      {product.name}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-2">
                      {product.category}
                    </Card.Text>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        {product.salePrice || product.discountPrice ? (
                          <>
                            <span className="fw-bold text-primary">
                              {getCurrencySymbol(product.currency)}{(product.salePrice || product.discountPrice)?.toFixed(2)}
                            </span>
                            <span className="text-muted text-decoration-line-through ms-1 small">
                              {getCurrencySymbol(product.currency)}{product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="fw-bold text-primary">{getCurrencySymbol(product.currency)}{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="small">
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center mb-3">
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
                    <Link 
                      to={`/product/${product.id}`} 
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Product
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row>
            <Col xs={12} className="text-center py-5">
              <div className="text-center py-5">
                <i className="fas fa-search text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                <h3 className="h4 text-muted mb-3">No Products Found</h3>
                <p className="text-muted mb-4">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No products are available at the moment.'}
                </p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  <i className="fas fa-undo me-2"></i>
                  Clear Filters
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default ProductsPage;