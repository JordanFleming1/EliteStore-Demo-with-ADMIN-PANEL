import type { OrderItem } from '../../types/index';
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  // Spinner and Alert imports removed
  ButtonGroup,
  Button,
  Table
} from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useOrders } from '../../hooks/useOrders';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalytics: React.FC = () => {
  const { orders } = useOrders(); // loading and error removed
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate stats from orders
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const created = new Date(order.createdAt);
      return created >= today;
    });
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => ['confirmed', 'processing', 'packed'].includes(o.status)).length,
      shipped: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => ['cancelled', 'returned', 'refunded'].includes(o.status)).length,
      todayOrders: todayOrders.length,
      revenue: orders
        .filter(o => ['delivered', 'shipped', 'out_for_delivery'].includes(o.status))
        .reduce((total, order) => total + (order.totalAmount || 0), 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length
        : 0
    };
  }, [orders]);

  // Calculate daily revenue and orders for the last 30 days
  const today = new Date();
  const days = 30;
  const dateRange = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyRevenue = dateRange.map(date => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString() && ['delivered', 'shipped', 'out_for_delivery'].includes(order.status);
    });
    return {
      date: date,
      revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      orders: dayOrders.length
    };
  });

  const revenueChartData = {
    labels: dailyRevenue.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailyRevenue.map(d => d.revenue),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
      },
    ],
  };

  const ordersChartData = {
    labels: dailyRevenue.map(d => d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Orders',
        data: dailyRevenue.map(d => d.orders),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  // Category Sales Chart (calculated from orders)
  const categoryMap: Record<string, { sales: number; products: number; revenue: number }> = {};
  orders.forEach(order => {
    if (order.items) {
      order.items.forEach((item: OrderItem) => {
        const category: string = item.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = { sales: 0, products: 0, revenue: 0 };
        }
        categoryMap[category].sales += item.quantity;
        categoryMap[category].products += 1;
        categoryMap[category].revenue += item.price * item.quantity;
      });
    }
  });
  const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({ category, ...data }));
  const categoryChartData = {
    labels: categoryBreakdown.map(c => c.category),
    datasets: [
      {
        data: categoryBreakdown.map(c => c.sales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h2 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Analytics Dashboard
                </h2>
              </div>
            </div>
            <p className="text-muted mb-0">
              Real-time data from orders • Last updated: {new Date().toLocaleString()}
            </p>
          </Col>
          <Col xs="auto">
            <ButtonGroup>
              <Button
                variant={timeRange === '7d' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        {/* Monthly Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3">
                      <i className="fas fa-dollar-sign fa-2x text-success"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h3 className="mb-0">${stats.revenue.toFixed(2)}</h3>
                    <small className="text-success">
                      Avg: ${stats.averageOrderValue.toFixed(2)} per order
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                      <i className="fas fa-shopping-cart fa-2x text-primary"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h3 className="mb-0">{stats.total}</h3>
                    <small className="text-muted">{stats.todayOrders} orders today</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                      <i className="fas fa-chart-line fa-2x text-warning"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Avg Order Value</h6>
                    <h3 className="mb-0">${stats.averageOrderValue.toFixed(2)}</h3>
                    <small className="text-muted">Per transaction</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3">
                      <i className="fas fa-users fa-2x text-info"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Delivered</h6>
                    <h3 className="mb-0">{stats.delivered}</h3>
                    <small className="text-muted">{stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0}% completion rate</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2 text-primary"></i>
                  Revenue Trend (Last 30 Days)
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-chart-pie me-2 text-primary"></i>
                  Sales by Category
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Doughnut data={categoryChartData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Orders Chart */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-shopping-cart me-2 text-primary"></i>
                  Daily Orders (Last 30 Days)
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Bar data={ordersChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top Selling Products Table (calculated from orders) */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2 text-warning"></i>
                  Top Selling Products
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Rank</th>
                      <th>Product</th>
                      <th className="text-center">Units Sold</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Calculate product sales from orders
                      const productSales = new Map<string, { name: string; unitsSold: number; revenue: number }>();
                      orders.forEach(order => {
                        if (order.items) {
                          order.items.forEach((item: OrderItem) => {
                            const existing = productSales.get(item.id) || { name: item.name, unitsSold: 0, revenue: 0 };
                            existing.unitsSold += item.quantity;
                            existing.revenue += item.price * item.quantity;
                            productSales.set(item.id, existing);
                          });
                        }
                      });
                      const topProducts = Array.from(productSales.entries())
                        .sort((a, b) => b[1].revenue - a[1].revenue)
                        .slice(0, 10);
                      if (topProducts.length > 0) {
                        return topProducts.map(([productId, data], index) => (
                          <tr key={productId}>
                            <td>
                              <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'light'}>
                                #{index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="fw-bold">{data.name}</div>
                              <small className="text-muted">{productId}</small>
                            </td>
                            <td className="text-center">
                              <Badge bg="primary" pill>
                                {data.unitsSold}
                              </Badge>
                            </td>
                            <td className="text-end text-success fw-bold">
                              ${data.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              No product data available
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-tags me-2 text-success"></i>
                  Category Performance
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Category</th>
                      <th className="text-center">Products</th>
                      <th className="text-end">Sales</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.length > 0 ? (
                      categoryBreakdown.map((category) => (
                        <tr key={category.category}>
                          <td>
                            <div className="fw-bold">{category.category}</div>
                          </td>
                          <td className="text-center">
                            <Badge bg="secondary" pill>
                              {category.products}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Badge bg="primary" pill>
                              {category.sales}
                            </Badge>
                          </td>
                          <td className="text-end text-success fw-bold">
                            ${category.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No category data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top Customers Table (calculated from orders) */}
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-star me-2 text-warning"></i>
                  Top Customers
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Rank</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th className="text-center">Orders</th>
                      <th className="text-end">Total Spent</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Calculate top customers from orders
                      const customerMap = new Map<string, { name: string; email: string; orderCount: number; totalSpent: number }>();
                      orders.forEach(order => {
                        const customerId = order.customerId || order.customer?.id || 'unknown';
                        const name = order.customer?.name || order.customer?.displayName || 'Unknown';
                        const email = order.customer?.email || '';
                        const existing = customerMap.get(customerId) || { name, email, orderCount: 0, totalSpent: 0 };
                        existing.orderCount += 1;
                        existing.totalSpent += order.totalAmount || 0;
                        customerMap.set(customerId, existing);
                      });
                      const topCustomers = Array.from(customerMap.entries())
                        .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                        .slice(0, 10);
                      if (topCustomers.length > 0) {
                        return topCustomers.map(([customerId, data], index) => (
                          <tr key={customerId}>
                            <td>
                              <Badge bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : 'light'}>
                                #{index + 1}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '35px', height: '35px' }}>
                                  {data.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold">{data.name}</div>
                                  <small className="text-muted">{customerId}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">{data.email || 'N/A'}</small>
                            </td>
                            <td className="text-center">
                              <Badge bg="primary" pill>
                                {data.orderCount}
                              </Badge>
                            </td>
                            <td className="text-end text-success fw-bold">
                              ${data.totalSpent.toFixed(2)}
                            </td>
                            <td className="text-center">
                              <Badge bg="success">
                                <i className="fas fa-star me-1"></i>
                                VIP
                              </Badge>
                            </td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                              No customer data available
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminAnalytics;
