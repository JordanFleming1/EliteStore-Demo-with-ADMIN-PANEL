import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { type Product } from '../types/index';
import { getProductImageSrc } from '../utils/imageUtils';

interface CategoryInfo {
  name: string;
  productCount: number;
  products: Product[];
  image: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        // Get all products and organize by category
        const allProducts = await productService.getAllProducts();
        
        // Group products by category
        const categoryMap = new Map<string, Product[]>();
        
        allProducts.forEach(product => {
          if (product.category) {
            const existing = categoryMap.get(product.category) || [];
            categoryMap.set(product.category, [...existing, product]);
          }
        });

        // Convert to CategoryInfo array
        const categoryList: CategoryInfo[] = Array.from(categoryMap.entries()).map(([name, products]) => ({
          name,
          productCount: products.length,
          products,
          image: products[0]?.images[0] || '/api/placeholder/300/200' // Use first product's image
        }));

        // Sort categories by product count (descending)
        categoryList.sort((a, b) => b.productCount - a.productCount);
        
        setCategories(categoryList);
        
        // Check if we need to auto-select a category from URL params
        const filterParam = searchParams.get('filter');
        if (filterParam && categoryList.find(cat => cat.name === filterParam)) {
          setSelectedCategory(filterParam);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchParams]);

  const filteredProducts = selectedCategory 
    ? categories.find(cat => cat.name === selectedCategory)?.products || []
    : [];

  if (loading) {
    return (
      <Container className="py-5">
        <Row>
          <Col xs={12} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading categories...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="categories-page">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 fw-bold mb-3">Shop by Category</h1>
              <p className="lead mb-4">
                Discover our wide range of products organized by category for easy browsing.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Category Stats */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <div className="d-flex justify-content-between align-items-center p-4 bg-light rounded">
              <div>
                <h6 className="mb-1 text-muted">Total Categories</h6>
                <div className="h3 mb-0 fw-bold text-primary">{categories.length}</div>
              </div>
              <div className="text-center">
                <h6 className="mb-1 text-muted">Total Products</h6>
                <div className="h3 mb-0 fw-bold text-success">
                  {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </div>
              </div>
              <div className="text-end">
                <h6 className="mb-1 text-muted">Popular Category</h6>
                <div className="fw-bold text-info">
                  {categories.length > 0 ? categories[0].name : 'None'}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {categories.length > 0 ? (
          <>
            {/* Categories Grid */}
            <Row className="mb-5">
              <Col xs={12}>
                <h2 className="h3 mb-4">
                  <i className="fas fa-th-large text-primary me-2"></i>
                  Browse Categories
                </h2>
              </Col>
            </Row>

            <Row className="g-4 mb-5">
              {categories.map((category, index) => (
                <Col lg={4} md={6} key={category.name}>
                  <Card 
                    className={`h-100 category-card border-0 shadow-sm ${selectedCategory === category.name ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="position-relative overflow-hidden">
                      <Card.Img 
                        variant="top" 
                        src={category.image}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 end-0 m-3">
                        <Badge bg="primary" className="fs-6">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-0">
                        <Button 
                          variant="light" 
                          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        >
                          <i className="fas fa-eye me-2"></i>
                          {selectedCategory === category.name ? 'Hide Products' : 'View Products'}
                        </Button>
                      </div>
                    </div>
                    <Card.Body>
                      <Card.Title className="h5 mb-2">
                        <i className="fas fa-tag text-primary me-2"></i>
                        {category.name}
                      </Card.Title>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div className="text-muted small">Products Available</div>
                          <div className="fw-bold text-success">{category.productCount}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-muted small">Price Range</div>
                          <div className="fw-bold">
                            ${Math.min(...category.products.map(p => p.price)).toFixed(0)} - ${Math.max(...category.products.map(p => p.price)).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="d-grid">
                        <Button 
                          variant={selectedCategory === category.name ? 'primary' : 'outline-primary'}
                          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        >
                          <i className={`fas ${selectedCategory === category.name ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>
                          {selectedCategory === category.name ? 'Hide Products' : 'View Products'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Selected Category Products */}
            {selectedCategory && filteredProducts.length > 0 && (
              <Row className="mb-5">
                <Col xs={12}>
                  <div className="bg-light p-4 rounded mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="h4 mb-0">
                        <i className="fas fa-boxes text-primary me-2"></i>
                        {selectedCategory} Products ({filteredProducts.length})
                      </h3>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        <i className="fas fa-times me-2"></i>
                        Close
                      </Button>
                    </div>
                  </div>
                </Col>
                
                {filteredProducts.map((product) => (
                  <Col lg={3} md={6} key={product.id} className="mb-4">
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
                        <Card.Title className="h6 mb-2 text-truncate">
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
                                  ${(product.salePrice || product.discountPrice)?.toFixed(2)}
                                </span>
                                <span className="text-muted text-decoration-line-through ms-1 small">
                                  ${product.price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
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
            )}
          </>
        ) : (
          <Row>
            <Col xs={12} className="text-center py-5">
              <div className="text-center py-5">
                <i className="fas fa-th-large text-muted mb-3" style={{ fontSize: '4rem' }}></i>
                <h3 className="h4 text-muted mb-3">No Categories Available</h3>
                <p className="text-muted mb-4">
                  Categories will appear here once products are added by the admin.
                </p>
                <Link to="/" className="btn btn-primary">
                  <i className="fas fa-home me-2"></i>
                  Back to Home
                </Link>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      <style>{`
        .category-card:hover .category-overlay {
          opacity: 1 !important;
        }
        .category-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;