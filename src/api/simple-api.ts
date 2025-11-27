

import type { Review, Order, Product } from '../types/index';
import type { AnalyticsData, Customer, HeroSlide } from '../types/api-types';


class RealAPIService {
  baseUrl: string = '';
  // Generic request stub (replace with real implementation as needed)
  async request(endpoint: string, options?: any): Promise<any> {
    // You should implement this to call your backend or Firestore as needed
    return Promise.resolve({});
  }

  // Product API stubs
  async getProducts(): Promise<Product[]> {
    // TODO: Implement actual Firestore or backend call
    return [];
  }
  async getProduct(id: string): Promise<Product | null> {
    // Try to get from localStorage as a fallback for demo/dev
    try {
      const productsRaw = localStorage.getItem('products');
      if (productsRaw) {
        const products: Product[] = JSON.parse(productsRaw);
        const found = products.find(p => p.id === id);
        if (found) return found;
      }
    } catch (e) {
      // Ignore JSON errors
    }
    return null;
  }
  async getReviews(productId: string): Promise<Review[]> {
    // TODO: Implement actual Firestore or backend call
    return [];
  }
  async createReview(review: Partial<Review>): Promise<void> {
    // TODO: Implement actual Firestore or backend call
    return;
  }
                // HERO SLIDES
                async getHeroSlides(): Promise<HeroSlide[]> {
                  const { db } = await import('../firebase/firebase.config');
                  const { collection, getDocs } = await import('firebase/firestore');
                  const snapshot = await getDocs(collection(db, 'heroSlides'));
                  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HeroSlide[];
                }
                async saveHeroSlide(slide: Partial<HeroSlide>): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'heroSlides', String(slide.id)), slide, { merge: true });
                }
                async deleteHeroSlide(id: string): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  await deleteDoc(doc(db, 'heroSlides', id));
                }

                // CONTACT SETTINGS & MESSAGES
                async getContactSettings(): Promise<any> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, getDoc } = await import('firebase/firestore');
                  const snap = await getDoc(doc(db, 'settings', 'contact'));
                  return snap.exists() ? snap.data() : {};
                }
                async saveContactSettings(settings: any): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'settings', 'contact'), settings, { merge: true });
                }
                async getContactMessages(): Promise<any[]> {
                  const { db } = await import('../firebase/firebase.config');
                  const { collection, getDocs } = await import('firebase/firestore');
                  const snapshot = await getDocs(collection(db, 'contactMessages'));
                  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }
                async saveContactMessage(message: any): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { collection, addDoc } = await import('firebase/firestore');
                  await addDoc(collection(db, 'contactMessages'), message);
                }
                async deleteContactMessage(id: string): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  await deleteDoc(doc(db, 'contactMessages', id));
                }

                // ABOUT PAGE SETTINGS
                async getAboutPageSettings(): Promise<any> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, getDoc } = await import('firebase/firestore');
                  const snap = await getDoc(doc(db, 'settings', 'about'));
                  return snap.exists() ? snap.data() : {};
                }
                async saveAboutPageSettings(settings: any): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'settings', 'about'), settings, { merge: true });
                }

                // FOOTER SETTINGS
                async getFooterSettings(): Promise<any> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, getDoc } = await import('firebase/firestore');
                  const snap = await getDoc(doc(db, 'settings', 'footer'));
                  return snap.exists() ? snap.data() : {};
                }
                async saveFooterSettings(settings: any): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'settings', 'footer'), settings, { merge: true });
                }
              async updateOrderStatus(orderId: string, status: string, note?: string): Promise<Order> {
                // Patch only the status and optionally add a note to statusHistory
                const patchData: Partial<Order> = { status: status as Order['status'] };
                if (note) {
                  patchData.statusHistory = [
                    { status: status as Order['status'], timestamp: new Date(), note, updatedBy: 'admin' }
                  ];
                }
                return await this.request(`orders/${orderId}`, {
                  method: 'PATCH',
                  body: JSON.stringify(patchData),
                }) as Order;
              }
            async getAnalytics(): Promise<AnalyticsData> {
              return await this.request('analytics') as AnalyticsData;
            }
          async createOrder(orderData: Partial<Order>): Promise<Order> {
            return await this.request('orders', {
              method: 'POST',
              body: JSON.stringify(orderData)
            }) as Order;
          }
        async getOrderStats(): Promise<AnalyticsData> {
          return await this.request('analytics') as AnalyticsData;
        }
      async getCustomers(): Promise<Customer[]> {
        const { db } = await import('../firebase/firebase.config');
        const { collection, getDocs } = await import('firebase/firestore');
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];

        // Aggregate customers from orders
        const customerMap: { [email: string]: Customer & { orderStatusCounts?: Record<string, number> } } = {};
        for (const order of orders) {
          const email = order.customer?.email;
          if (!email) continue;
          if (!customerMap[email]) {
            customerMap[email] = {
              id: email,
              displayName: order.customer.displayName || email,
              email,
              phone: order.customer.phone || '',
              totalOrders: 0,
              totalSpent: 0,
              joinedAt: order.createdAt ? (typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toISOString()) : '',
              orderStatusCounts: {},
            };
          }
          // Count order status
          const status = order.status || 'unknown';
          customerMap[email].orderStatusCounts![status] = (customerMap[email].orderStatusCounts![status] || 0) + 1;
          // Only count delivered orders for revenue and totalOrders
          if (status === 'delivered') {
            customerMap[email].totalOrders += 1;
            customerMap[email].totalSpent += order.totalAmount || 0;
          }
          // Use earliest order date as joinedAt
          if (order.createdAt) {
            const orderDate = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt;
            const currentJoined = customerMap[email].joinedAt ? new Date(customerMap[email].joinedAt) : null;
            if (!currentJoined || orderDate < currentJoined) {
              customerMap[email].joinedAt = orderDate.toISOString();
            }
          }
        }
        return Object.values(customerMap);
      }
    async healthCheck(): Promise<boolean> {
      try {
        const response = await fetch(`${this.baseUrl}/orders`, { method: 'GET' });
        return response.ok;
      } catch {
        return false;
      }
    }

    async getOrders(): Promise<Order[]> {
      return await this.request('orders') as Order[];
    }
  // TODO: Refactor all methods to use Firestore
}

export const api = new RealAPIService();
export default api;

