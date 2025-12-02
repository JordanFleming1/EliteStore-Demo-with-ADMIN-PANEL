// ...existing code...
  // ...existing code...
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import api from '../../api/simple-api';
import type { HeroSlide } from '../../types/api-types';
import '../../styles/admin-hero-slides.css';

const AdminHeroSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  // Removed unused loading and setLoading
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<HeroSlide>({
    id: Date.now(),
    title: '',
    subtitle: '',
    image: '/api/placeholder/600/400',
    order: 1,
    isActive: true,
    backgroundColor: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [slideToDeactivate, setSlideToDeactivate] = useState<HeroSlide | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const data = await api.getHeroSlides();
      setSlides(
        data.map((s: HeroSlide) => ({
          ...s,
          id: typeof s.id === 'string' ? parseInt(s.id, 10) : s.id,
          subtitle: s.subtitle || '',
          image: s.image || '/api/placeholder/600/400',
          isActive: typeof s.isActive === 'boolean' ? s.isActive : true,
          order: typeof s.order === 'number' ? s.order : 1,
          title: s.title || '',
        })).sort((a: HeroSlide, b: HeroSlide) => a.order - b.order)
      );
    } finally {
      setShowDeleteModal(false);
      setSlideToDelete(null);
    }
  };

  // Handler to open modal for adding a new slide
  const handleAdd = () => {
    setEditingSlide(null);
    setFormData({
      id: Date.now(),
      title: '',
      subtitle: '',
      image: '/api/placeholder/600/400',
      order: slides.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  // Handler to edit a slide
  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      ...slide,
      backgroundColor: slide.backgroundColor || '#667eea',
      gradient: slide.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    });
    setShowModal(true);
  };

  // Handler to open delete confirmation modal
  const handleDelete = (id: number | string) => {
    const slide = slides.find(s => s.id === (typeof id === 'string' ? parseInt(id, 10) : id));
    setSlideToDelete(slide || null);
    setShowDeleteModal(true);
  };

  // Handler to confirm delete
  const confirmDelete = async () => {
    if (!slideToDelete) return;
    try {
      await api.deleteHeroSlide(slideToDelete.id.toString());
      await fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    } finally {
      setShowDeleteModal(false);
      setSlideToDelete(null);
    }
  };

  // Handler for deactivate confirmation
  // Removed unused handleToggleActive
    if (slide.isActive) {
      setSlideToDeactivate(slide);
      setShowDeactivateModal(true);
    } else {
      toggleActive(slide);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await api.saveHeroSlide({ ...slide, isActive: !slide.isActive });
      await fetchSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
    } finally {
      setShowDeactivateModal(false);
      setSlideToDeactivate(null);
    }
  };

  // Handler to save a slide (add or update)
  const handleSave = async () => {
    try {
      await api.saveHeroSlide(formData);
      await fetchSlides();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  return (
    <>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-sliders me-2"></i>
              Hero Slides Manager
            </h2>
            <p className="text-muted mb-0">Customize the homepage carousel slides</p>
          </div>
          <Button variant="primary" onClick={handleAdd}>
            <i className="bi bi-plus-lg me-2"></i>
            Add New Slide
          </Button>
        </div>
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Buttons</th>
                      <th>Status</th>
                      <th>Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slides.map((slide) => (
                      <tr key={slide.id}>
                        <td>
                          <Badge bg="secondary">{slide.order}</Badge>
                        </td>
                        <td>
                          <strong>{slide.title}</strong>
                          <div className="text-muted small">{slide.subtitle}</div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            {/* No description field in canonical type, so skip or add if needed */}
                          </div>
                        </td>
                        <td>
                          {/* No button fields in canonical type, so skip or add if needed */}
                        </td>
                        <td>
                          <Badge bg={slide.isActive ? 'success' : 'secondary'}>
                            {slide.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <img src={slide.image} alt="Preview" style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                        </td>
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(slide)}
                              title="Edit Slide"
                            >
                              <i className="bi bi-pencil me-1"></i> Edit
                            </Button>
                            <Button
                              variant={slide.isActive ? 'outline-warning' : 'outline-success'}
                              size="sm"
                              onClick={() => {
                                if (slide.isActive) {
                                  setSlideToDeactivate(slide);
                                  setShowDeactivateModal(true);
                                } else {
                                  toggleActive(slide);
                                }
                              }}
                              title={slide.isActive ? 'Deactivate Slide' : 'Activate Slide'}
                            >
                              <i className={`bi bi-${slide.isActive ? 'eye-slash' : 'eye'} me-1`}></i> {slide.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(slide.id.toString())}
                              title="Delete Slide"
                            >
                              <i className="bi bi-trash me-1"></i> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {slides.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-images" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p className="text-muted mt-3">No slides found. Add your first slide to get started.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* Edit/Add Slide Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="admin-hero-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSlide ? 'Edit Slide' : 'Add New Slide'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Slide Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Discover Premium Products"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Best deals of the season"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Order Position</Form.Label>
              <Form.Control
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Background Color</Form.Label>
              <Form.Control
                type="color"
                value={formData.backgroundColor || '#667eea'}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                title="Pick a background color"
              />
              <Form.Text className="text-muted ms-2">Solid color fallback for the slide background.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gradient</Form.Label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                  'linear-gradient(135deg, #ff6a88 0%, #ffcc70 100%)',
                  'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
                  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                  'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
                  'linear-gradient(135deg, #00c3ff 0%, #ffff1c 100%)',
                  'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
                  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                ].map((gradient, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFormData({ ...formData, gradient })}
                    style={{
                      width: 48,
                      height: 32,
                      borderRadius: 6,
                      border: formData.gradient === gradient ? '3px solid #0d6efd' : '2px solid #eee',
                      background: gradient,
                      cursor: 'pointer',
                      boxShadow: formData.gradient === gradient ? '0 0 0 2px #0d6efd33' : 'none',
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    title={gradient}
                  />
                ))}
              </div>
              <Form.Text className="text-muted ms-2">Click a gradient to use for this slide background.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hero Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB');
                    return;
                  }
                  setUploadingImage(true);
                  try {
                    const base64 = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = () => reject(new Error('Failed to read image file'));
                      reader.readAsDataURL(file);
                    });
                    setFormData(prev => ({ ...prev, image: base64 }));
                  } catch {
                    alert('Failed to upload image. Please try again.');
                  } finally {
                    setUploadingImage(false);
                  }
                }}
                disabled={uploadingImage}
              />
              <Form.Text className="text-muted">
                Upload an image file (max 5MB). Recommended size: 1920x600px for best results.
              </Form.Text>
              {uploadingImage && (
                <div className="mt-2 text-primary">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Uploading image...
                </div>
              )}
              {formData.image && formData.image !== '/api/placeholder/600/400' && (
                <div className="mt-3 border rounded p-2 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="fw-bold">Image Preview:</small>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => setFormData({ ...formData, image: '/api/placeholder/600/400' })}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Remove
                    </Button>
                  </div>
                  <img 
                    src={formData.image} 
                    alt="Hero preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '150px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginLeft: '120px'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Active (visible on homepage)"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Slide
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} dialogClassName="admin-hero-modal">
        <Modal.Header closeButton>
          <Modal.Title>Delete Slide</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this slide? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal show={showDeactivateModal} onHide={() => setShowDeactivateModal(false)} dialogClassName="admin-hero-modal">
        <Modal.Header closeButton>
          <Modal.Title>Deactivate Slide</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to deactivate this slide? It will no longer be visible on the homepage.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={() => slideToDeactivate && toggleActive(slideToDeactivate)}>
            Deactivate
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default AdminHeroSlides;
export default AdminHeroSlides;
