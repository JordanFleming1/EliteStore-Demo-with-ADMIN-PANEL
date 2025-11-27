import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { useOrders } from '../../hooks/useOrders';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import type { OrderStatus, Order, OrderItem } from '../../types/index';

// Component for individual order card
const OrderCard: React.FC<{ order: Order; onViewDetails: (order: Order) => void; onUpdateStatus: (order: Order) => void }> = ({ 
  order, 
  onViewDetails, 
  onUpdateStatus 
}) => {
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
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <i className={`fas ${config.icon}`}></i>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="mb-3 shadow-sm h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
        <div>
          <strong className="text-primary">{order.orderNumber}</strong>
        </div>
        <div className="d-flex align-items-center gap-2">
          {getStatusBadge(order.status)}
        </div>
      </Card.Header>
      
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <h6 className="mb-2">
              <i className="fas fa-user text-muted me-2"></i>
              Customer
            </h6>
            <p className="mb-1"><strong>{order.customer.displayName}</strong></p>
            <p className="text-muted small mb-2">{order.customer.email}</p>
            
            <h6 className="mb-2 mt-3">
              <i className="fas fa-calendar text-muted me-2"></i>
              Order Date
            </h6>
            <p className="text-muted small">
              {order.createdAt ? (new Date(order.createdAt).toLocaleDateString() + ' at ' + new Date(order.createdAt).toLocaleTimeString()) : 'N/A'}
            </p>
          </div>
          
          <div className="col-md-6">
            <h6 className="mb-2">
              <i className="fas fa-shopping-cart text-muted me-2"></i>
              Items ({order.items ? order.items.length : 0})
            </h6>
            <div className="mb-2" style={{ maxHeight: '80px', overflowY: 'auto' }}>
              {(order.items ?? []).slice(0, 3).map((item: OrderItem, index: number) => (
                <div key={index} className="text-muted small">
                  {item.quantity}x {item.name}
                </div>
              ))}
              {order.items && order.items.length > 3 && (
                <div className="text-muted small">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
            
            <h6 className="mb-2">
              <i className="fas fa-dollar-sign text-muted me-2"></i>
              Total
            </h6>
            <h5 className="text-success mb-0">${(order.totalAmount ?? 0).toFixed(2)}</h5>
          </div>
        </div>
        
        {order.shippingInfo?.trackingNumber && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-truck text-muted"></i>
              <span className="small">
                <strong>Tracking:</strong> {order.shippingInfo.trackingNumber}
                {order.shippingInfo.courier && ` (${order.shippingInfo.courier})`}
              </span>
            </div>
          </div>
        )}
      </Card.Body>
      
      <Card.Footer className="d-flex justify-content-between align-items-center">
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => onViewDetails(order)}
        >
          <i className="fas fa-eye me-1"></i>
          View Details
        </Button>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={() => onUpdateStatus(order)}
        >
          <i className="fas fa-edit me-1"></i>
          Update Status
        </Button>
      </Card.Footer>
    </Card>
  );
};

