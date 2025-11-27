import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Table, Form, Alert, Card } from 'react-bootstrap';
import type { Order, OrderStatus } from '../../types/index';
import { useOrders } from '../../hooks/useOrders';

interface OrderDetailsModalProps {
  order: Order | null;
  show: boolean;
  onHide: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, show, onHide }) => {
  const { updateOrderStatus, updateShippingInfo, addAdminNote } = useOrders();
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'history' | 'notes'>('details');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Shipping info form state
  const [shippingForm, setShippingForm] = useState({
    courier: '',
    trackingNumber: '',
    estimatedDelivery: '',
    trackingUrl: ''
  });
  
  // Admin notes form state
  const [adminNote, setAdminNote] = useState('');

  React.useEffect(() => {
    if (order?.shippingInfo) {
      setShippingForm({
        courier: order.shippingInfo.courier || '',
        trackingNumber: order.shippingInfo.trackingNumber || '',
        estimatedDelivery: order.shippingInfo.estimatedDelivery 
          ? order.shippingInfo.estimatedDelivery.toISOString().split('T')[0] 
          : '',
        trackingUrl: order.shippingInfo.trackingUrl || ''
      });
    }
    setAdminNote(order?.adminNotes || '');
  }, [order]);

  if (!order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: 'fa-clock', text: 'Pending' },
      confirmed: { variant: 'info', icon: 'fa-check-circle', text: 'Confirmed' },
      processing: { variant: 'primary', icon: 'fa-cogs', text: 'Processing' },
      packed: { variant: 'secondary', icon: 'fa-box', text: 'Packed' },
      shipped: { variant: 'info', icon: 'fa-truck', text: 'Shipped' },
      out_for_delivery: { variant: 'warning', icon: 'fa-truck-loading', text: 'Out for Delivery' },
      delivered: { variant: 'success', icon: 'fa-check-double', text: 'Delivered' },
      cancelled: { variant: 'danger', icon: 'fa-times-circle', text: 'Cancelled' },
      returned: { variant: 'dark', icon: 'fa-undo', text: 'Returned' },
      refunded: { variant: 'secondary', icon: 'fa-money-bill-wave', text: 'Refunded' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <i className={`fas ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShippingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateShippingInfo(order.id, {
        courier: shippingForm.courier,
        trackingNumber: shippingForm.trackingNumber,
        trackingUrl: shippingForm.trackingUrl,
        estimatedDelivery: shippingForm.estimatedDelivery 
          ? new Date(shippingForm.estimatedDelivery) 
          : undefined
      });
    } catch (error) {
      console.error('Error updating shipping:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await addAdminNote(order.id, adminNote);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" style={{ marginTop: '60px' }}>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-3">
          <span>Order {order.orderNumber}</span>
          {getStatusBadge(order.status)}
          {order.priority && typeof order.priority === 'string' && order.priority.length > 0 && (
            <Badge bg="light" text="dark">
              <i className={`fas ${
                order.priority === 'urgent' ? 'fa-exclamation-triangle' :
                order.priority === 'high' ? 'fa-arrow-up' :
                order.priority === 'low' ? 'fa-arrow-down' : 'fa-minus'
              } me-1`}></i>
              {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <i className="fas fa-info-circle me-2"></i>
              Order Details
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              <i className="fas fa-truck me-2"></i>
              Shipping Info
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <i className="fas fa-history me-2"></i>
              Status History
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <i className="fas fa-sticky-note me-2"></i>
              Admin Notes
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div>
            {/* Customer Information */}
            <Row className="mb-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-user text-primary me-2"></i>
                      Customer Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Name:</strong> {order.customer.displayName}</p>
                    <p><strong>Email:</strong> {order.customer.email}</p>
                    {order.customer.phone && <p><strong>Phone:</strong> {order.customer.phone}</p>}
                    <p><strong>Customer ID:</strong> <code>{order.customer.id}</code></p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-shopping-cart text-success me-2"></i>
                      Order Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>Order Date:</strong> {order.createdAt ? (new Date(order.createdAt).toLocaleString()) : 'N/A'}</p>
                    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> 
                      <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'} className="ms-2">
                        {order.paymentStatus}
                      </Badge>
                    </p>
                    <p><strong>Source:</strong> 
                      <Badge bg="info" className="ms-2">{order.source}</Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Addresses */}
            <Row className="mb-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-truck text-info me-2"></i>
                      Shipping Address
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <address className="mb-0">
                      {order.shippingAddress?.firstName && order.shippingAddress?.lastName && (
                        <><strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong><br /></>
                      )}
                      {order.shippingAddress?.street ?? ''}<br />
                      {order.shippingAddress?.city ?? ''}, {order.shippingAddress?.state ?? ''} {order.shippingAddress?.zipCode ?? ''}<br />
                      {order.shippingAddress?.country ?? ''}<br />
                      {order.shippingAddress?.phone && (
                        <><strong>Phone:</strong> {order.shippingAddress.phone}</>
                      )}
                    </address>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">
                      <i className="fas fa-file-invoice text-warning me-2"></i>
                      Billing Address
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <address className="mb-0">
                      {order.billingAddress?.firstName && order.billingAddress?.lastName && (
                        <><strong>{order.billingAddress.firstName} {order.billingAddress.lastName}</strong><br /></>
                      )}
                      {order.billingAddress?.street ?? ''}<br />
                      {order.billingAddress?.city ?? ''}, {order.billingAddress?.state ?? ''} {order.billingAddress?.zipCode ?? ''}<br />
                      {order.billingAddress?.country ?? ''}<br />
                      {order.billingAddress?.phone && (
                        <><strong>Phone:</strong> {order.billingAddress.phone}</>
                      )}
                    </address>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Order Items */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-list text-primary me-2"></i>
                  Order Items ({order.items ? order.items.length : 0})
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items ?? []).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <strong>{item.name ?? 'N/A'}</strong>
                              {item.selectedSize && <><br /><small className="text-muted">Size: {item.selectedSize}</small></>}
                              {item.selectedColor && <><br /><small className="text-muted">Color: {item.selectedColor}</small></>}
                            </div>
                          </div>
                        </td>
                        <td>${item.price !== undefined ? Number(item.price).toFixed(2) : '0.00'}</td>
                        <td>{item.quantity ?? 0}</td>
                        <td><strong>${item.price !== undefined && item.quantity !== undefined ? (Number(item.price) * Number(item.quantity)).toFixed(2) : '0.00'}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Order Summary */}
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-calculator text-success me-2"></i>
                  Order Summary
                </h6>
              </Card.Header>
              <Card.Body>
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td>Subtotal:</td>
                      <td className="text-end">${order.subtotal !== undefined ? Number(order.subtotal).toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td>Shipping:</td>
                      <td className="text-end">${order.shippingCost !== undefined ? Number(order.shippingCost).toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td>Tax:</td>
                      <td className="text-end">${order.taxAmount !== undefined ? Number(order.taxAmount).toFixed(2) : '0.00'}</td>
                    </tr>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <tr>
                        <td>Discount:</td>
                        <td className="text-end text-success">-${Number(order.discountAmount).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="border-top">
                      <td><strong>Total:</strong></td>
                      <td className="text-end"><strong>${order.totalAmount !== undefined ? Number(order.totalAmount).toFixed(2) : '0.00'}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div>
            <Form onSubmit={handleShippingUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Courier/Carrier</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingForm.courier}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, courier: e.target.value }))}
                      placeholder="e.g., FedEx, UPS, DHL"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tracking Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingForm.trackingNumber}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder="Enter tracking number"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estimated Delivery Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={shippingForm.estimatedDelivery}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tracking URL</Form.Label>
                    <Form.Control
                      type="url"
                      value={shippingForm.trackingUrl}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
                      placeholder="https://tracking.courier.com/..."
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={isUpdating}>
                  {isUpdating ? <><i className="fas fa-spinner fa-spin me-2"></i> Updating...</> : <><i className="fas fa-save me-2"></i> Update Shipping Info</>}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div className="timeline">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item border-start border-3 ps-4 pb-4">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">
                          {getStatusBadge(history.status)}
                        </h6>
                        <p className="text-muted mb-1">
                          <small>
                            <i className="fas fa-calendar me-1"></i>
                            {history.timestamp ? (new Date(history.timestamp).toLocaleString()) : 'N/A'}
                          </small>
                        </p>
                        <p className="text-muted mb-0">
                          <small>
                            <i className="fas fa-user me-1"></i>
                            Updated by: {history.updatedBy ?? 'N/A'}
                          </small>
                        </p>
                        {history.note && (
                          <p className="mt-2 mb-0">
                            <i className="fas fa-sticky-note me-1"></i>
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="info">
                <i className="fas fa-info-circle me-2"></i>
                No status history available for this order.
              </Alert>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <Form onSubmit={handleNotesUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Admin Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add internal notes about this order..."
                />
                <Form.Text className="text-muted">
                  These notes are only visible to admin users and won't be shared with the customer.
                </Form.Text>
              </Form.Group>
              
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? <><i className="fas fa-spinner fa-spin me-2"></i> Saving...</> : <><i className="fas fa-save me-2"></i> Save Notes</>}
              </Button>
            </Form>
            
            {order.customerNotes && (
              <Card className="mt-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <i className="fas fa-comment text-info me-2"></i>
                    Customer Notes
                  </h6>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0">{order.customerNotes}</p>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="dropdown">
            <Button variant="outline-primary" className="dropdown-toggle" data-bs-toggle="dropdown">
              <i className="fas fa-edit me-2"></i>
              Change Status
            </Button>
            <ul className="dropdown-menu">
              <li><Button className="dropdown-item" onClick={() => handleStatusChange('confirmed')}>Confirm Order</Button></li>
              <li><Button className="dropdown-item" onClick={() => handleStatusChange('processing')}>Start Processing</Button></li>
              <li><Button className="dropdown-item" onClick={() => handleStatusChange('packed')}>Mark as Packed</Button></li>
              <li><Button className="dropdown-item" onClick={() => handleStatusChange('shipped')}>Mark as Shipped</Button></li>
              <li><Button className="dropdown-item" onClick={() => handleStatusChange('delivered')}>Mark as Delivered</Button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Button className="dropdown-item text-danger" onClick={() => handleStatusChange('cancelled')}>Cancel Order</Button></li>
            </ul>
          </div>
          
          <div>
            <Button variant="outline-secondary" className="me-2">
              <i className="fas fa-print me-2"></i>
              Print
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;