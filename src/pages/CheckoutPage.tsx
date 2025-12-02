import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Alert,
  Spinner,
  Modal,
  ProgressBar
} from 'react-bootstrap';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import api from '../api/simple-api';
import { RealOrdersContext } from '../contexts/RealOrdersContext';
import type { CartItem, Product } from '../types/index';

// US States list
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  method: 'credit_card' | 'bank_transfer';
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}


const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clearCart } = useCart();
  const { currentUser: user } = useAuth();
  const { showToast } = useToast();

    // Get refreshData from RealOrdersContext
    const ordersContext = useContext(RealOrdersContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'credit_card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: shippingAddress.firstName + ' ' + shippingAddress.lastName
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);

  // Support direct buy (bypass cart)
  const directBuy = location.state && location.state.directBuy;
  const directProduct = location.state && location.state.product;
  const directQuantity = location.state && location.state.quantity;
  const directSize = location.state && location.state.selectedSize;
  const directColor = location.state && location.state.selectedColor;

  // If directBuy, create a pseudo-cart for this checkout only
  const effectiveCartItems: CartItem[] = React.useMemo(() => {
    if (directBuy && directProduct) {
      return [{
        productId: (directProduct as Product).id,
        product: directProduct as Product,
        quantity: directQuantity || 1,
        selectedSize: directSize,
        selectedColor: directColor
      }];
    }
    return cartItems;
  }, [directBuy, directProduct, directQuantity, directSize, directColor, cartItems]);

  // Redirect if no items to checkout
  useEffect(() => {
    // Only redirect if neither cart nor directBuy has items
    const isDirectBuy = !!(location.state && location.state.directBuy && location.state.product);
    if (!effectiveCartItems || effectiveCartItems.length === 0) {
      if (!isDirectBuy) {
        navigate('/cart');
      }
    }
  }, [effectiveCartItems, navigate, location.state]);

  // Calculate costs
  // Calculate totals for direct buy or cart
  const subtotal = effectiveCartItems.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // Type guard for user with uid
      const customerId = (user && typeof (user as unknown as { uid?: unknown }).uid === 'string')
        ? (user as unknown as { uid: string }).uid
        : `CUST-${Date.now()}`;
      const orderId = `ORD-${Date.now()}`;
      // Create order object for API
      const orderData = {
        id: orderId,
        orderNumber: `${orderId}-${new Date().getFullYear()}`,
        customer: {
          id: customerId,
          displayName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          phone: shippingAddress.phone
        },
        items: effectiveCartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '',
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        subtotal,
        tax,
        shipping,
        totalAmount: total,
        status: 'pending' as const,
        paymentMethod: paymentInfo.method,
        shippingAddress: {
          id: `addr-${Date.now()}-shipping`,
          type: 'shipping' as const,
          firstName: shippingAddress.street.split(' ')[0] || 'Customer',
          lastName: shippingAddress.street.split(' ').slice(1).join(' ') || '',
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: '',
          isDefault: true
        },
        billingAddress: {
          id: `addr-${Date.now()}-billing`,
          type: 'billing' as const,
          firstName: shippingAddress.street.split(' ')[0] || 'Customer',
          lastName: shippingAddress.street.split(' ').slice(1).join(' ') || '',
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: '',
          isDefault: true
        },
        shippingInfo: {
          courier: '',
          trackingNumber: ''
        },
        statusHistory: [
          {
            status: 'pending' as const,
            timestamp: new Date(),
            note: 'Order placed',
            updatedBy: 'system'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        adminNotes: subscribeNewsletter ? 'Customer subscribed to newsletter' : ''
      };
      // Save order to API
      try {
        await api.createOrder();
        if (ordersContext?.refreshData) {
          await ordersContext.refreshData();
        }
      } catch {
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      }
      setOrderPlaced(true);
      // Only clear cart if not direct buy
      if (!directBuy) clearCart();
      showToast('success', 'Order Placed!', 'Your order has been successfully placed.');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch {
      showToast('error', 'Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
      setShowConfirmationModal(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
      return required.every(field => shippingAddress[field as keyof ShippingAddress].trim() !== '');
    }
    if (step === 2) {
      if (paymentInfo.method === 'credit_card') {
        return paymentInfo.cardNumber.length >= 16 && 
               paymentInfo.expiryMonth !== '' && 
               paymentInfo.expiryYear !== '' && 
               paymentInfo.cvv.length >= 3 &&
               paymentInfo.cardholderName.trim() !== '';
      }
      return true;
    }
    if (step === 3) {
      return agreedToTerms;
    }
    return false;
  };

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-4">
      <div className="d-flex align-items-center">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                step <= currentStep ? 'bg-primary text-white' : 'bg-light text-muted'
              }`}
              style={{ width: '40px', height: '40px' }}
            >
              {step < currentStep ? (
                <i className="fas fa-check"></i>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div 
                className={`mx-3 ${step < currentStep ? 'bg-primary' : 'bg-light'}`}
                style={{ width: '60px', height: '2px' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderShippingForm = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-shipping-fast me-2"></i>
          Shipping Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleShippingSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number *</Form.Label>
                <Form.Control
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Street Address *</Form.Label>
            <Form.Control
              type="text"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
              placeholder="123 Main Street, Apt 4B"
              required
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Select
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  required
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>ZIP Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                  placeholder="12345"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => navigate('/cart')}>
              <i className="fas fa-arrow-left me-2"></i>
              Back to Cart
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!validateStep(1)}
            >
              Continue to Payment
              <i className="fas fa-arrow-right ms-2"></i>
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderPaymentForm = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-credit-card me-2"></i>
          Payment Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handlePaymentSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Payment Method</Form.Label>
            <div className="d-flex gap-3">
              {[
                { value: 'credit_card', icon: 'fas fa-credit-card', label: 'Credit Card' },
                { value: 'bank_transfer', icon: 'fas fa-university', label: 'Bank Transfer' }
              ].map(method => (
                <Form.Check
                  key={method.value}
                  type="radio"
                  id={method.value}
                  name="paymentMethod"
                  label={
                    <span>
                      <i className={`${method.icon} me-2`}></i>
                      {method.label}
                    </span>
                  }
                  checked={paymentInfo.method === method.value}
                  onChange={() => setPaymentInfo({...paymentInfo, method: method.value as 'credit_card' | 'bank_transfer'})}
                />
              ))}
            </div>
          </Form.Group>
        </Form>
        {paymentInfo.method === 'bank_transfer' && (
          <Alert variant="info">
            <i className="fas fa-university me-2"></i>
            Bank transfer instructions will be provided after order confirmation.
          </Alert>
        )}
        <div className="d-flex justify-content-between mt-3">
          <Button variant="outline-secondary" onClick={() => setCurrentStep(1)}>
            <i className="fas fa-arrow-left me-2"></i>
            Back to Shipping
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderOrderReview = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-warning text-dark">
        <h5 className="mb-0">
          <i className="fas fa-clipboard-check me-2"></i>
          Order Review
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Shipping Address Review */}
        <div className="mb-4">
          <h6>Shipping Address</h6>
          <div className="bg-light p-3 rounded">
            <strong>{shippingAddress.firstName} {shippingAddress.lastName}</strong><br/>
            {shippingAddress.street}<br/>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br/>
            {shippingAddress.country}<br/>
            <small className="text-muted">
              Email: {shippingAddress.email} | Phone: {shippingAddress.phone}
            </small>
          </div>
        </div>

        {/* Payment Method Review */}
        <div className="mb-4">
          <h6>Payment Method</h6>
          <div className="bg-light p-3 rounded">
            {paymentInfo.method === 'credit_card' && (
              <>
                <i className="fas fa-credit-card me-2"></i>
                Credit Card ending in {paymentInfo.cardNumber.slice(-4)}
                <br/>
                <small className="text-muted">
                  Expires: {paymentInfo.expiryMonth}/{paymentInfo.expiryYear}
                </small>
              </>
            )}
            {paymentInfo.method === 'bank_transfer' && (
              <>
                <i className="fas fa-university me-2"></i>
                Bank Transfer
              </>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="terms"
            label={
              <span>
                I agree to the{' '}
                <a href="#" className="text-primary">Terms and Conditions</a>{' '}
                and{' '}
                <a href="#" className="text-primary">Privacy Policy</a> *
              </span>
            }
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="newsletter"
            label="Subscribe to our newsletter for exclusive offers and updates"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setCurrentStep(2)}>
            <i className="fas fa-arrow-left me-2"></i>
            Back to Payment
          </Button>
          <Button 
            variant="success"
            size="lg"
            disabled={
              !validateStep(3) ||
              false
            }
            onClick={() => setShowConfirmationModal(true)}
          >
            <i className="fas fa-lock me-2"></i>
            Place Order (${total.toFixed(2)})
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
      <Card.Header>
        <h5 className="mb-0">Order Summary</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {effectiveCartItems.map((item: CartItem, index: number) => (
            <ListGroup.Item key={index} className="px-0">
              <div className="d-flex align-items-center">
                <img
                  src={item.product?.images?.[0] || '/api/placeholder/60/60'}
                  alt={item.product?.name || 'Product'}
                  className="rounded me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <div className="fw-bold">{item.product?.name || 'Product'}</div>
                  <small className="text-muted">
                    Qty: {item.quantity || 1} × ${item.product?.price?.toFixed(2) || '0.00'}
                  </small>
                </div>
                <div className="fw-bold">
                  ${((item.quantity || 1) * (item.product?.price || 0)).toFixed(2)}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <hr />
        
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="d-flex justify-content-between mb-2">
          <span>Shipping:</span>
          <span>
            {shipping === 0 ? (
              <Badge bg="success">FREE</Badge>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        
        <div className="d-flex justify-content-between mb-2">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        <hr />
        
        <div className="d-flex justify-content-between fw-bold fs-5">
          <span>Total:</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>

        {shipping === 0 && (
          <Alert variant="success" className="mt-3 py-2">
            <i className="fas fa-truck me-2"></i>
            <small>Free shipping included!</small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  // Only show 'Your cart is empty' if both cart and directBuy are empty
  const isDirectBuy = !!(location.state && location.state.directBuy && location.state.product);
  if (cartItems.length === 0 && !isDirectBuy) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Your cart is empty</Alert.Heading>
          <p>Please add some items to your cart before proceeding to checkout.</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Alert>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-3">Order Placed Successfully!</h2>
          <p className="text-muted mb-4">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <ProgressBar animated now={100} variant="success" className="mb-3" />
          <p className="text-muted">Redirecting to homepage...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="text-center mb-1" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>Checkout</h1>
        <p className="text-center text-muted" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>Complete your purchase in just a few steps</p>
      </div>

      {renderStepIndicator()}

      <Row>
        <Col lg={8} className="mb-4 mb-lg-0">
          {currentStep === 1 && renderShippingForm()}
          {currentStep === 2 && renderPaymentForm()}
          {currentStep === 3 && renderOrderReview()}
        </Col>
        
        <Col lg={4}>
          {renderOrderSummary()}
        </Col>
      </Row>

      {/* Order Confirmation Modal */}
      <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered className="mobile-optimized-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-shopping-cart text-primary mb-3" style={{ fontSize: '3rem' }}></i>
            <h5>You're about to place an order for:</h5>
            <div className="fs-3 fw-bold text-primary my-3">
              ${total.toFixed(2)}
            </div>
            <p className="text-muted">
              {effectiveCartItems.length} item(s) will be shipped to:<br/>
              <strong>{shippingAddress.firstName} {shippingAddress.lastName}</strong><br/>
              {shippingAddress.city}, {shippingAddress.state}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column flex-sm-row gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmationModal(false)}
            style={{ minHeight: '48px', flex: '1' }}
            className="w-100 w-sm-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            style={{ minHeight: '48px', flex: '1' }}
            className="w-100 w-sm-auto" 
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Confirm Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CheckoutPage;