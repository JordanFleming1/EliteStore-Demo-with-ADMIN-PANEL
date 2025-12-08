

import type { Review, Order, Product } from '../types/index';
import type { AnalyticsData, Customer, HeroSlide } from '../types/api-types';


class RealAPIService {
  baseUrl: string = '';
  // Generic request stub (replace with real implementation as needed)
  async request(): Promise<unknown> {
    // No-op for mock
    return {};
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
    } catch {
      // Ignore JSON errors
    }
    return null;
  }
  async getReviews(): Promise<Review[]> {
    // No-op for mock
    return [];
  }
  async createReview(): Promise<void> {
    // No-op for mock
    return;
  }
                // HERO SLIDES
                async getHeroSlides(): Promise<HeroSlide[]> {
                  const { db } = await import('../firebase/firebase.config');
                  const { collection, getDocs } = await import('firebase/firestore');
                  const snapshot = await getDocs(collection(db, 'heroSlides'));
                  // Always use string IDs for hero slides
                  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<HeroSlide, 'id'>) })) as HeroSlide[];
                }
                async saveHeroSlide(slide: Partial<HeroSlide>): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  if (!slide.id) throw new Error('Slide must have an id');
                  await setDoc(doc(db, 'heroSlides', String(slide.id)), slide, { merge: true });
                }
                async deleteHeroSlide(id: string): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  await deleteDoc(doc(db, 'heroSlides', id));
                }

                // CONTACT SETTINGS & MESSAGES
                async getContactSettings(): Promise<Record<string, unknown>> {
                  return {};
                }
                async saveContactSettings(): Promise<void> {
                  return;
                }
                async getContactMessages(): Promise<Record<string, unknown>[]> {
                  return [];
                }
                async saveContactMessage(): Promise<void> {
                  return;
                }
                async deleteContactMessage(id: string): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, deleteDoc } = await import('firebase/firestore');
                  await deleteDoc(doc(db, 'contactMessages', id));
                }

                // ABOUT PAGE SETTINGS
                async getAboutPageSettings(): Promise<Record<string, unknown>> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, getDoc } = await import('firebase/firestore');
                  const aboutDoc = await getDoc(doc(db, 'settings', 'aboutPage'));
                  return aboutDoc.exists() ? aboutDoc.data() : {};
                }
                async saveAboutPageSettings(settings: Record<string, unknown>): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'settings', 'aboutPage'), settings, { merge: true });
                }

                // FOOTER SETTINGS
                async getFooterSettings(): Promise<Record<string, unknown>> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, getDoc } = await import('firebase/firestore');
                  const footerDoc = await getDoc(doc(db, 'settings', 'footer'));
                  return footerDoc.exists() ? footerDoc.data() : {};
                }
                async saveFooterSettings(settings: Record<string, unknown>): Promise<void> {
                  const { db } = await import('../firebase/firebase.config');
                  const { doc, setDoc } = await import('firebase/firestore');
                  await setDoc(doc(db, 'settings', 'footer'), settings, { merge: true });
                }
  async updateOrderStatus(): Promise<Order> {
    // Parameters removed; return dummy order or call request
    return await this.request() as Order;
  }
  async getAnalytics(): Promise<AnalyticsData> {
    return await this.request() as AnalyticsData;
  }
  async createOrder(): Promise<Order> {
    return await this.request() as Order;
  }
  async getOrderStats(): Promise<AnalyticsData> {
    return await this.request() as AnalyticsData;
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
      return await this.request() as Order[];
    }
  // TODO: Refactor all methods to use Firestore
}

export const api = new RealAPIService();
export default api;

