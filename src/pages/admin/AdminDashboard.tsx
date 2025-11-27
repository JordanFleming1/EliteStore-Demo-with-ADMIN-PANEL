import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Row, Col, Card, Table, Badge, Button, Alert, ProgressBar, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { type Product } from '../../types/index';
import api from '../../api/simple-api';
import { getCurrencySymbol } from '../../utils/currencies';
import type { AnalyticsData } from '../../types/api-types';

const AdminContact = lazy(() => import('./AdminContact.tsx'));
const AdminAbout = lazy(() => import('./AdminAbout.tsx'));

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // setLoading is not used, but keep for possible future loading state
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Demo reset button state
  const [resettingDemo, setResettingDemo] = useState(false);
  const [resetDemoStatus, setResetDemoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Handler for demo reset button
  const handleDemoReset = async () => {
    setResettingDemo(true);
    setResetDemoStatus('idle');
    try {
      // Use local emulator endpoint if running locally, otherwise show info
      let endpoint = '';
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        endpoint = 'http://localhost:5001/ecommerce-store---fiverr-gig/us-central1/resetDemoData';
      } else {
        setResetDemoStatus('error');
        alert('Demo data reset is only available when running locally with the Firebase Emulator. Please run the local reset script or emulator.');
        setResettingDemo(false);
        return;
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      setResetDemoStatus('success');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setResetDemoStatus('error');
    } finally {
      setResettingDemo(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      // Refresh the products list
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setStats(prev => ({ ...prev, totalProducts: updatedProducts.length }));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const [productsData, , customersData, orderStats] = await Promise.all([
          productService.getAllProducts(),
          api.getOrders(),
          api.getCustomers(),
          api.getOrderStats()
        ]);
        setProducts(productsData);
        // Calculate real statistics
        const statsData = orderStats as AnalyticsData;
        const realStats = {
          totalProducts: productsData.length,
          totalOrders: statsData?.monthlyStats?.totalOrders ?? 0,
          totalCustomers: customersData.length,
          totalRevenue: statsData?.monthlyStats?.totalRevenue ?? 0
        };
        setStats(realStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to products only if API fails
        try {
          const productsData = await productService.getAllProducts();
          setProducts(productsData);
          setStats(prev => ({
            ...prev,
            totalProducts: productsData.length
          }));
        } catch (fallbackError) {
          console.error('Fallback fetch failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recentProducts = products.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const featuredProducts = products.filter(p => p.featured);

  // Calculate real growth metrics (since we have recent data)
  const revenueGrowth = stats.totalRevenue > 0 ? 'New Revenue' : '0%';
  const orderGrowth = stats.totalOrders > 0 ? `${stats.totalOrders} Total` : '0';
  const customerGrowth = stats.totalCustomers > 0 ? `${stats.totalCustomers} Active` : '0';

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <div className="h5">Loading dashboard...</div>
          <div className="text-muted">Fetching your latest business metrics</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* DEMO RESET BANNER */}
      <div className="alert alert-info d-flex align-items-center mb-4 shadow-sm" style={{ fontSize: '1.1rem', borderLeft: '6px solid #0dcaf0', background: 'linear-gradient(90deg, #e3f7fc 60%, #f8fafc 100%)' }}>
        <i className="fas fa-info-circle me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
        <div>
          <strong>Public Demo Mode:</strong> This admin panel is for <u>portfolio demonstration</u> only.<br />
          All data resets automatically or can be reset manually at any time. Please feel free to explore and test features!
        </div>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Overview</h2>
          <p className="text-muted mb-0">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="d-flex align-items-center text-muted">
          <i className="fas fa-calendar me-2"></i>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <Row className="g-4 mb-5">
        <Col xl={3} lg={6} md={6}>
          <Card className="h-100 border-0 shadow-sm overflow-hidden">
            <Card.Body className="position-relative">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary text-white rounded-3 p-3">
                    <i className="fas fa-boxes fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Products</div>
                  <div className="fs-3 fw-bold text-primary">{stats.totalProducts}</div>
                  <div className="small text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    Active Inventory
                  </div>
                </div>
              </div>
              <div className="position-absolute top-0 end-0 p-3">
                <div className="text-primary opacity-25">
                  <i className="fas fa-boxes fs-1"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="h-100 border-0 shadow-sm overflow-hidden">
            <Card.Body className="position-relative">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success text-white rounded-3 p-3">
                    <i className="fas fa-shopping-cart fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Orders</div>
                  <div className="fs-3 fw-bold text-success">{stats.totalOrders}</div>
                  <div className="small text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    {orderGrowth}
                  </div>
                </div>
              </div>
              <div className="position-absolute top-0 end-0 p-3">
                <div className="text-success opacity-25">
                  <i className="fas fa-shopping-cart fs-1"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="h-100 border-0 shadow-sm overflow-hidden">
            <Card.Body className="position-relative">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info text-white rounded-3 p-3">
                    <i className="fas fa-users fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Customers</div>
                  <div className="fs-3 fw-bold text-info">{stats.totalCustomers}</div>
                  <div className="small text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    {customerGrowth}
                  </div>
                </div>
              </div>
              <div className="position-absolute top-0 end-0 p-3">
                <div className="text-info opacity-25">
                  <i className="fas fa-users fs-1"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="h-100 border-0 shadow-sm overflow-hidden">
            <Card.Body className="position-relative">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning text-white rounded-3 p-3">
                    <i className="fas fa-dollar-sign fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Revenue</div>
                  <div className="fs-3 fw-bold text-warning">
                    {/* Show the symbol of the first product's currency, fallback to $ if none */}
                    {getCurrencySymbol(products[0]?.currency || 'USD')}
                    {(stats.totalRevenue ?? 0).toLocaleString()}
                  </div>
                  <div className="small text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    {revenueGrowth}
                  </div>
                </div>
              </div>
              <div className="position-absolute top-0 end-0 p-3">
                <div className="text-warning opacity-25">
                  <i className="fas fa-dollar-sign fs-1"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Insights */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-3">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h6 className="mb-0">Inventory Health</h6>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between small text-muted">
                  <span>Well Stocked</span>
                  <span>{products.filter(p => p.stock > 10).length} products</span>
                </div>
                <ProgressBar 
                  variant="success" 
                  now={(products.filter(p => p.stock > 10).length / products.length) * 100} 
                  style={{ height: '6px' }}
                />
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between small text-muted">
                  <span>Low Stock</span>
                  <span>{lowStockProducts.length} products</span>
                </div>
                <ProgressBar 
                  variant="warning" 
                  now={(lowStockProducts.length / products.length) * 100} 
                  style={{ height: '6px' }}
                />
              </div>
              <div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>Out of Stock</span>
                  <span>{outOfStockProducts.length} products</span>
                </div>
                <ProgressBar 
                  variant="danger" 
                  now={(outOfStockProducts.length / products.length) * 100} 
                  style={{ height: '6px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3">
                  <i className="fas fa-star"></i>
                </div>
                <h6 className="mb-0">Featured Products</h6>
              </div>
              <div className="text-center">
                <div className="fs-2 fw-bold text-primary">{featuredProducts.length}</div>
                <div className="text-muted">Currently Featured</div>
                <Link to="/admin/products" className="btn btn-outline-primary btn-sm mt-2">
                  Manage Featured
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-2 me-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h6 className="mb-0">Alerts & Notifications</h6>
              </div>
              {lowStockProducts.length > 0 ? (
                <Alert variant="warning" className="py-2 px-3 mb-2">
                  <small>
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {lowStockProducts.length} products running low
                  </small>
                </Alert>
              ) : null}
              {outOfStockProducts.length > 0 ? (
                <Alert variant="danger" className="py-2 px-3 mb-2">
                  <small>
                    <i className="fas fa-times-circle me-1"></i>
                    {outOfStockProducts.length} products out of stock
                  </small>
                </Alert>
              ) : null}
              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
                <div className="text-center text-success">
                  <i className="fas fa-check-circle fs-3 mb-2"></i>
                  <div>All good!</div>
                  <small className="text-muted">No urgent alerts</small>
                </div>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Products */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Recent Products</h5>
                <Link to="/admin/products" className="btn btn-outline-primary btn-sm">
                  View All
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3 ps-4">Product</th>
                      <th className="border-0 py-3">Category</th>
                      <th className="border-0 py-3">Price</th>
                      <th className="border-0 py-3">Stock</th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 py-3 pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="py-3 ps-4">
                          <div className="d-flex align-items-center">
                            <img
                              src={product.images?.[0] || '/api/placeholder/50/50'}
                              alt={product.name}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold">{product.name}</div>
                              <div className="text-muted small">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold">
                            {product.discountPrice ? (
                              <>
                                <span className="text-primary">
                                  {getCurrencySymbol(product.currency || 'USD')}{product.discountPrice}
                                </span>
                                <span className="text-muted text-decoration-line-through ms-1 small">
                                  {getCurrencySymbol(product.currency || 'USD')}{product.price}
                                </span>
                              </>
                            ) : (
                              <span>
                                {getCurrencySymbol(product.currency || 'USD')}{product.price}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                            {product.stock} in stock
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                            {product.stock > 0 ? 'Active' : 'Out of Stock'}
                          </Badge>
                        </td>
                        <td className="py-3 pe-4">
                          <Link
                            to={`/admin/products`}
                            className="btn btn-outline-primary btn-sm me-1"
                            onClick={() => {
                              // Store the product ID to edit in session storage
                              sessionStorage.setItem('editProductId', product.id);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                {/* DEMO RESET BUTTON */}
                <button
                  className="btn btn-danger"
                  style={{ fontWeight: 600 }}
                  onClick={handleDemoReset}
                  disabled={resettingDemo}
                >
                  {resettingDemo ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting Demo Data...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo me-2"></i>
                      Reset Demo Data
                    </>
                  )}
                </button>
                {resetDemoStatus === 'success' && (
                  <div className="alert alert-success py-2 px-3 mt-2 mb-0 text-center">
                    <i className="fas fa-check-circle me-2"></i>
                    Demo data has been reset!
                  </div>
                )}
                {resetDemoStatus === 'error' && (
                  <div className="alert alert-danger py-2 px-3 mt-2 mb-0 text-center">
                    <i className="fas fa-times-circle me-2"></i>
                    Failed to reset demo data. Please try again.
                  </div>
                )}
                <Link 
                  to="/admin/products?action=create" 
                  className="btn btn-primary"
                  onClick={() => {
                    // This will navigate to products page where we can handle the action parameter
                    sessionStorage.setItem('openCreateForm', 'true');
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add New Product
                </Link>
                
                <Link to="/admin/products" className="btn btn-outline-primary">
                  <i className="fas fa-boxes me-2"></i>
                  Manage Products
                </Link>
                
                {/* Removed Check Low Stock and Refresh Dashboard actions */}
                
                <Link to="/admin/orders" className="btn btn-primary">
                  <i className="fas fa-shopping-cart me-2"></i>
                  View Orders
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold text-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Low Stock Alert
              </h5>
            </Card.Header>
            <Card.Body>
              {products.filter(p => p.stock <= 10 && p.stock > 0).length > 0 ? (
                <div>
                  {products
                    .filter(p => p.stock <= 10 && p.stock > 0)
                    .slice(0, 3)
                    .map(product => (
                      <div key={product.id} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small">{product.name}</span>
                        <Badge bg="warning">{product.stock} left</Badge>
                      </div>
                    ))}
                  <Link to="/admin/products" className="btn btn-outline-warning btn-sm w-100 mt-2">
                    View All Low Stock Items
                  </Link>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-check-circle fs-3 mb-2"></i>
                  <div>All products are well stocked!</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contact Editor Section */}
      <Row className="mt-4">
        <Col>
          <Suspense fallback={<div className="text-center p-5"><div className="spinner-border text-primary"></div></div>}>
            <AdminContact />
          </Suspense>
        </Col>
      </Row>

      {/* About Page Editor Section */}
      <Row className="mt-4">
        <Col>
          <Suspense fallback={<div className="text-center p-5"><div className="spinner-border text-primary"></div></div>}>
            <AdminAbout />
          </Suspense>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-trash fa-3x text-danger mb-3"></i>
            <h5 className="mb-3">Delete Product?</h5>
            {productToDelete && (
              <p className="text-muted">
                Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? 
                This action cannot be undone.
              </p>
            )}
            <div className="alert alert-warning mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Warning:</strong> This will permanently remove the product and all associated data.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>
            <i className="fas fa-times me-2"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i>
                Delete Product
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;