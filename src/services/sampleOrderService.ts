import { 
  collection, 
  addDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import type { Order, OrderStatus, OrderItem, CustomerInfo, Address } from '../types';

// --- Sample Data for Demo Orders ---
const sampleCustomers: CustomerInfo[] = [
  {
    id: 'cust1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    phone: '555-1234',
    avatar: '',
    joinedAt: new Date(),
    totalOrders: 5,
    totalSpent: 500,
  },
  {
    id: 'cust2',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    phone: '555-5678',
    avatar: '',
    joinedAt: new Date(),
    totalOrders: 2,
    totalSpent: 120,
  },
  {
    id: 'cust3',
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol@example.com',
    phone: '555-8765',
    avatar: '',
    joinedAt: new Date(),
    totalOrders: 8,
    totalSpent: 900,
  },
];

const sampleAddresses: Address[] = [
  {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'USA',
  },
  {
    street: '456 Oak Ave',
    city: 'Centerville',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
  },
  {
    street: '789 Pine Rd',
    city: 'Lakeview',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  },
];

const sampleProducts: Omit<OrderItem, 'quantity' | 'selectedSize' | 'selectedColor'>[] = [
  {
    id: 'prod1',
    name: 'Wireless Headphones',
    price: 199.99,
    image: 'https://via.placeholder.com/400x400?text=Headphones',
  },
  {
    id: 'prod2',
    name: 'Smart Watch Pro',
    price: 299.99,
    image: 'https://via.placeholder.com/400x400?text=Smart+Watch',
  },
  {
    id: 'prod3',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://via.placeholder.com/400x400?text=T-Shirt',
  },
];
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x400?text=Headphones'],
    stock: 50,
    rating: 4.5,
    reviewCount: 127,
    features: ['Noise Canceling', 'Bluetooth 5.0', '30-hour battery'],
    tags: ['electronics', 'audio', 'wireless'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod2',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch',
    price: 299.99,
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x400?text=Smart+Watch'],
    stock: 30,
    rating: 4.7,
    reviewCount: 89,
    features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
    tags: ['electronics', 'fitness', 'smartwatch'],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt',
    price: 29.99,
    category: 'Clothing',
    images: ['https://via.placeholder.com/400x400?text=T-Shirt'],
    stock: 100,
    rating: 4.3,
    reviewCount: 67,
    features: ['Organic Cotton', 'Pre-shrunk', 'Machine Washable'],
    tags: ['clothing', 'organic', 'casual'],
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomStatus = (): OrderStatus => {
  const statuses: OrderStatus[] = [
    'pending', 'confirmed', 'processing', 'packed', 
    'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  ];
  return getRandomElement(statuses);
};

export const createSampleOrder = async (): Promise<string> => {
  const customer = getRandomElement(sampleCustomers);
  const address = getRandomElement(sampleAddresses);
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  
  // Generate random order items
  const orderItems: OrderItem[] = [];
  const selectedProducts = [];
  
  for (let i = 0; i < numItems; i++) {
    const product = getRandomElement(sampleProducts);
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const price = product.price;
    
    orderItems.push({
      id: product.id,
      name: product.name,
      quantity,
      price,
      image: product.images?.[0],
      selectedSize: Math.random() > 0.7 ? getRandomElement(['S', 'M', 'L', 'XL']) : undefined,
      selectedColor: Math.random() > 0.7 ? getRandomElement(['Black', 'White', 'Blue', 'Red']) : undefined,
    });
    
    selectedProducts.push(product);
  }
  
  // Calculate pricing
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const discountAmount = Math.random() > 0.8 ? subtotal * 0.1 : 0; // 10% discount 20% of the time
  const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
  
  const orderData: Omit<Order, 'id'> = {
    orderNumber: generateOrderNumber(),
    userId: customer.id,
    customer,
    items: orderItems,
    
    // Pricing
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    totalAmount,
    
    // Status
    status: getRandomStatus(),
    paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending', // 80% paid
    statusHistory: [{
      status: 'pending',
      timestamp: new Date(),
      updatedBy: 'system',
      note: 'Order placed'
    }],
    
    // Addresses
    shippingAddress: address,
    billingAddress: address, // Same as shipping for simplicity
    
    // Payment and shipping
    paymentMethod: getRandomElement(['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay']),
    paymentTransactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shippingInfo: Math.random() > 0.5 ? {
      courier: getRandomElement(['FedEx', 'UPS', 'DHL', 'USPS']),
      trackingNumber: `TRK${Math.floor(Math.random() * 1000000000000)}`,
      trackingUrl: 'https://tracking.example.com',
    } : undefined,
    
    // Notes and metadata
    customerNotes: Math.random() > 0.7 ? getRandomElement([
      'Please leave at door',
      'Call before delivery',
      'Gift wrap requested',
      'Rush delivery needed'
    ]) : undefined,
    adminNotes: '',
    priority: getRandomElement(['low', 'normal', 'high', 'urgent']),
    source: getRandomElement(['website', 'mobile_app', 'phone', 'admin']),
    
    // Timestamps - random dates in the last 30 days
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
    updatedAt: new Date(),
    confirmedAt: Math.random() > 0.5 ? new Date() : undefined,
    shippedAt: Math.random() > 0.7 ? new Date() : undefined,
    deliveredAt: Math.random() > 0.9 ? new Date() : undefined,
  };
  
  try {
    // Convert dates to Firestore timestamps for storage
    const firestoreData = {
      ...orderData,
      createdAt: Timestamp.fromDate(orderData.createdAt),
      updatedAt: serverTimestamp(),
      confirmedAt: orderData.confirmedAt ? Timestamp.fromDate(orderData.confirmedAt) : null,
      shippedAt: orderData.shippedAt ? Timestamp.fromDate(orderData.shippedAt) : null,
      deliveredAt: orderData.deliveredAt ? Timestamp.fromDate(orderData.deliveredAt) : null,
      statusHistory: orderData.statusHistory.map(h => ({
        ...h,
        timestamp: Timestamp.fromDate(h.timestamp)
      }))
    };
    
    const docRef = await addDoc(collection(db, 'orders'), firestoreData);
    console.log('✅ Sample order created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating sample order:', error);
    throw error;
  }
};

export const createMultipleSampleOrders = async (count: number = 10): Promise<string[]> => {
  const orderIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const orderId = await createSampleOrder();
      orderIds.push(orderId);
      console.log(`Created sample order ${i + 1}/${count}: ${orderId}`);
      
      // Add small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to create sample order ${i + 1}:`, error);
    }
  }
  
  console.log(`✅ Created ${orderIds.length}/${count} sample orders`);
  return orderIds;
};