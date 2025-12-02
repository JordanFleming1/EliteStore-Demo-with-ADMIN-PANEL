import type { Order, OrderStatus } from '../types/index';
// Real Orders Context using JSON Server API
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { db } from '../firebase/firebase.config';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';

import { useToast } from '../hooks/useToast';


interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  
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
  getOrderStats: () => Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  
  // Real-time updates simulation
  subscribeToOrders: () => () => void;
  
  // Utility functions
  refreshData: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

const RealOrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

export const RealOrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const { showToast } = useToast();

  // Check if API server is running
  const checkConnection = useCallback(async (): Promise<boolean> => {
    // Always connected with Firestore
    setConnected(true);
    return true;
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Firestore fetch
      const snapshot = await getDocs(collection(db, 'orders'));
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(ordersData);
      // showToast('success', 'Orders Loaded', `Successfully loaded ${ordersData.length} orders from Firestore`);
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      showToast('error', 'Error', 'Failed to load orders from Firestore');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${status}`);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
      // Optionally add note to statusHistory
      if (note) {
        // You may want to push to an array field
        // This is a simplified example
        await updateDoc(orderRef, { statusHistory: [{ status, timestamp: new Date(), note, updatedBy: 'admin' }] });
      }
      await fetchOrders();
      showToast('success', 'Success', `Order status updated to ${status}`);
    } catch (err: any) {
      console.error('❌ Error updating order status:', err);
      showToast('error', 'Error', 'Failed to update order status');
    }
  }, [fetchOrders, showToast]);

  // Update order with partial data
  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      console.log(`🔄 Updating order ${orderId}`);
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updates);
      await fetchOrders();
      showToast('success', 'Success', 'Order updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating order:', err);
      showToast('error', 'Error', 'Failed to update order');
    }
  }, [fetchOrders, showToast]);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      console.log(`🗑️ Deleting order ${orderId}`);
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      showToast('success', 'Success', 'Order deleted successfully');
    } catch (err: any) {
      console.error('❌ Error deleting order:', err);
      showToast('error', 'Error', 'Failed to delete order');
    }
  }, [showToast]);

  // Add admin note to order
  const addAdminNote = useCallback(async (orderId: string, note: string) => {
    try {
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder) return;

      await updateOrder(orderId, { adminNotes: note });
      
      showToast('success', 'Success', 'Admin note added');
    } catch (err: any) {
      console.error('❌ Error adding admin note:', err);
      showToast('error', 'Error', 'Failed to add admin note');
    }
  }, [orders, updateOrder, showToast]);

  // Update shipping information
  const updateShippingInfo = useCallback(async (orderId: string, shippingInfo: Partial<Order['shippingInfo']>) => {
    try {
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder) return;

      const updatedShippingInfo = {
        courier: '',
        trackingNumber: '',
        ...currentOrder.shippingInfo,
        ...shippingInfo
      };

      await updateOrder(orderId, { shippingInfo: updatedShippingInfo });
      
      showToast('success', 'Success', 'Shipping info updated');
    } catch (err: any) {
      console.error('❌ Error updating shipping info:', err);
      showToast('error', 'Error', 'Failed to update shipping info');
    }
  }, [orders, updateOrder, showToast]);

  // Bulk update order status
  const bulkUpdateStatus = useCallback(async (orderIds: string[], status: OrderStatus) => {
    try {
      console.log(`🔄 Bulk updating ${orderIds.length} orders to ${status}`);
      const batchUpdates = orderIds.map(async (orderId) => {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
      });
      await Promise.all(batchUpdates);
      await fetchOrders();
      showToast('success', 'Success', `${orderIds.length} orders updated to ${status}`);
    } catch (err: any) {
      console.error('❌ Error bulk updating orders:', err);
      showToast('error', 'Error', 'Failed to update orders');
    }
  }, [fetchOrders, showToast]);

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

  // Get order statistics from API
  const getOrderStats = useCallback(async () => {
    // Always calculate stats from orders array
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const created = new Date(order.createdAt);
      return created >= today;
    });

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
        .reduce((total, order) => total + (order.totalAmount || 0), 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length
        : 0
    };
  }, [orders]);

  // Simulate real-time updates with polling
  const subscribeToOrders = useCallback(() => {
    console.log('🔄 Starting real-time order updates...');
    
    const interval = setInterval(() => {
      // Poll for updates every 30 seconds
      fetchOrders();
    }, 30000);
    
    const unsubscribe = () => {
      console.log('🔄 Stopping real-time order updates');
      clearInterval(interval);
    };
    
    return unsubscribe;
  }, [fetchOrders]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Check connection periodically
  useEffect(() => {
    const connectionCheck = setInterval(checkConnection, 60000); // Check every minute
    return () => clearInterval(connectionCheck);
  }, [checkConnection]);

  const value: OrdersContextType = {
    orders,
    loading,
    error,
    connected,
    fetchOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    addAdminNote,
    updateShippingInfo,
    bulkUpdateStatus,
    filterOrders,
    getOrderStats,
    subscribeToOrders,
    refreshData,
    checkConnection
  };

  return (
    <RealOrdersContext.Provider value={value}>
      {children}
    </RealOrdersContext.Provider>
  );
};

export { RealOrdersContext };
export default RealOrdersContext;