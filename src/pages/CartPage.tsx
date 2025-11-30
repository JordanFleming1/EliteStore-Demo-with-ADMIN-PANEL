import React from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { getProductImageSrc } from '../utils/imageUtils';

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const shippingCost = totalPrice > 50 ? 0 : 9.99;
  const taxAmount = totalPrice * 0.08; // 8% tax
  const finalTotal = totalPrice + shippingCost + taxAmount;

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center text-center">
          <Col md={6}>
            <div className="mb-4">
              <i className="fas fa-shopping-cart fa-5x text-muted mb-3"></i>
              <h3 className="fw-bold mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">
                Looks like you haven't added any items to your cart yet. 
                Discover amazing products and start shopping!
              </p>
              <Link to="/" className="btn btn-primary btn-lg">
                Continue Shopping
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Shopping Cart</h2>
            <Badge bg="primary" pill className="fs-6">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-0">
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-md-block">
                <Table className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3 ps-4">Product</th>
                      <th className="border-0 py-3 text-center">Quantity</th>
                      <th className="border-0 py-3 text-center">Price</th>
                      <th className="border-0 py-3 text-center">Total</th>
                      <th className="border-0 py-3 text-center pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const itemPrice = item.product.discountPrice || item.product.price;
                      const itemTotal = itemPrice * item.quantity;
                      
                      return (
                        <tr key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}>
                          <td className="py-4 ps-4">
                            <div className="d-flex align-items-center">
                              <img
                                src={getProductImageSrc(item.product)}
                                alt={item.product.name}
                                className="rounded me-3"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              />
                              <div>
                                <h6 className="fw-bold mb-1">
                                  <Link 
                                    to={`/product/${item.productId}`} 
                                    className="text-decoration-none text-dark"
                                  >
                                    {item.product.name}
                                  </Link>
                                </h6>
                                <div className="text-muted small">
                                  {item.selectedSize && (
                                    <span className="me-2">Size: {item.selectedSize}</span>
                                  )}
                                  {item.selectedColor && (
                                    <span>Color: {item.selectedColor}</span>
                                  )}
                                </div>
                                {item.product.discountPrice && (
                                  <div className="d-flex align-items-center mt-1">
                                    <span className="text-primary fw-bold me-2">
                                      ${item.product.discountPrice.toFixed(2)}
                                    </span>
                                    <span className="text-muted text-decoration-line-through small">
                                      ${item.product.price.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <i className="fas fa-minus"></i>
                              </Button>
                              <Form.Control
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                                className="text-center mx-2"
                                style={{ width: '60px' }}
                                min="1"
                                max="99"
                              />
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              >
                                <i className="fas fa-plus"></i>
                              </Button>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="fw-bold">${itemPrice.toFixed(2)}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="fw-bold text-primary">${itemTotal.toFixed(2)}</span>
                          </td>
                          <td className="py-4 text-center pe-4">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeFromCart(item.productId)}
                              title="Remove item"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="d-block d-md-none p-3">
                {items.map((item) => {
                  const itemPrice = item.product.discountPrice || item.product.price;
                  const itemTotal = itemPrice * item.quantity;
                  
                  return (
                    <Card key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`} className="mb-3 border">
                      <Card.Body className="p-3">
                        <div className="d-flex">
                          <img
                            src={getProductImageSrc(item.product)}
                            alt={item.product.name}
                            className="rounded me-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            loading="lazy"
                          />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2">
                              <Link 
                                to={`/product/${item.productId}`} 
                                className="text-decoration-none text-dark"
                              >
                                {item.product.name}
                              </Link>
                            </h6>
                            {(item.selectedSize || item.selectedColor) && (
                              <div className="text-muted small mb-2">
                                {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                              </div>
                            )}
                            {item.product.discountPrice && (
                              <div className="d-flex align-items-center mb-2">
                                <span className="text-primary fw-bold me-2">
                                  ${item.product.discountPrice.toFixed(2)}
                                </span>
                                <span className="text-muted text-decoration-line-through small">
                                  ${item.product.price.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <div className="d-flex align-items-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  style={{ minWidth: '40px', minHeight: '40px', padding: '8px' }}
                                  aria-label="Decrease quantity"
                                >
                                  <i className="fas fa-minus"></i>
                                </Button>
                                <Form.Control
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                                  className="text-center mx-2"
                                  style={{ width: '50px', fontSize: '16px' }}
                                  min="1"
                                  max="99"
                                  aria-label="Product quantity"
                                />
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  style={{ minWidth: '40px', minHeight: '40px', padding: '8px' }}
                                  aria-label="Increase quantity"
                                >
                                  <i className="fas fa-plus"></i>
                                </Button>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeFromCart(item.productId)}
                                title="Remove item"
                                style={{ minWidth: '44px', minHeight: '44px', padding: '10px' }}
                                aria-label="Remove from cart"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                            <div className="mt-2 text-end">
                              <span className="fw-bold text-primary fs-5">${itemTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
            <Link to="/" className="btn btn-outline-primary" style={{ minHeight: '48px' }}>
              <i className="fas fa-arrow-left me-2"></i>
              Continue Shopping
            </Link>
            <Button variant="outline-danger" onClick={clearCart} style={{ minHeight: '48px' }}>
              <i className="fas fa-trash me-2"></i>
              Clear Cart
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0 fw-bold">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({totalItems} items)</span>
                <span className="fw-bold">${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'text-success fw-bold' : 'fw-bold'}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              
              {totalPrice < 50 && (
                <div className="alert alert-info small py-2 mb-3">
                  <i className="fas fa-info-circle me-1"></i>
                  Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax</span>
                <span className="fw-bold">${taxAmount.toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 text-primary">${finalTotal.toFixed(2)}</span>
              </div>
              
              <div className="d-grid gap-2">
                {currentUser ? (
                  <Link to="/checkout" className="btn btn-primary btn-lg">
                    <i className="fas fa-credit-card me-2"></i>
                    Proceed to Checkout
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Sign In to Checkout
                  </Link>
                )}
                
                <Button variant="outline-secondary" size="lg">
                  <i className="fab fa-paypal me-2"></i>
                  PayPal Express
                </Button>
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="fas fa-lock me-1"></i>
                  Secure checkout guaranteed
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Recommended Products */}
          <Card className="shadow-sm border-0 mt-4">
            <Card.Header>
              <h6 className="mb-0 fw-bold">You might also like</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <img
                  src="/api/placeholder/60/60"
                  alt="Recommended Product"
                  className="rounded me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 small">Wireless Earbuds Pro</h6>
                  <div className="d-flex align-items-center">
                    <span className="text-primary fw-bold me-2">$79.99</span>
                    <span className="text-muted text-decoration-line-through small">$99.99</span>
                  </div>
                </div>
                <Button size="sm" variant="outline-primary">
                  Add
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;