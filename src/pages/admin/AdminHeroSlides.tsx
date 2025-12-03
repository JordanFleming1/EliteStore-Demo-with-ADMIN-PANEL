// ...existing code...
  // ...existing code...


import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../api/simple-api';
import { type HeroSlide } from '../../types/api-types';
import '../../styles/admin-hero-slides.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase.config';


const GRADIENT_OPTIONS = [
  { key: 'blue-purple', label: 'Blue-Purple', value: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
  { key: 'retro', label: 'Retro Sunset', value: 'linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)' },
  { key: 'pastel', label: 'Pastel', value: 'linear-gradient(90deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { key: 'aqua', label: 'Aqua', value: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)' },
  { key: 'pink-orange', label: 'Pink-Orange', value: 'linear-gradient(90deg, #ffb347 0%, #ff758c 50%, #ff7eb3 100%)' },
  { key: 'indigo', label: 'Indigo', value: 'linear-gradient(90deg, #3f2b96 0%, #a8c0ff 100%)' },
];

const defaultSlide: Partial<HeroSlide> = {
  title: '',
  subtitle: '',
  image: '',
  order: 1,
  isActive: true,
  gradient: GRADIENT_OPTIONS[0].value
};

const AdminHeroSlides: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; variant: 'success' | 'danger'; message: string }>({ show: false, variant: 'success', message: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await api.getHeroSlides();
      setSlides(data);
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: `Failed to load hero slides. ${error}` });
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (slide?: HeroSlide) => {
    setEditingSlide(slide ? { ...slide } : { ...defaultSlide, order: slides.length + 1 });
    setShowModal(true);
    setUploadingImage(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!editingSlide) return;
    setUploadingImage(true);
    try {
      const fileName = `heroSlides/slide_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setEditingSlide({ ...editingSlide, image: downloadURL });
      setAlert({ show: true, variant: 'success', message: 'Image uploaded successfully.' });
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: `Failed to upload image. ${error}` });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingSlide) return;
    setSaving(true);
    try {
      await api.saveHeroSlide(editingSlide);
      setAlert({ show: true, variant: 'success', message: 'Hero slide saved successfully.' });
      setShowModal(false);
      fetchSlides();
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: `Failed to save hero slide. ${error}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    setSaving(true);
    try {
      await api.deleteHeroSlide(String(id));
      setAlert({ show: true, variant: 'success', message: 'Hero slide deleted.' });
      fetchSlides();
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: `Failed to delete hero slide. ${error}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Hero Slides</h2>
          <p className="text-muted">Customize the homepage hero carousel. Add, edit, or remove slides. Changes are live instantly.</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => handleEdit()}>
            <i className="fas fa-plus me-2"></i>Add Slide
          </Button>
        </Col>
      </Row>
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row>
          {slides.length === 0 ? (
            <Col>
              <Card className="text-center p-5">
                <Card.Body>
                  <h5>No hero slides found.</h5>
                  <Button variant="outline-primary" onClick={() => handleEdit()}>
                    Add First Slide
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            slides.sort((a, b) => a.order - b.order).map((slide) => (
              <Col md={6} lg={4} className="mb-4" key={slide.id}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5 className="fw-bold mb-2">{slide.title}</h5>
                    <p className="mb-2 text-muted">{slide.subtitle}</p>
                    {slide.image && (
                      <img src={slide.image} alt={slide.title} className="img-fluid rounded mb-2" style={{ maxHeight: 120 }} />
                    )}
                    <div className="mb-2">
                      <span className="badge bg-secondary me-2">Order: {slide.order}</span>
                      <span className={`badge ${slide.isActive ? 'bg-success' : 'bg-danger'}`}>{slide.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="badge bg-info me-2">BG: {slide.backgroundColor || 'none'}</span>
                      <span className="badge bg-warning">Gradient: {slide.gradient || 'none'}</span>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(slide)}>
                        <i className="fas fa-edit me-1"></i>Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(slide.id)}>
                        <i className="fas fa-trash me-1"></i>Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Edit/Add Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="admin-hero-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editingSlide?.id ? 'Edit Slide' : 'Add Slide'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editingSlide?.title || ''}
                onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                placeholder="Slide title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                type="text"
                value={editingSlide?.subtitle || ''}
                onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                placeholder="Slide subtitle"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hero Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploadingImage}
              />
              {uploadingImage && <Spinner animation="border" size="sm" className="ms-2" />}
              {editingSlide?.image && (
                <div className="mt-2">
                  <img src={editingSlide.image} alt="Preview" className="img-fluid rounded border" style={{ maxHeight: 120 }} />
                  <p className="text-success small mt-1">
                    <i className="fas fa-check me-1"></i>
                    Image uploaded
                  </p>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                value={editingSlide?.order || 1}
                onChange={e => setEditingSlide({ ...editingSlide, order: Number(e.target.value) })}
                min={1}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editingSlide?.isActive ?? true}
                onChange={e => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Background Style</Form.Label>
              <Form.Select
                value={editingSlide?.gradient || GRADIENT_OPTIONS[0].value}
                onChange={e => setEditingSlide({ ...editingSlide, gradient: e.target.value })}
              >
                {GRADIENT_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
              <div className="mt-2">
                <div style={{ height: 40, borderRadius: 8, background: editingSlide?.gradient || GRADIENT_OPTIONS[0].value }} />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminHeroSlides;
