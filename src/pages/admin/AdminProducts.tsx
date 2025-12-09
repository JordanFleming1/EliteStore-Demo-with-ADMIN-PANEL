  // (removed duplicate useEffect at top of file)
import React, { useState, useEffect } from 'react';
import '../../styles/admin.css';
import { currencies, getCurrencySymbol } from '../../utils/currencies';
import { 
  Container, Row, Col, Card, Table, Button, Modal, 
  Form, Alert, Badge, Pagination, InputGroup,
  OverlayTrigger, Tooltip, ButtonGroup, Toast, ToastContainer,
  Nav, Tab, Spinner
} from 'react-bootstrap';
import { productService } from '../../services/productService';
import { type Product } from '../../types/index';
import { noImagePlaceholder } from '../../utils/imageUtils';

const AdminProducts: React.FC = () => {
  // ...existing code...
  // The function must return JSX, not void. Ensure the return statement is present at the end.

  // Load products on mount
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger' | 'warning'>('success');
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productNameToDelete, setProductNameToDelete] = useState<string>('');
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');

  // View details modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    shippingCost: '',
    category: '',
    stock: '',
    images: [''],
    tags: '',
    featured: false,
    specifications: [{ name: '', value: '' }],
    features: [''],
    currency: 'USD'
  });

  // Image upload states (file upload only)
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([false]);

  // Notification helper
  const showNotification = (message: string, variant: 'success' | 'danger' | 'warning') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Removed broken useEffect
  // Handle quick actions from dashboard
  useEffect(() => {
    // Check if we need to open create form
    const shouldOpenCreate = sessionStorage.getItem('openCreateForm');
    if (shouldOpenCreate === 'true') {
      setShowModal(true);
      setEditingProduct(null);
      sessionStorage.removeItem('openCreateForm');
    }

    // Check if we need to edit a specific product
    const editProductId = sessionStorage.getItem('editProductId');
    if (editProductId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editProductId);
      if (productToEdit) {
        handleShowModal(productToEdit);
        sessionStorage.removeItem('editProductId');
      }
    }

    // Check if we need to filter for low stock
    const shouldFilterLowStock = sessionStorage.getItem('filterLowStock');
    if (shouldFilterLowStock === 'true') {
      setStockFilter('low-stock');
      sessionStorage.removeItem('filterLowStock');
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const filter = urlParams.get('filter');

    if (action === 'create') {
      setShowModal(true);
      setEditingProduct(null);
    }

    if (filter === 'low-stock') {
      setStockFilter('low-stock');
    }
  }, [products]);

  // Debug effect to track form state changes
  useEffect(() => {
    console.log('=== FORM DATA CHANGED ===');
    console.log('Current form images:', formData.images);
    console.log('Image files:', imageFiles);
    console.log('Upload states:', uploadingImages);
  }, [formData.images, imageFiles, uploadingImages]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
      // Removed 'Products loaded successfully' notification per user request
    } catch (error) {
      showNotification('Failed to load products', 'danger');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || '',
        shippingCost: product.shippingCost?.toString() || '',
        category: product.category,
        stock: product.stock.toString(),
        images: product.images || [''],
        tags: product.tags?.join(', ') || '',
        featured: product.featured || false,
        specifications: product.specifications || [{ name: '', value: '' }],
        features: product.features || [''],
        currency: product.currency || 'USD'
      });
      // Set image upload states for existing product
      const imageCount = (product.images || ['']).length;
      setImageFiles(Array(imageCount).fill(null));
      setUploadingImages(Array(imageCount).fill(false));
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        shippingCost: '',
        category: '',
        stock: '',
        images: [''],
        tags: '',
        featured: false,
        specifications: [{ name: '', value: '' }],
        features: [''],
        currency: 'USD'
      });
      // Reset image upload states for new product
      setImageFiles([null]);
      setUploadingImages([false]);
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
    // Reset image upload states
    setImageFiles([null]);
    setUploadingImages([false]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Check if any images are still uploading
    const stillUploading = uploadingImages.some(uploading => uploading);
    if (stillUploading) {
      setError('Please wait for all images to finish uploading before submitting.');
      setSaving(false);
      return;
    }

    try {
      // Filter and validate images - accept both base64 data URLs and regular URLs
      const validImages = formData.images.filter((img, index) => {
        // Images can be either base64 data URLs or regular URLs
        const isValidBase64 = img && typeof img === 'string' && img.startsWith('data:image/');
        const isValidURL = img && typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'));
        const isValid = isValidBase64 || isValidURL;
        
        if (!isValid) {
          console.log(`Image at index ${index} not uploaded or invalid:`, img);
        } else {
          const preview = isValidBase64 ? 'data:image/...' : img.substring(0, 50) + '...';
          console.log(`Valid uploaded image at index ${index}:`, preview);
        }
        return isValid;
      });

      console.log('All form images:', formData.images);
      console.log('Upload states:', uploadingImages);
      console.log('Valid images after filtering:', validImages);
      console.log('Number of valid images:', validImages.length);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        ...(formData.shippingCost && !isNaN(parseFloat(formData.shippingCost)) ? { shippingCost: parseFloat(formData.shippingCost) } : {}),
        category: formData.category.trim(),
        stock: parseInt(formData.stock),
        images: validImages,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        featured: formData.featured,
        rating: editingProduct?.rating || 0,
        reviewCount: editingProduct?.reviewCount || 0,
        specifications: formData.specifications.filter(spec => spec.name.trim() && spec.value.trim()),
        features: formData.features.filter(feature => feature.trim()),
        currency: formData.currency || 'USD',
        // Only include discountPrice if it has a valid value
        ...(formData.discountPrice && !isNaN(parseFloat(formData.discountPrice)) ? { discountPrice: parseFloat(formData.discountPrice) } : {})
      };

      console.log('Form data being submitted:', productData);

      // Client-side validation
      if (!productData.name) {
        throw new Error('Product name is required');
      }
      if (!productData.description) {
        throw new Error('Product description is required');
      }
      if (!productData.category) {
        throw new Error('Product category is required');
      }
      if (isNaN(productData.price) || productData.price <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }
      if (isNaN(productData.stock) || productData.stock < 0) {
        throw new Error('Please enter a valid stock quantity');
      }
      if (productData.images.length === 0) {
        console.log('No valid images found, using placeholder image');
        // Add placeholder image if no valid images uploaded
        productData.images = [noImagePlaceholder];
      }

      // Validate that all images are valid URLs (for both uploaded and URL images)
      for (let i = 0; i < productData.images.length; i++) {
        const image = productData.images[i];
        if (!image || typeof image !== 'string') {
          throw new Error(`Image ${i + 1} is invalid. Please upload a new image or enter a valid URL.`);
        }
        // Skip validation for placeholder images (data URLs)
        if (image.startsWith('data:')) {
          continue;
        }
        // Basic URL validation for real URLs
        try {
          new URL(image);
        } catch {
          throw new Error(`Image ${i + 1} is not a valid URL. Please check the image upload or URL.`);
        }
      }

      // Validation
      if (formData.discountPrice && !isNaN(parseFloat(formData.discountPrice)) && parseFloat(formData.discountPrice) >= productData.price) {
        throw new Error('Discount price must be less than regular price');
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        setSuccess('Product updated successfully');
        showNotification('Product updated successfully!', 'success');
      } else {
        await productService.createProduct(productData);
        setSuccess('Product created successfully');
        showNotification('Product created successfully!', 'success');
      }

      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Get the actual error message
      let errorMessage = 'Failed to save product';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Add specific handling for common image-related errors
        if (errorMessage.includes('Invalid argument')) {
          errorMessage = 'There was an issue with the uploaded images. Please try re-uploading them.';
        } else if (errorMessage.includes('PERMISSION_DENIED')) {
          errorMessage = 'Permission denied. Please check your Firebase configuration.';
        } else if (errorMessage.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      }
      
      console.log('Processed error message:', errorMessage);
      setError(errorMessage);
      showNotification(errorMessage, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (productId: string, productName: string) => {
    setProductToDelete(productId);
    setProductNameToDelete(productName);
    setDeleteMode('single');
    setShowDeleteModal(true);
  };

  const handleViewDetails = (product: Product) => {
    setViewingProduct(product);
    setShowDetailsModal(true);
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedProducts.length === 0) return;
    setDeleteMode('bulk');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteMode === 'single' && productToDelete) {
        await productService.deleteProduct(productToDelete);
        showNotification('Product deleted successfully', 'success');
      } else if (deleteMode === 'bulk' && selectedProducts.length > 0) {
        const result = await productService.bulkDeleteProducts(selectedProducts);
        if (result.failed.length > 0) {
          showNotification(`${result.success.length} products deleted, ${result.failed.length} failed`, 'warning');
        } else {
          showNotification(`${result.success.length} products deleted successfully`, 'success');
        }
        setSelectedProducts([]);
      }
      
      await loadProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
      setProductNameToDelete('');
    } catch (error) {
      showNotification('Failed to delete product(s)', 'danger');
      console.error('Error deleting product(s):', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setProductNameToDelete('');
  };

  const handleBulkDelete = () => {
    handleBulkDeleteConfirm();
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(p => p.id));
    }
  };

  // Dynamic form handlers
  const handleSpecificationChange = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpecification = () => {
    setFormData({ 
      ...formData, 
      specifications: [...formData.specifications, { name: '', value: '' }]
    });
  };

  const removeSpecification = (index: number) => {
    setFormData({ 
      ...formData, 
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };


  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
    setImageFiles([...imageFiles, null]);
    setUploadingImages([...uploadingImages, false]);
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newUploading = uploadingImages.filter((_, i) => i !== index);
      
      setFormData({ ...formData, images: newImages });
      setImageFiles(newFiles);
      setUploadingImages(newUploading);
    }
  };

  // Upload image file to Firebase Storage
  const uploadImageFile = async (file: File, index: number): Promise<string> => {
    console.log('Converting image to base64 for file:', file.name, 'size:', file.size);
    
    // Show upload progress
    setUploadingImages(prev => prev.map((uploading, i) => i === index ? true : uploading));
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const result = reader.result as string;
          console.log('Image converted to base64, length:', result.length);
          resolve(result);
        };
        
        reader.onerror = () => {
          console.error('FileReader error:', reader.error);
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(file);
      });
      
      console.log('Base64 conversion successful');
      return base64;
      
    } catch (error) {
      console.error('Error converting image:', error);
      throw error;
    } finally {
      setUploadingImages(prev => prev.map((uploading, i) => i === index ? false : uploading));
    }
  };

  // Handle file selection
  const handleFileSelect = async (index: number, file: File) => {
    console.log('=== FILE SELECTION STARTED ===');
    console.log('File selected:', file.name, file.size, file.type);
    console.log('Index:', index);
    console.log('Current form images:', formData.images);
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size too large. Please choose a file under 5MB.', 'danger');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file.', 'danger');
      return;
    }

    console.log('File validation passed, starting upload...');
    setImageFiles(prev => prev.map((f, i) => i === index ? file : f));
    
    try {
      console.log('Calling uploadImageFile...');
      const downloadURL = await uploadImageFile(file, index);
      console.log('Upload completed, received URL:', downloadURL);
      
      // Use functional update to ensure we have the latest state
      setFormData(prevFormData => {
        const newImages = [...prevFormData.images];
        newImages[index] = downloadURL;
        console.log('Updated images array:', newImages);
        console.log('Previous form data images:', prevFormData.images);
        return { ...prevFormData, images: newImages };
      });
      
      showNotification('Image uploaded successfully!', 'success');
      console.log('=== FILE SELECTION COMPLETED SUCCESSFULLY ===');
    } catch (error) {
      console.error('=== FILE SELECTION FAILED ===');
      console.error('Error uploading image:', error);
      
      // Reset upload state on error
      setUploadingImages(prev => prev.map((uploading, i) => i === index ? false : uploading));
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
          errorMessage = 'Permission denied. Firebase Storage rules may be blocking uploads. Please check your Firebase configuration.';
        } else if (error.message.includes('cors') || error.message.includes('CORS') || error.message.includes('cross-origin')) {
          errorMessage = '🚨 CORS Error: Firebase Storage CORS policy needs to be configured. Please check CRITICAL-CORS-FIX.md file for step-by-step solution.';
        } else if (error.message.includes('network') || error.message.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('unauthorized') || error.message.includes('UNAUTHENTICATED')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Upload timeout. Please check your Firebase Storage configuration and try again.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      showNotification(errorMessage, 'danger');
    }
  };

  // Advanced filtering and sorting
  const getFilteredAndSortedProducts = () => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.stock > 10) ||
        (stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
        (stockFilter === 'out-of-stock' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = a.createdAt?.getTime() || 0;
        bValue = b.createdAt?.getTime() || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Get unique categories for filter
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="admin-main-content">
      <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Product Management</h2>
              <p className="text-muted mb-0">Manage your product inventory with advanced controls</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={() => handleShowModal()}
                size="lg"
              >
                <i className="fas fa-plus me-2"></i>
                Add New Product
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{products.length}</h3>
                  <small>Total Products</small>
                </div>
                <i className="fas fa-boxes fa-2x opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{products.filter(p => p.stock > 10).length}</h3>
                  <small>In Stock</small>
                </div>
                <i className="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-warning text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</h3>
                  <small>Low Stock</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm bg-danger text-white">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-0">{products.filter(p => p.stock === 0).length}</h3>
                  <small>Out of Stock</small>
                </div>
                <i className="fas fa-times-circle fa-2x opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Advanced Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-bold">Search Products</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, category, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <Form.Label className="fw-bold">Category</Form.Label>
              <Form.Select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="fw-bold">Stock Status</Form.Label>
              <Form.Select 
                value={stockFilter} 
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')}
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="fw-bold">Sort By</Form.Label>
              <Form.Select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'price' | 'stock' | 'createdAt');
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="stock-asc">Stock Low-High</option>
                <option value="stock-desc">Stock High-Low</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Label className="fw-bold">Items per page</Form.Label>
              <Form.Select 
                value={productsPerPage.toString()} 
                onChange={(e) => {
                  setProductsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Results Summary */}
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                {searchTerm && ` (filtered from ${products.length} total)`}
              </span>
              
              {selectedProducts.length > 0 && (
                <div className="d-flex gap-2 align-items-center">
                  <span className="text-muted">{selectedProducts.length} selected</span>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <div className="h5">Loading products...</div>
              <div className="text-muted">Please wait while we fetch your products</div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <div className="h5">No products found</div>
              <div className="text-muted mb-3">
                {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by adding your first product'
                }
              </div>
              {!searchTerm && categoryFilter === 'all' && stockFilter === 'all' && (
                <Button variant="primary" onClick={() => handleShowModal()}>
                  <i className="fas fa-plus me-2"></i>
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="py-3">
                        <Form.Check
                          type="checkbox"
                          checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="py-3">Product</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Stock</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Featured</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      <tr key={product.id} className={selectedProducts.includes(product.id) ? 'table-active' : ''}>
                        <td className="py-3">
                          <Form.Check
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={product.images?.[0] || noImagePlaceholder}
                              alt={product.name}
                              className="rounded me-3"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold mb-1">{product.name}</div>
                              <small className="text-muted">{product.category}</small>
                              {product.tags && product.tags.length > 0 && (
                                <div className="mt-1">
                                  {product.tags.slice(0, 2).map((tag: string, index: number) => (
                                    <Badge key={index} bg="light" text="dark" className="me-1 small">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <Badge bg="light" text="dark" className="small">
                                      +{product.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold">
                            {product.discountPrice ? (
                              <div>
                                <span className="text-primary fs-6">
                                  {getCurrencySymbol(product.currency || '')}{product.discountPrice}
                                </span>
                                <div className="text-muted text-decoration-line-through small">
                                  {getCurrencySymbol(product.currency || '')}{product.price}
                                </div>
                                <small className="text-success">
                                  {Math.round((1 - product.discountPrice / product.price) * 100)}% off
                                </small>
                              </div>
                            ) : (
                              <span className="fs-6">
                                {getCurrencySymbol(product.currency || '')}{product.price}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <Badge bg={getStockBadgeVariant(product.stock)} className="me-2">
                              {product.stock} units
                            </Badge>
                            {product.stock <= 10 && product.stock > 0 && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Low stock alert</Tooltip>}
                              >
                                <i className="fas fa-exclamation-triangle text-warning"></i>
                              </OverlayTrigger>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                            {getStockStatusText(product.stock)}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {product.featured ? (
                            <Badge bg="warning" text="dark">
                              <i className="fas fa-star me-1"></i>
                              Featured
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <ButtonGroup size="sm">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>View Details</Tooltip>}
                            >
                              <Button 
                                variant="outline-info"
                                onClick={() => handleViewDetails(product)}
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                            </OverlayTrigger>
                            
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Edit Product</Tooltip>}
                            >
                              <Button
                                variant="outline-primary"
                                onClick={() => handleShowModal(product)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                            </OverlayTrigger>
                            
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete Product</Tooltip>}
                            >
                              <Button
                                variant="outline-danger"
                                onClick={() => handleDelete(product.id, product.name)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </OverlayTrigger>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div className="text-muted">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    
                    {/* Smart pagination - show relevant page numbers */}
                    {(() => {
                      const delta = 2;
                      const range = [];
                      const rangeWithDots = [];

                      for (let i = Math.max(2, currentPage - delta);
                           i <= Math.min(totalPages - 1, currentPage + delta);
                           i++) {
                        range.push(i);
                      }

                      if (currentPage - delta > 2) {
                        rangeWithDots.push(1, '...');
                      } else {
                        rangeWithDots.push(1);
                      }

                      rangeWithDots.push(...range);

                      if (currentPage + delta < totalPages - 1) {
                        rangeWithDots.push('...', totalPages);
                      } else if (totalPages > 1) {
                        rangeWithDots.push(totalPages);
                      }

                      return rangeWithDots.map((pageNum, index) => {
                        if (pageNum === '...') {
                          return <Pagination.Ellipsis key={index} />;
                        }
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => setCurrentPage(pageNum as number)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      });
                    })()}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Enhanced Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className={`fas ${editingProduct ? 'fa-edit' : 'fa-plus'} me-2`}></i>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {saving && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 1050 }}>
              <div className="text-center">
                <Spinner animation="border" variant="primary" className="mb-2" />
                <div>Saving product...</div>
              </div>
            </div>
          )}
          
          {/* Error and Success Messages inside Modal */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
              <Alert.Heading>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Error
              </Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-3">
              <Alert.Heading>
                <i className="fas fa-check-circle me-2"></i>
                Success
              </Alert.Heading>
              <p className="mb-0">{success}</p>
            </Alert>
          )}
          
          <Tab.Container defaultActiveKey="basic" id="product-form-tabs">
            <Nav variant="pills" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="basic">
                  <i className="fas fa-info-circle me-2"></i>
                  Basic Information
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="details">
                  <i className="fas fa-list-alt me-2"></i>
                  Details & Features
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="media">
                  <i className="fas fa-images me-2"></i>
                  Media & Images
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pricing">
                  <i className="fas fa-dollar-sign me-2"></i>
                  Pricing & Inventory
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit}>
              <Tab.Content>
                {/* Basic Information Tab */}
                <Tab.Pane eventKey="basic">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Product Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter product name"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Category <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Enter product category (e.g., Electronics, Fashion, Books, Home Decor)"
                          required
                        />
                        <Form.Text className="text-muted">
                          <i className="fas fa-lightbulb me-1"></i>
                          Create a specific category for this product. 
                          {uniqueCategories.length > 0 && (
                            <>
                              <br />
                              <strong>Existing categories:</strong> {uniqueCategories.slice(0, 5).join(', ')}
                              {uniqueCategories.length > 5 && `... and ${uniqueCategories.length - 5} more`}
                            </>
                          )}
                          <br />
                          <strong>Examples:</strong> "Gaming Laptops", "Designer Handbags", "Kitchen Appliances", "Fitness Equipment"
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tags</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="smartphone, electronics, apple (comma separated)"
                        />
                        <Form.Text className="text-muted">
                          Separate tags with commas to improve searchability
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Product Description <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product in detail..."
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Feature this product (will appear in featured sections)"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                  </Form.Group>
                </Tab.Pane>

                {/* Details & Features Tab */}
                <Tab.Pane eventKey="details">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-cogs me-2"></i>
                    Product Specifications
                  </h5>
                  {formData.specifications.map((spec, index) => (
                    <Row key={index} className="mb-3">
                      <Col md={4}>
                        <Form.Control
                          type="text"
                          value={spec.name}
                          onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                          placeholder="Specification name (e.g., Screen Size)"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                          placeholder="Specification value (e.g., 6.1 inches)"
                        />
                      </Col>
                      <Col md={2}>
                        <Button
                          variant="outline-danger"
                          onClick={() => removeSpecification(index)}
                          disabled={formData.specifications.length === 1}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    variant="outline-primary"
                    onClick={addSpecification}
                    className="mb-4"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Specification
                  </Button>
                </Tab.Pane>

                {/* Media & Images Tab */}
                <Tab.Pane eventKey="media">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-images me-2"></i>
                    Product Images
                  </h5>
                  {formData.images.map((image: string, index: number) => (
                    <div key={index} className="mb-3 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center mb-2">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          className="me-2"
                          disabled={uploadingImages[index]}
                          onChange={e => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleFileSelect(index, file);
                            }
                          }}
                        />
                        {uploadingImages[index] && (
                          <Spinner animation="border" size="sm" className="me-2" />
                        )}
                        {formData.images.length > 1 && (
                          <Button
                            variant="outline-danger"
                            onClick={() => removeImageField(index)}
                            disabled={uploadingImages[index]}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        )}
                      </div>
                      <div className="mt-2">
                        <img
                          src={image || noImagePlaceholder}
                          alt={image ? `Preview ${index + 1}` : "No Image Placeholder"}
                          className="rounded border"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <p className={`small mt-1 ${image ? "text-success" : "text-muted"}`}>
                          <i className={`fas ${image ? "fa-check" : "fa-info-circle"} me-1`}></i>
                          {image ? "Image uploaded successfully" : "Preview: No Image Yet... placeholder"}
                        </p>
                      </div>
                      {uploadingImages[index] && (
                        <p className="text-info small mt-2">
                          <i className="fas fa-cloud-upload-alt me-1"></i>
                          Uploading image...
                        </p>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline-secondary"
                    onClick={addImageField}
                    className="mt-2"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Another Image
                  </Button>
                </Tab.Pane>
                  </Form.Group>
                </Tab.Pane>

                {/* Details & Features Tab */}
                <Tab.Pane eventKey="details">
                  <div className="mb-4">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                              Product Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Enter product name"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                              Category <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              placeholder="Enter product category (e.g., Electronics, Fashion, Books, Home Decor)"
                              required
                            />
                            <Form.Text className="text-muted">
                              <i className="fas fa-lightbulb me-1"></i>
                              Create a specific category for this product. 
                              {uniqueCategories.length > 0 && (
                                <>
                                  <br />
                                  <strong>Existing categories:</strong> {uniqueCategories.slice(0, 5).join(', ')}
                                  {uniqueCategories.length > 5 && `... and ${uniqueCategories.length - 5} more`}
                                </>
                              )}
                              <br />
                              <strong>Examples:</strong> "Gaming Laptops", "Designer Handbags", "Kitchen Appliances", "Fitness Equipment"
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tags</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.tags}
                              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                              placeholder="smartphone, electronics, apple (comma separated)"
                            />
                            <Form.Text className="text-muted">
                              Separate tags with commas to improve searchability
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Price ($)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Shipping Cost ($)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.shippingCost}
                              onChange={e => setFormData({ ...formData, shippingCost: e.target.value })}
                              placeholder="Set shipping cost for this product"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Product Description <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your product in detail..."
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Feature this product (will appear in featured sections)"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                      </Form.Group>

                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-cogs me-2"></i>
                        Product Specifications
                      </h5>
                      {formData.specifications.map((spec, index) => (
                        <Row key={index} className="mb-3">
                          <Col md={4}>
                            <Form.Control
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                              placeholder="Specification name (e.g., Screen Size)"
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                              placeholder="Specification value (e.g., 6.1 inches)"
                            />
                          </Col>
                          <Col md={2}>
                            <Button
                              variant="outline-danger"
                              onClick={() => removeSpecification(index)}
                              disabled={formData.specifications.length === 1}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Button
                        variant="outline-primary"
                        onClick={addSpecification}
                        className="mb-4"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Specification
                      </Button>
                    <>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-images me-2"></i>
                        Product Images
                      </h5>
                      {formData.images.map((image: string, index: number) => {
                        return (
                          <div key={index} className="mb-3 p-2 border rounded bg-light">
                            <div className="d-flex align-items-center mb-2">
                              <Form.Control
                                type="file"
                                accept="image/*"
                                className="me-2"
                                disabled={uploadingImages[index]}
                                onChange={e => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    handleFileSelect(index, file);
                                  }
                                }}
                              />
                              {uploadingImages[index] && (
                                <Spinner animation="border" size="sm" className="me-2" />
                              )}
                              {formData.images.length > 1 && (
                                <Button
                                  variant="outline-danger"
                                  onClick={() => removeImageField(index)}
                                  disabled={uploadingImages[index]}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              )}
                            </div>
                            <div className="mt-2">
                              <img
                                src={image || noImagePlaceholder}
                                alt={image ? `Preview ${index + 1}` : "No Image Placeholder"}
                                className="rounded border"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                              <p className={`small mt-1 ${image ? "text-success" : "text-muted"}`}>
                                <i className={`fas ${image ? "fa-check" : "fa-info-circle"} me-1`}></i>
                                {image ? "Image uploaded successfully" : "Preview: No Image Yet... placeholder"}
                              </p>
                            </div>
                            {uploadingImages[index] && (
                              <p className="text-info small mt-2">
                                <i className="fas fa-cloud-upload-alt me-1"></i>
                                Uploading image...
                              </p>
                            )}
                          </div>
                        );
                      })}
                      <Button
                        variant="outline-secondary"
                        onClick={addImageField}
                        className="mt-2"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Another Image
                      </Button>
                    </>
                  </div>
                  </Tab.Pane>

                {/* Pricing & Inventory Tab */}
                <Tab.Pane eventKey="pricing">
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Currency <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          value={formData.currency}
                          onChange={e => setFormData({ ...formData, currency: e.target.value })}
                          required
                        >
                          {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} - {c.name} ({c.symbol})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Regular Price <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>{getCurrencySymbol(formData.currency)}</InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            required
                            min="0"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Discount Price</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>{getCurrencySymbol(formData.currency)}</InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={formData.discountPrice}
                            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                            placeholder="0.00"
                            min="0"
                          />
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Leave empty if no discount applies
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Stock Quantity <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                          required
                          min="0"
                        />
                        <Form.Text className="text-muted">
                          Current available inventory
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <div className="h-100 d-flex align-items-center">
                        {formData.price && formData.discountPrice && (
                          <Alert variant="info" className="w-100">
                            <i className="fas fa-percentage me-2"></i>
                            Discount: {Math.round((1 - parseFloat(formData.discountPrice) / parseFloat(formData.price)) * 100)}% off
                          </Alert>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Form>
          </Tab.Container>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>
            <i className="fas fa-times me-2"></i>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={saving || !formData.name || !formData.price || !formData.category}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className={`fas ${editingProduct ? 'fa-save' : 'fa-plus'} me-2`}></i>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={5000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <i className={`fas ${
              toastVariant === 'success' ? 'fa-check-circle' : 
              toastVariant === 'danger' ? 'fa-times-circle' : 
              'fa-exclamation-triangle'
            } me-2`}></i>
            <strong className="me-auto">
              {toastVariant === 'success' ? 'Success' : 
               toastVariant === 'danger' ? 'Error' : 'Warning'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Product Details Modal */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            Product Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingProduct && (
            <div>
              {/* Product Images */}
              {viewingProduct.images && viewingProduct.images.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Product Images</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {viewingProduct.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img || noImagePlaceholder}
                        alt={`${viewingProduct.name} - ${idx + 1}`}
                        className="rounded border"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">{viewingProduct.name}</h5>
                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Category:</strong>{' '}
                      <Badge bg="secondary">{viewingProduct.category}</Badge>
                    </p>
                    <p className="mb-2">
                      <strong>Price:</strong>{' '}
                      <span className="text-success fw-bold">
                        {getCurrencySymbol(viewingProduct.currency || '')}{viewingProduct.price}
                      </span>
                    </p>
                    {viewingProduct.discountPrice && (
                      <p className="mb-2">
                        <strong>Discount Price:</strong>{' '}
                        <span className="text-primary fw-bold">
                          {getCurrencySymbol(viewingProduct.currency || '')}{viewingProduct.discountPrice}
                        </span>
                        <Badge bg="success" className="ms-2">
                          {Math.round((1 - viewingProduct.discountPrice / viewingProduct.price) * 100)}% OFF
                        </Badge>
                      </p>
                    )}
                  </Col>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Stock:</strong>{' '}
                      <Badge bg={viewingProduct.stock > 10 ? 'success' : viewingProduct.stock > 0 ? 'warning' : 'danger'}>
                        {viewingProduct.stock} units
                      </Badge>
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <Badge bg={viewingProduct.stock > 0 ? 'success' : 'danger'}>
                        {viewingProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </p>
                    <p className="mb-2">
                      <strong>Featured:</strong>{' '}
                      {viewingProduct.featured ? (
                        <Badge bg="warning" text="dark">
                          <i className="fas fa-star me-1"></i>Featured
                        </Badge>
                      ) : (
                        <span className="text-muted">No</span>
                      )}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Description */}
              {viewingProduct.description && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Description</h6>
                  <p className="text-secondary">{viewingProduct.description}</p>
                </div>
              )}

              {/* Tags */}
              {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Tags</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {viewingProduct.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} bg="light" text="dark" className="px-3 py-2">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {viewingProduct.specifications && viewingProduct.specifications.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Specifications</h6>
                  <Table bordered size="sm">
                    <tbody>
                      {viewingProduct.specifications.map((spec: { name: string; value: string }, idx: number) => (
                        <tr key={idx}>
                          <td className="fw-bold" style={{ width: '40%' }}>{spec.name}</td>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Features */}
              {viewingProduct.features && viewingProduct.features.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">Features</h6>
                  <ul className="mb-0">
                    {viewingProduct.features.map((feature: string, idx: number) => (
                      <li key={idx} className="mb-1">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product ID and Dates */}
              <div className="mt-4 pt-3 border-top">
                <Row className="text-muted small">
                  <Col md={6}>
                    <p className="mb-1"><strong>Product ID:</strong> {viewingProduct.id}</p>
                  </Col>
                  <Col md={6}>
                    {viewingProduct.createdAt && (
                      <p className="mb-1">
                        <strong>Created:</strong> {new Date(viewingProduct.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            <i className="fas fa-times me-2"></i>
            Close
          </Button>
          {viewingProduct && (
            <>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowDetailsModal(false);
                  handleShowModal(viewingProduct);
                }}
              >
                <i className="fas fa-edit me-2"></i>
                Edit Product
              </Button>
              <a
                href={`/product/${viewingProduct.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success ms-2"
              >
                <i className="fas fa-eye me-2"></i>
                View Product (Order)
              </a>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-trash fa-3x text-danger mb-3"></i>
            <h5 className="mb-3">
              {deleteMode === 'single' 
                ? 'Delete Product?' 
                : `Delete ${selectedProducts.length} Products?`
              }
            </h5>
            {deleteMode === 'single' ? (
              <p className="text-muted">
                Are you sure you want to delete <strong>"{productNameToDelete}"</strong>? 
                This action cannot be undone.
              </p>
            ) : (
              <p className="text-muted">
                Are you sure you want to delete <strong>{selectedProducts.length} selected products</strong>? 
                This action cannot be undone.
              </p>
            )}
            <div className="alert alert-warning mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Warning:</strong> This will permanently remove the product(s) and all associated data.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            <i className="fas fa-times me-2"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <i className="fas fa-trash me-2"></i>
            {deleteMode === 'single' ? 'Delete Product' : `Delete ${selectedProducts.length} Products`}
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
}
export default AdminProducts;