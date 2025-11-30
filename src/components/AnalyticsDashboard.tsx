// Analytics Dashboard Component
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { useOrders } from '../hooks/useOrders';
import { RevenueTrendChart } from './charts/RevenueTrendChart';
import { OrderStatusChart } from './charts/OrderStatusChart';
import { format } from 'date-fns';
import api from '../api/simple-api';
import type { Product } from '../types/index';

interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { orders, loading, error, connected, getOrderStats } = useOrders();
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
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load statistics and additional data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderStats, productsData, customersData] = await Promise.all([
          getOrderStats(),
          api.getProducts(),
          api.getCustomers()
        ]);
        setStats(orderStats);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      }
    };

    if (orders.length > 0 || connected) {
      loadData();
    }
  }, [orders, getOrderStats, connected]);

  if (loading) {
    return (
      <Container className={className}>
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={className}>
        <Alert variant="danger">
          <Alert.Heading>Analytics Error</Alert.Heading>
          <p>{error}</p>
          {error.includes('API server') && (
            <p className="mb-0">
              <strong>Solution:</strong> Run <code>npm run api</code> in a separate terminal to start the JSON Server.
            </p>
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className={className}>
      {/* Connection Status */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="mb-0">📊 Analytics Dashboard</h2>
            <Badge bg={connected ? 'success' : 'danger'}>
              {connected ? '🟢 API Connected' : '🔴 API Offline'}
            </Badge>
          </div>
          <small className="text-muted">
            Real-time data from JSON Server • Last updated: {format(new Date(), 'PPp')}
          </small>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-primary">
            <Card.Body className="text-center">
              <div className="fs-1 text-primary mb-2">💰</div>
              <h3 className="text-primary mb-1">${stats.revenue.toFixed(2)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
              <small className="text-success">
                Avg: ${stats.averageOrderValue.toFixed(2)} per order
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-info">
            <Card.Body className="text-center">
              <div className="fs-1 text-info mb-2">📦</div>
              <h3 className="text-info mb-1">{stats.total}</h3>
              <p className="text-muted mb-0">Total Orders</p>
              <small className="text-info">
                {stats.todayOrders} orders today
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-success">
            <Card.Body className="text-center">
              <div className="fs-1 text-success mb-2">✅</div>
              <h3 className="text-success mb-1">{stats.delivered}</h3>
              <p className="text-muted mb-0">Delivered</p>
              <small className="text-success">
                {stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}% completion rate
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-warning">
            <Card.Body className="text-center">
              <div className="fs-1 text-warning mb-2">⏳</div>
              <h3 className="text-warning mb-1">{stats.pending + stats.processing}</h3>
              <p className="text-muted mb-0">In Progress</p>
              <small className="text-warning">
                {stats.pending} pending, {stats.processing} processing
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Breakdown */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📈 Status Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <div className="row g-2">
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-warning bg-opacity-10 rounded">
                    <span>Pending</span>
                    <Badge bg="warning">{stats.pending}</Badge>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-info bg-opacity-10 rounded">
                    <span>Processing</span>
                    <Badge bg="info">{stats.processing}</Badge>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-primary bg-opacity-10 rounded">
                    <span>Shipped</span>
                    <Badge bg="primary">{stats.shipped}</Badge>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 rounded">
                    <span>Delivered</span>
                    <Badge bg="success">{stats.delivered}</Badge>
                  </div>
                </div>
              </div>
              
              {stats.cancelled > 0 && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center p-2 bg-danger bg-opacity-10 rounded">
                    <span>Cancelled/Returned</span>
                    <Badge bg="danger">{stats.cancelled}</Badge>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">⚡ Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>📅 Today's Orders:</span>
                    <strong>{stats.todayOrders}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>💵 Average Order Value:</span>
                    <strong>${stats.averageOrderValue.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>📊 Completion Rate:</span>
                    <strong>
                      {stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}%
                    </strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>🚚 In Transit:</span>
                    <strong>{stats.shipped}</strong>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">📈 Revenue Trend</h5>
            </Card.Header>
            <Card.Body>
              <RevenueTrendChart orders={orders} days={14} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">🍩 Order Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <OrderStatusChart orders={orders} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product Analytics */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📦 Product Inventory</h5>
            </Card.Header>
            <Card.Body>
              {products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td><strong>{product.name}</strong></td>
                          <td><Badge bg="secondary">{product.category}</Badge></td>
                          <td>${product.price.toFixed(2)}</td>
                          <td>{product.stock}</td>
                          <td>
                            <Badge bg={product.stock > 20 ? 'success' : product.stock > 5 ? 'warning' : 'danger'}>
                              {product.stock > 20 ? 'In Stock' : product.stock > 5 ? 'Low Stock' : 'Critical'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">No products found</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">👥 Customer Insights</h5>
            </Card.Header>
            <Card.Body>
              {customers.length > 0 ? (
                <>
                  <Row className="mb-3">
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="fs-3 text-primary">{customers.length}</div>
                        <small className="text-muted">Total Customers</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center">
                        <div className="fs-3 text-success">
                          ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                        </div>
                        <small className="text-muted">Total Customer Value</small>
                      </div>
                    </Col>
                  </Row>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Orders</th>
                          <th>Total Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers
                          .sort((a, b) => b.totalSpent - a.totalSpent)
                          .map(customer => (
                            <tr key={customer.id}>
                              <td>
                                <div>
                                  <strong>{customer.displayName}</strong>
                                  <br />
                                  <small className="text-muted">{customer.email}</small>
                                </div>
                              </td>
                              <td>
                                <Badge bg="primary">{customer.totalOrders}</Badge>
                              </td>
                              <td>
                                <strong>${customer.totalSpent.toFixed(2)}</strong>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center py-3">No customers found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Products Analysis */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🏆 Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              {orders.length > 0 ? (
                (() => {
                  // Calculate product sales
                  const productSales = new Map<string, {
                    name: string;
                    quantity: number;
                    revenue: number;
                  }>();

                  orders.forEach(order => {
                    order.items.forEach(item => {
                      const existing = productSales.get(item.id) || {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                      };
                      existing.quantity += item.quantity;
                      existing.revenue += item.price * item.quantity;
                      productSales.set(item.id, existing);
                    });
                  });

                  const topProducts = Array.from(productSales.entries())
                    .sort((a, b) => b[1].revenue - a[1].revenue);

                  return (
                    <div className="row">
                      {topProducts.map(([productId, data], index) => (
                        <div key={productId} className="col-lg-3 col-md-6 mb-3">
                          <div className="p-3 bg-light rounded">
                            <div className="d-flex align-items-center mb-2">
                              <span className="fs-4 me-2">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'}
                              </span>
                              <strong>{data.name}</strong>
                            </div>
                            <div className="small">
                              <div>Sold: <strong>{data.quantity} units</strong></div>
                              <div>Revenue: <strong>${data.revenue.toFixed(2)}</strong></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <p className="text-muted text-center py-3">No sales data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🕒 Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map(order => (
                          <tr key={order.id}>
                            <td>
                              <code>{order.orderNumber}</code>
                            </td>
                            <td>{order.customer.displayName}</td>
                            <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                            <td>
                              <Badge bg={
                                order.status === 'delivered' ? 'success' :
                                order.status === 'shipped' ? 'primary' :
                                order.status === 'processing' ? 'info' :
                                order.status === 'pending' ? 'warning' : 'danger'
                              }>
                                {order.status}
                              </Badge>
                            </td>
                            <td>{format(new Date(order.createdAt), 'MMM dd, HH:mm')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No orders found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};