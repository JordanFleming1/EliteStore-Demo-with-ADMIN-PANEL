import React, { useState, useEffect } from 'react';
import { getCurrencySymbol } from '../utils/currencies';

import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Spinner, 
  Alert, 
  Nav,
  Tab,
  Form,
  ButtonGroup,
  Modal,
  Carousel
} from 'react-bootstrap';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import { api } from '../api/simple-api';
import type { Product, Review } from '../types/index';
import { getProductImageSrc } from '../utils/imageUtils';


const ProductDetailPage: React.FC = () => {


  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Review system state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First try to fetch from Firebase (for admin-created products)
        let foundProduct: Product | null = null;
        
        try {
          foundProduct = await productService.getProduct(id);
        } catch (firebaseError) {
          console.log('Product not in Firebase, trying JSON Server...', firebaseError);
        }
        
        // If not in Firebase, try JSON Server API
        if (!foundProduct) {
          try {
            foundProduct = await api.getProduct(id);
          } catch (apiError) {
            console.log('Product not in JSON Server either', apiError);
          }
        }
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Fetch reviews for this product
    const fetchReviews = async () => {
      setReviewLoading(true);
      setReviewError(null);
      try {
        if (id) {
          const reviews = await api.getReviews(id);
          setReviews(reviews || []);
        }
      } catch {
        setReviewError('Failed to load reviews');
      }
      setReviewLoading(false);
    };
    fetchReviews();
  }, [id]);

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  // Submit review handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      if (id) {
        await api.createReview({
          productId: id,
          rating: newRating,
          comment: newComment,
          createdAt: new Date()
        });
        setNewRating(5);
        setNewComment('');
        // Refresh reviews
        const reviews = await api.getReviews(id);
        setReviews(reviews || []);
        showToast('success', 'Review submitted!', `${product?.name || 'Product'} review added.`);
      }
    } catch {
      showToast('error', 'Failed to submit review', 'Please try again.');
    }
    setSubmittingReview(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!currentUser) {
      showToast('warning', 'Please log in', 'You must be logged in to add to cart.');
      navigate('/login');
      return;
    }
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
    showToast('success', 'Added to Cart!', `${product.name} has been added to your cart.`);
    setTimeout(() => {
      navigate('/cart');
    }, 500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!currentUser) {
      showToast('warning', 'Please log in', 'You must be logged in to buy now.');
      navigate('/login');
      return;
    }
    // Go directly to checkout with product info (do not add to cart)
    navigate('/checkout', {
      state: {
        directBuy: true,
        product: product,
        selectedSize,
        selectedColor,
        quantity
      }
    });
  };

  const discountPercentage = product?.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const currentPrice = product?.discountPrice || product?.price || 0;

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading product details...</div>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>Sorry, the product you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Browse All Products
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.category}`} className="text-decoration-none">
              {product.category}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <Row>
        {/* Product Images */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {/* Main Product Image */}
              <div 
                className="position-relative" 
                style={{ cursor: 'zoom-in' }}
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={getProductImageSrc(product, activeImageIndex)}
                  alt={product.name}
                  className="w-100 rounded"
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                
                {/* Discount Badge */}
                {product.discountPrice && (
                  <div className="position-absolute top-0 start-0 m-3">
                    <Badge bg="danger" className="fs-6 px-3 py-2">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}

                {/* Zoom Indicator */}
                <div className="position-absolute bottom-0 end-0 m-3">
                  <Badge bg="dark" className="opacity-75">
                    <i className="fas fa-search-plus me-1"></i>
                    Click to zoom
                  </Badge>
                </div>
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <Row className="g-2 mt-2 px-3 pb-3">
                  {product.images.map((_image, index) => (
                    <Col xs={3} key={index}>
                      <img
                        src={getProductImageSrc(product, index)}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-100 rounded cursor-pointer border ${
                          activeImageIndex === index ? 'border-primary border-3' : 'border-light'
                        }`}
                        style={{ height: '80px', objectFit: 'cover' }}
                        onClick={() => setActiveImageIndex(index)}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Product Information */}
        <Col lg={6}>
          <div className="mb-3">
            <Badge bg="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="fw-bold mb-3">{product.name}</h1>
            
            {/* Rating */}
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}`}
                  ></i>
                ))}
              </div>
              <span className="fw-bold me-2">{product.rating.toFixed(1)}</span>
              <span className="text-muted">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {product.discountPrice ? (
                <div>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <span className="fs-2 fw-bold text-primary">
                      {getCurrencySymbol(product.currency || '')}{product.discountPrice.toFixed(2)}
                    </span>
                    <span className="fs-4 text-muted text-decoration-line-through">
                      {getCurrencySymbol(product.currency || '')}{product.price.toFixed(2)}
                    </span>
                    <Badge bg="success" className="fs-6">
                      Save {getCurrencySymbol(product.currency || '')}{(product.price - product.discountPrice).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="fs-2 fw-bold text-primary mb-2">
                  {getCurrencySymbol(product.currency || '')}{product.price.toFixed(2)}
                </div>
              )}
              <small className="text-muted">Price includes all taxes</small>
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <div>
                  <Badge bg="success" className="me-2">In Stock</Badge>
                  {product.stock <= 10 && (
                    <Badge bg="warning" text="dark">
                      Only {product.stock} left!
                    </Badge>
                  )}
                  <div className="text-muted small mt-1">
                    {product.stock > 10 ? 'Available' : `Hurry, only ${product.stock} left in stock!`}
                  </div>
                </div>
              ) : (
                <Badge bg="danger">Out of Stock</Badge>
              )}
            </div>

            {/* Size Selection (if applicable) */}
            {product.category === 'Clothing' && (
              <div className="mb-3">
                <label className="form-label fw-bold">Size:</label>
                <ButtonGroup className="d-flex">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedSize(size)}
                      className="flex-fill"
                    >
                      {size}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            )}

            {/* Color Selection (if applicable) */}
            {product.category === 'Clothing' && (
              <div className="mb-3">
                <label className="form-label fw-bold">Color:</label>
                <ButtonGroup className="d-flex">
                  {['Black', 'White', 'Blue', 'Red', 'Green'].map(color => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedColor(color)}
                      className="flex-fill"
                    >
                      {color}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="form-label fw-bold">Quantity:</label>
              <div className="d-flex align-items-center">
                <ButtonGroup>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock}
                    style={{ width: '80px', textAlign: 'center' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </ButtonGroup>
                <small className="text-muted ms-3">
                  Subtotal: <strong>{getCurrencySymbol(product.currency || '')}{(currentPrice * quantity).toFixed(2)}</strong>
                </small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 mb-4">
              <div className="row g-2">
                <div className="col-md-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    <i className="fas fa-bolt me-2"></i>
                    Buy Now
                  </Button>
                </div>
                <div className="col-md-6">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="w-100"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isInCart(product.id)}
                  >
                    <i className={`fas ${isInCart(product.id) ? 'fa-check' : 'fa-shopping-cart'} me-2`}></i>
                    {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
              
              <Button variant="outline-secondary" size="sm">
                <i className="fas fa-heart me-2"></i>
                Add to Wishlist
              </Button>
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <Card className="bg-light border-0">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Key Features:</h6>
                  <ul className="mb-0">
                    {product.features.map((feature, index) => (
                      <li key={index} className="mb-1">
                        <i className="fas fa-check text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row className="mt-5">
        <Col>
          <Tab.Container activeKey={activeTab} onSelect={(tab) => setActiveTab(tab || 'description')}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="description">Description</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="specifications">Specifications</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews">Reviews ({product.reviewCount})</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shipping">Shipping & Returns</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="description">
                <Card className="border-0">
                  <Card.Body className="p-4">
                    <h5 className="mb-3">Product Description</h5>
                    <p className="mb-4" style={{ lineHeight: '1.8' }}>
                      {product.description}
                    </p>
                    
                    {product.features && (
                      <div>
                        <h6 className="mb-3">Features & Benefits:</h6>
                        <Row>
                          {product.features.map((feature, index) => (
                            <Col md={6} key={index} className="mb-2">
                              <div className="d-flex align-items-start">
                                <i className="fas fa-star text-warning me-2 mt-1"></i>
                                <span>{feature}</span>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="specifications">
                <Card className="border-0">
                  <Card.Body className="p-4">
                    <h5 className="mb-3">Product Specifications</h5>
                    <table className="table table-striped">
                      <tbody>
                        <tr>
                          <td className="fw-bold">Product ID</td>
                          <td>{product.id}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Category</td>
                          <td>{product.category}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Brand</td>
                          <td>Premium Store Brand</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Availability</td>
                          <td>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Rating</td>
                          <td>{product.rating}/5 ({product.reviewCount} reviews)</td>
                        </tr>
                        <tr>
                          <td className="fw-bold">Tags</td>
                          <td>
                            {product.tags?.map((tag, index) => (
                              <Badge key={index} bg="secondary" className="me-1">
                                {tag}
                              </Badge>
                            )) || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="reviews">
                <Card className="border-0">
                  <Card.Body className="p-4">
                    <h5 className="mb-3">Customer Reviews</h5>
                    {reviewLoading ? (
                      <Spinner animation="border" />
                    ) : reviewError ? (
                      <Alert variant="danger">{reviewError}</Alert>
                    ) : (
                      <>
                        {averageRating && (
                          <div>
                            <strong>Average Rating:</strong> {averageRating} / 5
                          </div>
                        )}
                        {reviews.length === 0 ? (
                          <div>No reviews yet.</div>
                        ) : (
                          <ul className="list-unstyled mt-2">
                            {reviews.map((r, idx) => (
                              <li key={r.id || idx} className="mb-3">
                                <div><strong>Rating:</strong> {r.rating} / 5</div>
                                <div>{r.comment}</div>
                                <small className="text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</small>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                    <h5 className="mt-4">Write a Review</h5>
                    <Form onSubmit={handleReviewSubmit}>
                      <Form.Group className="mb-2">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select value={newRating} onChange={e => setNewRating(Number(e.target.value))}>
                          {[5,4,3,2,1].map(val => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Comment</Form.Label>
                        <div style={{ border: '1px solid #ced4da', borderRadius: '0.25rem', padding: '4px', background: '#fff' }}>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            required
                            style={{ border: 'none', boxShadow: 'none', resize: 'vertical' }}
                          />
                        </div>
                      </Form.Group>
                      <Button type="submit" disabled={submittingReview} variant="primary">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="shipping">
                <Card className="border-0">
                  <Card.Body className="p-4">
                    <h5 className="mb-3">Shipping & Returns</h5>
                    <Row>
                      <Col md={6}>
                        <h6>Shipping Information</h6>
                        <ul>
                          <li>Free shipping on orders over $50</li>
                          <li>Standard delivery: 3-5 business days</li>
                          <li>Express delivery: 1-2 business days</li>
                          <li>Same day delivery available in select areas</li>
                        </ul>
                      </Col>
                      <Col md={6}>
                        <h6>Return Policy</h6>
                        <ul>
                          <li>30-day hassle-free returns</li>
                          <li>Free return shipping</li>
                          <li>Full refund or exchange</li>
                          <li>Items must be in original condition</li>
                        </ul>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Image Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)} 
        size="lg" 
        centered
        className="image-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>{product.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {product.images && product.images.length > 1 ? (
            <Carousel 
              activeIndex={activeImageIndex} 
              onSelect={setActiveImageIndex}
              className="product-carousel"
            >
              {product.images.map((_image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={getProductImageSrc(product, index)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-100"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <img
              src={getProductImageSrc(product, 0)}
              alt={product.name}
              className="w-100"
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;