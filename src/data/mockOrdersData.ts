// All mock data removed. No customers, addresses, or products are preloaded.
  {
    id: 'prod_001',
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-canceling headphones with premium sound',
    price: 199.99,
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x400/007bff/ffffff?text=Headphones'],
    stock: 50,
    rating: 4.5,
    reviewCount: 127,
    features: ['Noise Canceling', 'Bluetooth 5.0', '30-hour battery'],
    tags: ['electronics', 'audio', 'wireless'],
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'prod_002',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with health monitoring',
    price: 299.99,
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x400/28a745/ffffff?text=Smart+Watch'],
    stock: 30,
    rating: 4.7,
    reviewCount: 89,
    features: ['Heart Rate Monitor', 'GPS', 'Water Resistant', 'Sleep Tracking'],
    tags: ['electronics', 'fitness', 'smartwatch'],
    featured: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: 'prod_003',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt in multiple colors',
    price: 29.99,
    category: 'Clothing',
    images: ['https://via.placeholder.com/400x400/ffc107/ffffff?text=T-Shirt'],
    stock: 100,
    rating: 4.3,
    reviewCount: 67,
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Machine Washable'],
    tags: ['clothing', 'organic', 'casual'],
    featured: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    id: 'prod_004',
    name: 'Professional Coffee Maker',
    description: 'Premium coffee maker with programmable features',
    price: 149.99,
    category: 'Home & Kitchen',
    images: ['https://via.placeholder.com/400x400/dc3545/ffffff?text=Coffee+Maker'],
    stock: 25,
    rating: 4.6,
    reviewCount: 203,
    features: ['Programmable', 'Auto-shutoff', '12-cup capacity'],
    tags: ['kitchen', 'appliances', 'coffee'],
    featured: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date()
  },
  {
    id: 'prod_005',
    name: 'Wireless Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting',
    price: 79.99,
    category: 'Electronics',
    images: ['https://via.placeholder.com/400x400/6610f2/ffffff?text=Gaming+Mouse'],
    stock: 75,
    rating: 4.4,
    reviewCount: 156,
    features: ['RGB Lighting', 'High DPI', 'Wireless', 'Programmable Buttons'],
    tags: ['gaming', 'electronics', 'mouse'],
    featured: false,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date()
  }
];

// Generate random order data
const generateOrderNumber = (): string => {
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

const generateRandomDate = (daysAgo: number = 30): Date => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  return new Date(
    now.getTime() - 
    (randomDays * 24 * 60 * 60 * 1000) - 
    (randomHours * 60 * 60 * 1000) - 
    (randomMinutes * 60 * 1000)
  );
};

// Generate a single mock order
const generateMockOrder = (id: string): Order => {
  const customer = getRandomElement(mockCustomers);
  const address = getRandomElement(mockAddresses);
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  
  // Generate random order items
  const orderItems: OrderItem[] = [];
  const selectedProducts = [];
  
  for (let i = 0; i < numItems; i++) {
    const product = getRandomElement(mockProducts);
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const price = product.price;
    const subtotal = price * quantity;
    
    orderItems.push({
      productId: product.id,
      product,
      quantity,
      price,
      subtotal,
      selectedSize: Math.random() > 0.7 ? getRandomElement(['S', 'M', 'L', 'XL']) : undefined,
      selectedColor: Math.random() > 0.7 ? getRandomElement(['Black', 'White', 'Blue', 'Red', 'Gray']) : undefined,
    });
    
    selectedProducts.push(product);
  }
  
  // Calculate pricing
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const discountAmount = Math.random() > 0.8 ? subtotal * 0.1 : 0; // 10% discount 20% of the time
  const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
  
  const status = getRandomStatus();
  const createdDate = generateRandomDate();
  
  return {
    id,
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
    status,
    paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending', // 80% paid
    statusHistory: [
      {
        status: 'pending',
        timestamp: createdDate,
        updatedBy: 'system',
        note: 'Order placed'
      },
      ...(status !== 'pending' ? [{
        status: status,
        timestamp: new Date(createdDate.getTime() + Math.random() * 86400000), // Within 24 hours
        updatedBy: 'admin',
        note: `Order ${status}`
      }] : [])
    ],
    
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
      'Rush delivery needed',
      'Fragile - handle with care'
    ]) : undefined,
    adminNotes: Math.random() > 0.8 ? getRandomElement([
      'Customer called about delivery',
      'Special packaging requested',
      'VIP customer',
      'Address verified'
    ]) : '',
    priority: getRandomElement(['low', 'normal', 'high', 'urgent']),
    source: getRandomElement(['website', 'mobile_app', 'phone', 'admin']),
    
    // Timestamps
    createdAt: createdDate,
    updatedAt: new Date(),
    confirmedAt: Math.random() > 0.5 ? new Date(createdDate.getTime() + 3600000) : undefined, // 1 hour later
    shippedAt: status === 'shipped' || status === 'delivered' ? new Date(createdDate.getTime() + 86400000) : undefined, // 1 day later
    deliveredAt: status === 'delivered' ? new Date(createdDate.getTime() + 172800000) : undefined, // 2 days later
  };
};

// Generate multiple mock orders
export const generateMockOrders = (count: number = 25): Order[] => {
  const orders: Order[] = [];
  
  for (let i = 1; i <= count; i++) {
    const orderId = `order_${i.toString().padStart(3, '0')}`;
    orders.push(generateMockOrder(orderId));
  }
  
  // Sort by creation date (newest first)
  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Export mock data
export { mockCustomers, mockAddresses, mockProducts };