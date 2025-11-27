// Utility to get currency symbol from code
const getCurrencySymbol = (currency?: string) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CAD': return 'C$';
    default: return '$';
  }
};
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types/index';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart, isInCart } = useCart();
  const { currentUser } = useAuth();

  const handleAddToCart = () => {
    if (!currentUser) {
      window.alert('Please log in to add to cart.');
      window.location.href = '/login';
      return;
    }
    addToCart(product);
  };

  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <Card className={`h-100 product-card border-0 shadow-sm ${className}`} style={{ touchAction: 'manipulation' }}>
      <div className="position-relative" style={{ cursor: 'pointer' }}>
        <Link to={`/product/${product.id}`} style={{ display: 'block' }}>
          <Card.Img 
            variant="top" 
            src={product.images?.[0] || '/api/placeholder/300/250'}
            style={{ height: '250px', objectFit: 'cover', touchAction: 'manipulation' }}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="position-absolute top-0 start-0 m-2">
          {product.discountPrice && (
            <Badge bg="danger" className="me-1">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Badge bg="warning" text="dark">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge bg="secondary">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="position-absolute top-0 end-0 m-2">
          <Button 
            variant="light" 
            size="sm" 
            className="rounded-circle"
            style={{ width: '44px', height: '44px', padding: '0', minWidth: '44px', minHeight: '44px' }}
            title="Add to wishlist"
            aria-label="Add to wishlist"
          >
            <i className="fas fa-heart text-muted"></i>
          </Button>
        </div>

        {/* Quick Actions Overlay */}
        <div className="product-overlay position-absolute top-0 start-0 w-100 h-100 d-none d-md-flex align-items-center justify-content-center">
          <div className="d-flex gap-2 opacity-0 product-actions">
            <Link 
              to={`/product/${product.id}`} 
              className="btn btn-light btn-sm"
              title="Quick view"
              aria-label="Quick view product"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <i className="fas fa-eye"></i>
            </Link>
            {product.stock > 0 && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleAddToCart}
                disabled={isInCart(product.id)}
                title={isInCart(product.id) ? 'Already in cart' : 'Add to cart'}
                aria-label={isInCart(product.id) ? 'Already in cart' : 'Add to cart'}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <i className={isInCart(product.id) ? 'fas fa-check' : 'fas fa-shopping-cart'}></i>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <small className="text-muted text-uppercase">{product.category}</small>
        </div>
        
        <Card.Title className="h6 mb-2">
          <Link 
            to={`/product/${product.id}`} 
            className="text-decoration-none text-dark"
            title={product.name}
          >
            {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
          </Link>
        </Card.Title>

        {/* Rating */}
        <div className="d-flex align-items-center mb-2">
          <div className="me-2">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-warning' : 'text-muted'}`}
                style={{ fontSize: '0.8rem' }}
              ></i>
            ))}
          </div>
          <small className="text-muted">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </small>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              {product.discountPrice ? (
                <div className="d-flex flex-column">
                  <span className="fw-bold text-primary fs-5">
                    {getCurrencySymbol(product.currency)}{product.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-muted text-decoration-line-through small">
                    {getCurrencySymbol(product.currency)}{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="fw-bold text-primary fs-5">
                  {getCurrencySymbol(product.currency)}{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart Button (Mobile) */}
            <div className="d-block d-md-none">
              {product.stock > 0 ? (
                <Button
                  variant={isInCart(product.id) ? 'success' : 'outline-primary'}
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isInCart(product.id)}
                  style={{ minWidth: '48px', minHeight: '44px', fontSize: '14px', padding: '10px 16px' }}
                  aria-label={isInCart(product.id) ? 'Product added to cart' : 'Add product to cart'}
                >
                  {isInCart(product.id) ? (
                    <>
                      <i className="fas fa-check me-1"></i>
                      Added
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-1"></i>
                      Add
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled style={{ minHeight: '44px', padding: '10px 16px' }}>
                  Out of Stock
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Features (if available) */}
        {product.features && product.features.length > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              {product.features.slice(0, 2).map((feature, index) => (
                <span key={index} className="me-2">
                  <i className="fas fa-check text-success me-1"></i>
                  {feature}
                </span>
              ))}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;