const AdminOrders: React.FC = () => {
    // Manual Order Modal State
    const [showManualOrderModal, setShowManualOrderModal] = useState(false);
      const [manualOrder, setManualOrder] = useState<{
        customerName: string;
        customerEmail: string;
        items: { name: string; quantity: number }[];
        totalAmount: number;
        status: string;
      }>({
        customerName: '',
        customerEmail: '',
        items: [],
        totalAmount: 0,
        status: 'pending',
      });
    const [manualOrderLoading, setManualOrderLoading] = useState(false);
    const [manualOrderError, setManualOrderError] = useState('');

    // Add manual order to Firestore
    const handleManualOrderSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setManualOrderLoading(true);
      setManualOrderError('');
      try {
        // Firestore imports
        const { db } = await import('../../firebase/firebase.config');
        const { collection, addDoc } = await import('firebase/firestore');
        // Create order object
        const orderData = {
          customer: {
            email: manualOrder.customerEmail,
            displayName: manualOrder.customerName,
          },
          items: manualOrder.items,
          totalAmount: manualOrder.totalAmount,
          status: manualOrder.status,
          createdAt: new Date().toISOString(),
          orderNumber: 'MANUAL-' + Math.floor(Math.random() * 1000000),
        };
        await addDoc(collection(db, 'orders'), orderData);
        setShowManualOrderModal(false);
        setManualOrder({ customerEmail: '', customerName: '', items: [], totalAmount: 0, status: 'pending' });
        // Refresh orders after adding
        if (typeof window !== 'undefined' && window.location) {
          // If using context, call refreshData if available
          if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('orders-refresh'));
          }
        }
      } catch {
        setManualOrderError('Failed to create manual order');
      } finally {
        setManualOrderLoading(false);
      }
    };
  const { orders, loading, error, updateOrderStatus, getOrderStats } = useOrders();
  
  // Filter and search states
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
  
  // Stats state with default values
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    todayOrders: 0,
    revenue: 0,
    averageOrderValue: 0,
  });

  // Load stats asynchronously
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const orderStats = await getOrderStats();
        setStats(orderStats);
      } catch (error) {
        console.error('Failed to load order stats:', error);
        // Keep default stats on error
      }
    };

    if (orders.length > 0) {
      loadStats();
    }
  }, [orders, getOrderStats]);
  
  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(search) ||
        order.customer.displayName.toLowerCase().includes(search) ||
        order.customer.email.toLowerCase().includes(search)
      );
    }
    
    // Sort orders
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [orders, selectedStatus, searchTerm, sortBy, sortOrder]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      setShowUpdateModal(false);
      setOrderToUpdate(null);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleOpenUpdateModal = (order: Order) => {
    setOrderToUpdate(order);
    setShowUpdateModal(true);
  };

  return (
    <>
      {error && (
        <Container className="py-4">
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </Container>
      )}
      <Alert variant="info" className="mb-4" style={{ maxWidth: 700, margin: '0 auto' }}>
        <i className="fas fa-info-circle me-2"></i>
        <strong>Note:</strong> After creating a manual order, please refresh the page to see it appear in the list.
      </Alert>
      <Container fluid className="py-4">
        <Row>
          <Col>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 mb-0">
                <i className="fas fa-shopping-bag text-primary me-2"></i>
                Orders Management
              </h1>
              <p className="text-muted mb-0">Manage and track all customer orders</p>
            </div>
            <Button variant="primary" onClick={() => setShowManualOrderModal(true)}>
              <i className="fas fa-plus me-2"></i>
              Manual Order
            </Button>
            <Modal show={showManualOrderModal} onHide={() => setShowManualOrderModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Create Manual Order</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleManualOrderSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', paddingBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: '5rem' }}>
                    {manualOrderError && <Alert variant="danger">{manualOrderError}</Alert>}
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={manualOrder.customerName}
                        onChange={e => setManualOrder({ ...manualOrder, customerName: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={manualOrder.customerEmail}
                        onChange={e => setManualOrder({ ...manualOrder, customerEmail: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Order Items (comma separated)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="item1, item2, item3"
                        onChange={e => setManualOrder({ ...manualOrder, items: e.target.value.split(',').map(i => ({ name: i.trim(), quantity: 1 })) })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Total Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={manualOrder.totalAmount}
                        onChange={e => setManualOrder({ ...manualOrder, totalAmount: Number(e.target.value) })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={manualOrder.status}
                        onChange={e => setManualOrder({ ...manualOrder, status: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                        <option value="refunded">Refunded</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowManualOrderModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={manualOrderLoading}>
                    {manualOrderLoading ? 'Creating...' : 'Create Order'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-primary text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-shopping-cart fa-2x mb-2"></i>
                  <h3 className="mb-1">{stats.total || 0}</h3>
                  <small>Total Orders</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-warning text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-clock fa-2x mb-2"></i>
                  <h3 className="mb-1">{stats.pending || 0}</h3>
                  <small>Pending</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-info text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-cogs fa-2x mb-2"></i>
                  <h3 className="mb-1">{stats.processing || 0}</h3>
                  <small>Processing</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-secondary text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-truck fa-2x mb-2"></i>
                  <h3 className="mb-1">{stats.shipped || 0}</h3>
                  <small>Shipped</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-success text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-check-double fa-2x mb-2"></i>
                  <h3 className="mb-1">{stats.delivered || 0}</h3>
                  <small>Delivered</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={2} lg={3} md={4} sm={6} className="mb-3">
              <Card className="bg-dark text-white h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-dollar-sign fa-2x mb-2"></i>
                  <h3 className="mb-1">${(stats.revenue || 0).toFixed(0)}</h3>
                  <small>Revenue</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters and Search */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-end">
                <Col lg={4} md={6} className="mb-3">
                  <Form.Label>Search Orders</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Order number, customer name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                
                <Col lg={2} md={6} className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                    <option value="refunded">Refunded</option>
                  </Form.Select>
                </Col>
                
                <Col lg={2} md={6} className="mb-3">
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                  >
                    <option value="date">Order Date</option>
                    <option value="amount">Order Amount</option>
                    <option value="status">Status</option>
                  </Form.Select>
                </Col>
                
                <Col lg={2} md={6} className="mb-3">
                  <Form.Label>Order</Form.Label>
                  <Form.Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </Form.Select>
                </Col>
                
                <Col lg={2} md={6} className="mb-3">
                  <Button 
                    variant="outline-secondary" 
                    className="w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                  >
                    <i className="fas fa-undo me-2"></i>
                    Reset
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Alert variant="info" className="text-center">
              <i className="fas fa-info-circle fa-2x mb-3"></i>
              <h5>No Orders Found</h5>
              <p className="mb-0">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'No orders match your current filters. Try adjusting your search criteria.'
                  : 'No orders have been placed yet. New orders will appear here.'
                }
              </p>
            </Alert>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  Orders ({filteredOrders.length})
                </h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm">
                    <i className="fas fa-download me-2"></i>
                    Export
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <i className="fas fa-print me-2"></i>
                    Print
                  </Button>
                </div>
              </div>
              
              <Row>
                {filteredOrders.map((order) => (
                  <Col lg={6} xl={4} className="mb-3" key={order.id}>
                    <OrderCard 
                      order={order} 
                      onViewDetails={setSelectedOrder}
                      onUpdateStatus={handleOpenUpdateModal}
                    />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>

      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder}
        show={selectedOrder !== null}
        onHide={() => setSelectedOrder(null)}
      />

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit text-primary me-2"></i>
            Update Order Status
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToUpdate && (
            <div>
              <div className="mb-3">
                <strong>Order:</strong> <span className="text-primary">{orderToUpdate.orderNumber}</span>
              </div>
              <div className="mb-3">
                <strong>Customer:</strong> {orderToUpdate.customer.displayName}
              </div>
              <div className="mb-3">
                <strong>Current Status:</strong>{' '}
                <Badge bg={
                  orderToUpdate.status === 'delivered' ? 'success' :
                  orderToUpdate.status === 'cancelled' ? 'danger' :
                  orderToUpdate.status === 'shipped' ? 'info' :
                  orderToUpdate.status === 'processing' ? 'primary' :
                  'warning'
                }>
                  {orderToUpdate.status}
                </Badge>
              </div>
              
              <hr />
              
              <h6 className="mb-3">Select New Status:</h6>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-info" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'confirmed')}
                  className="text-start"
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Confirm Order
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'processing')}
                  className="text-start"
                >
                  <i className="fas fa-cogs me-2"></i>
                  Start Processing
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'packed')}
                  className="text-start"
                >
                  <i className="fas fa-box me-2"></i>
                  Mark as Packed
                </Button>
                <Button 
                  variant="outline-info" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'shipped')}
                  className="text-start"
                >
                  <i className="fas fa-truck me-2"></i>
                  Mark as Shipped
                </Button>
                <Button 
                  variant="outline-success" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'delivered')}
                  className="text-start"
                >
                  <i className="fas fa-check-double me-2"></i>
                  Mark as Delivered
                </Button>
                <hr />
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleStatusUpdate(orderToUpdate.id, 'cancelled')}
                  className="text-start"
                >
                  <i className="fas fa-times-circle me-2"></i>
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
    </>
  );
};

export default AdminOrders;