export type { OrderItem };
export * from './api-types';
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  salePrice?: number; // Added this for admin interface
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications?: { name: string; value: string }[]; // Added for admin interface
  tags: string[];
  featured?: boolean; // Added this for admin interface
  createdAt: Date;
  updatedAt: Date;
  currency?: string; // Added for per-product currency
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  addresses: Address[];
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';

export interface OrderItem {
  id: string; // Product ID
  name: string; // Product name
  price: number; // Price at time of order
  quantity: number;
  image?: string; // Product image
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy: string; // Admin ID who updated the status
}

export interface ShippingInfo {
  courier: string;
  trackingNumber: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingUrl?: string;
}

export interface CustomerInfo {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Human-readable order number like ORD-2024-001
  userId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  
  // Pricing breakdown
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Status and tracking
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusHistory: OrderStatusHistory[];
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Payment and shipping
  paymentMethod: string;
  paymentTransactionId?: string;
  shippingInfo?: ShippingInfo;
  
  // Notes and metadata
  customerNotes?: string;
  adminNotes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: 'website' | 'mobile_app' | 'phone' | 'admin'; // Where the order came from
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}