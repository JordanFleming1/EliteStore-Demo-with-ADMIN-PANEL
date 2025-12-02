import type { Order, OrderStatus, OrderStatusHistory } from '../types/index';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

import { useToast } from '../hooks/useToast';
import { generateMockOrders } from '../data/mockOrdersData';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Order management functions
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addAdminNote: (orderId: string, note: string) => Promise<void>;
  updateShippingInfo: (orderId: string, shippingInfo: Partial<Order['shippingInfo']>) => Promise<void>;
  bulkUpdateStatus: (orderIds: string[], status: OrderStatus) => Promise<void>;
  
  // Filtering and search
  filterOrders: (status?: OrderStatus, searchTerm?: string, dateRange?: { start: Date; end: Date }) => Order[];
  getOrderStats: () => {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    revenue: number;
  };
  
  // Real-time updates (mock)
  subscribeToOrders: () => () => void;
}

const MockOrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'ecommerce_mock_orders';

const MockOrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Load orders from localStorage or generate mock data
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📦 Loading orders from mock data...');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to load from localStorage first
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      
      let ordersData: Order[] = [];
      
      if (savedOrders) {
        // Parse saved orders and convert date strings back to Date objects
        const parsedOrders = JSON.parse(savedOrders) as Partial<Order>[];
        ordersData = parsedOrders.map((order) => {
          const statusHistory = Array.isArray(order.statusHistory)
            ? (order.statusHistory as Array<Partial<OrderStatusHistory>>).map((h) => ({
                ...h,
                timestamp: h.timestamp ? new Date(h.timestamp as string) : undefined
              }))
            : [];
          return {
            ...order,
            createdAt: order.createdAt ? new Date(order.createdAt as string) : undefined,
            updatedAt: order.updatedAt ? new Date(order.updatedAt as string) : undefined,
            confirmedAt: order.confirmedAt ? new Date(order.confirmedAt as string) : undefined,
            shippedAt: order.shippedAt ? new Date(order.shippedAt as string) : undefined,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt as string) : undefined,
            statusHistory: statusHistory
          } as Order;
        });
        console.log('📁 Loaded orders from localStorage:', ordersData.length);
      } else {
        // Generate fresh mock data
        ordersData = generateMockOrders(25);
        // Convert all Date fields to ISO strings for storage
        const serializableOrders = ordersData.map((order) => ({
          ...order,
          createdAt: order.createdAt ? order.createdAt.toISOString() : undefined,
          updatedAt: order.updatedAt ? order.updatedAt.toISOString() : undefined,
          confirmedAt: order.confirmedAt ? order.confirmedAt.toISOString() : undefined,
          shippedAt: order.shippedAt ? order.shippedAt.toISOString() : undefined,
          deliveredAt: order.deliveredAt ? order.deliveredAt.toISOString() : undefined,
          statusHistory: order.statusHistory?.map((h) => ({
            ...h,
            timestamp: h.timestamp ? h.timestamp.toISOString() : undefined
          })) || []
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableOrders));
        console.log('🎲 Generated new mock orders:', ordersData.length);
      }
      
      setOrders(ordersData);
      // showToast('success', 'Orders Loaded', `Successfully loaded ${ordersData.length} orders (using mock data)`);
      
    } catch (err) {
      console.error('❌ Error loading orders:', err);
      setError('Failed to load orders');
      showToast('error', 'Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Save orders to localStorage
  const saveOrders = useCallback((updatedOrders: Order[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
      console.log('💾 Orders saved to localStorage');
    } catch (error) {
      console.error('Failed to save orders:', error);
    }
  }, []);

  // Update order status with history tracking
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.id === orderId) {
            const newStatusEntry: OrderStatusHistory = {
              status,
              timestamp: new Date(),
              note,
              updatedBy: 'admin'
            };

            const updatedOrder = {
              ...order,
              status,
              statusHistory: [...(order.statusHistory || []), newStatusEntry],
              updatedAt: new Date(),
              // Add specific timestamps based on status
              ...(status === 'confirmed' && { confirmedAt: new Date() }),
              ...(status === 'shipped' && { shippedAt: new Date() }),
              ...(status === 'delivered' && { deliveredAt: new Date() }),
            };

            return updatedOrder;
          }
          return order;
        });
        
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      showToast('success', 'Success', `Order status updated to ${status}`);
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      showToast('error', 'Error', 'Failed to update order status');
    }
  }, [showToast, saveOrders]);

  // Update order with partial data
  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, ...updates, updatedAt: new Date() }
            : order
        );
        
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      showToast('success', 'Success', 'Order updated successfully');
    } catch (err) {
      console.error('❌ Error updating order:', err);
      showToast('error', 'Error', 'Failed to update order');
    }
  }, [showToast, saveOrders]);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.filter(order => order.id !== orderId);
        saveOrders(updatedOrders);
        return updatedOrders;
      });
      
      showToast('success', 'Success', 'Order deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting order:', err);
      showToast('error', 'Error', 'Failed to delete order');
    }
  }, [showToast, saveOrders]);

  // Add admin note to order
  const addAdminNote = useCallback(async (orderId: string, note: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, adminNotes: note, updatedAt: new Date() }
            : order
        );
        
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      showToast('success', 'Success', 'Admin note added');
    } catch (err) {
      console.error('❌ Error adding admin note:', err);
      showToast('error', 'Error', 'Failed to add admin note');
    }
  }, [showToast, saveOrders]);

  // Update shipping information
  const updateShippingInfo = useCallback(async (orderId: string, shippingInfo: Partial<Order['shippingInfo']>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.id === orderId) {
            const updatedShippingInfo = {
              courier: '',
              trackingNumber: '',
              ...order.shippingInfo,
              ...shippingInfo
            };

            return {
              ...order,
              shippingInfo: updatedShippingInfo,
              updatedAt: new Date()
            };
          }
          return order;
        });
        
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      showToast('success', 'Success', 'Shipping info updated');
    } catch (err) {
      console.error('❌ Error updating shipping info:', err);
      showToast('error', 'Error', 'Failed to update shipping info');
    }
  }, [showToast, saveOrders]);

  // Bulk update order status
  const bulkUpdateStatus = useCallback(async (orderIds: string[], status: OrderStatus) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (orderIds.includes(order.id)) {
            return {
              ...order,
              status,
              updatedAt: new Date(),
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  status,
                  timestamp: new Date(),
                  updatedBy: 'admin',
                  note: `Bulk update to ${status}`
                }
              ]
            };
          }
          return order;
        });
        
        saveOrders(updatedOrders);
        return updatedOrders;
      });

      showToast('success', 'Success', `${orderIds.length} orders updated to ${status}`);
    } catch (err) {
      console.error('❌ Error bulk updating orders:', err);
      showToast('error', 'Error', 'Failed to update orders');
    }
  }, [showToast, saveOrders]);

  // Filter orders by various criteria
  const filterOrders = useCallback((status?: OrderStatus, searchTerm?: string, dateRange?: { start: Date; end: Date }) => {
    return orders.filter(order => {
      // Filter by status
      if (status && order.status !== status) return false;
      
      // Filter by search term (order number, customer name, email)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !order.orderNumber.toLowerCase().includes(search) &&
          !order.customer.displayName.toLowerCase().includes(search) &&
          !order.customer.email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      
      // Filter by date range
      if (dateRange) {
        const orderDate = order.createdAt;
        if (orderDate < dateRange.start || orderDate > dateRange.end) {
          return false;
        }
      }
      
      return true;
    });
  }, [orders]);

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => order.createdAt >= today);
    
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
        .reduce((total, order) => total + order.totalAmount, 0)
    };
  }, [orders]);

  // Mock real-time updates
  const subscribeToOrders = useCallback(() => {
    console.log('🔄 Mock real-time subscription started');
    
    // Mock function - in real app this would be Firebase onSnapshot
    const unsubscribe = () => {
      console.log('🔄 Mock real-time subscription ended');
    };
    
    return unsubscribe;
  }, []);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const value: OrdersContextType = {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    addAdminNote,
    updateShippingInfo,
    bulkUpdateStatus,
    filterOrders,
    getOrderStats,
    subscribeToOrders
  };

  return (
    <MockOrdersContext.Provider value={value}>
      {children}
    </MockOrdersContext.Provider>
  );
};

export { MockOrdersProvider, MockOrdersContext };
export default MockOrdersContext;