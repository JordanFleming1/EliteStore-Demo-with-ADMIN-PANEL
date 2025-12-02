import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Modal,
  Pagination
} from 'react-bootstrap';
import api from '../../api/simple-api';
import type { Customer } from '../../types/api-types';

const AdminCustomers: React.FC = () => {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  useEffect(() => {
    fetchCustomers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchCustomers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...customers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        customer =>
          customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = (a.displayName || '').localeCompare(b.displayName || '');
          break;
        case 'orders':
          compareValue = (a.totalOrders || 0) - (b.totalOrders || 0);
          break;
        case 'spent':
          compareValue = (a.totalSpent || 0) - (b.totalSpent || 0);
          break;
        case 'date': {
          const dateA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
          const dateB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
          compareValue = dateA - dateB;
          break;
        }
        default:
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching customers from API...');
      const data = await api.getCustomers();
      console.log('✅ Customers fetched successfully:', data.length, 'customers');
      console.log('Customer data:', data);
      setCustomers(data);
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading customers...</p>
      </Container>
    );
  }

  return (
    <div>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Customer Management
                </h2>
                <p className="text-muted mb-0">Manage and view customer information</p>
              </div>
              <div>
                <Button 
                  variant="outline-primary" 
                  onClick={fetchCustomers}
                  disabled={loading}
                  className="me-2"
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowEmailModal(true)}
                  disabled={customers.length === 0}
                >
                  <i className="fas fa-envelope me-2"></i>
                  Email All Customers
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        {/* Email All Customers Modal */}
        <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-envelope me-2"></i>
              Email All Customers
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {emailStatus && (
              <Alert variant={emailStatus.startsWith('Error') ? 'danger' : 'success'} onClose={() => setEmailStatus(null)} dismissible>
                {emailStatus}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  disabled={sendingEmail}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Enter your message to all customers"
                  disabled={sendingEmail}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEmailModal(false)} disabled={sendingEmail}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={sendingEmail || !emailSubject || !emailBody}
              onClick={async () => {
                setSendingEmail(true);
                setEmailStatus(null);
                try {
                  // Simulate sending email to all customers
                  // Replace with actual API integration for real email sending
                  const emails = customers.map(c => c.email).filter(Boolean);
                  // Here you would call your backend API to send the email
                  // For now, just simulate delay
                  await new Promise(res => setTimeout(res, 1500));
                  setEmailStatus(`Email sent to ${emails.length} customers.`);
                } catch {
                  setEmailStatus('Error sending email.');
                } finally {
                  setSendingEmail(false);
                }
              }}
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                      <i className="fas fa-users fa-2x text-primary"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Customers</h6>
                    <h3 className="mb-0">{totalCustomers}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3">
                      <i className="fas fa-dollar-sign fa-2x text-success"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h3 className="mb-0">${totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                      <i className="fas fa-shopping-cart fa-2x text-warning"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h3 className="mb-0">{totalOrders}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3">
                      <i className="fas fa-chart-line fa-2x text-info"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="text-muted mb-1">Avg Order Value</h6>
                    <h3 className="mb-0">${avgOrderValue.toFixed(2)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end">
                <Form.Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as typeof sortBy);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="spent-desc">Highest Spending</option>
                  <option value="spent-asc">Lowest Spending</option>
                  <option value="orders-desc">Most Orders</option>
                  <option value="orders-asc">Fewest Orders</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Customers Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Customer
                      {sortBy === 'name' && (
                        <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}></i>
                      )}
                    </th>
                    <th>Contact</th>
                    <th
                      className="cursor-pointer text-center"
                      onClick={() => handleSort('orders')}
                    >
                      Orders
                      {sortBy === 'orders' && (
                        <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}></i>
                      )}
                    </th>
                    <th
                      className="cursor-pointer text-end"
                      onClick={() => handleSort('spent')}
                    >
                      Total Spent
                      {sortBy === 'spent' && (
                        <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}></i>
                      )}
                    </th>
                    <th
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      Joined Date
                      {sortBy === 'date' && (
                        <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}></i>
                      )}
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.length > 0 ? (
                    currentCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                              {customer.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold">{customer.displayName}</div>
                              <small className="text-muted">{customer.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>
                              <i className="fas fa-envelope me-2 text-muted"></i>
                              {customer.email}
                            </div>
                            <div>
                              <i className="fas fa-phone me-2 text-muted"></i>
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <Badge bg="primary" pill>
                            {customer.totalOrders}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <strong className="text-success">
                            ${customer.totalSpent.toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          {new Date(customer.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        {searchTerm ? (
                          <>
                            <i className="fas fa-search fa-3x mb-3 d-block"></i>
                            No customers found matching "{searchTerm}"
                          </>
                        ) : (
                          <>
                            <i className="fas fa-users fa-3x mb-3 d-block"></i>
                            No customers available
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Showing {indexOfFirstCustomer + 1} to{' '}
                  {Math.min(indexOfLastCustomer, filteredCustomers.length)} of{' '}
                  {filteredCustomers.length} customers
                </div>
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />

                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + idx;
                    } else {
                      pageNumber = currentPage - 2 + idx;
                    }

                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  })}

                  <Pagination.Next
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>

        {/* Customer Detail Modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-user me-2"></i>
              Customer Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCustomer && (
              <Row>
                <Col md={12} className="mb-4">
                  <div className="text-center">
                    <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                      {selectedCustomer.displayName.charAt(0).toUpperCase()}
                    </div>
                    <h4>{selectedCustomer.displayName}</h4>
                    <p className="text-muted">{selectedCustomer.id}</p>
                  </div>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light mb-3">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Contact Information</h6>
                      <div className="mb-2">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        <strong>Email:</strong>
                        <div className="ms-4">{selectedCustomer.email}</div>
                      </div>
                      <div className="mb-2">
                        <i className="fas fa-phone me-2 text-primary"></i>
                        <strong>Phone:</strong>
                        <div className="ms-4">{selectedCustomer.phone}</div>
                      </div>
                      <div>
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        <strong>Joined:</strong>
                        <div className="ms-4">
                          {new Date(selectedCustomer.joinedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 bg-light mb-3">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Purchase Statistics</h6>
                      <div className="mb-2">
                        <i className="fas fa-shopping-cart me-2 text-success"></i>
                        <strong>Total Delivered Orders:</strong>
                        <div className="ms-4">
                          <Badge bg="primary" pill>
                            {selectedCustomer.totalOrders}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-2">
                        <i className="fas fa-dollar-sign me-2 text-success"></i>
                        <strong>Total Delivered Revenue:</strong>
                        <div className="ms-4 text-success fs-5 fw-bold">
                          ${selectedCustomer.totalSpent.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <i className="fas fa-chart-line me-2 text-success"></i>
                        <strong>Average Delivered Order:</strong>
                        <div className="ms-4">
                          {selectedCustomer.totalOrders > 0 ? `$${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}` : '$0.00'}
                        </div>
                      </div>
                      <div className="mt-3">
                        <h6 className="text-muted">Order Status Breakdown</h6>
                        <ul className="list-unstyled ms-2">
                          {selectedCustomer.orderStatusCounts && Object.entries(selectedCustomer.orderStatusCounts).map(([status, count]) => (
                            <li key={status}>
                              <Badge bg={status === 'delivered' ? 'success' : 'secondary'} className="me-2">{count}</Badge>
                              <span className="text-capitalize">{status.replace(/_/g, ' ')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminCustomers;
