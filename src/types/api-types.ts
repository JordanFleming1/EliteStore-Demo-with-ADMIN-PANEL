export interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  monthlyStats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growth?: number;
    newCustomers?: number;
  };
  lastUpdated: string;
  categoryBreakdown?: Array<{
    category: string;
    sales: number;
    products?: number;
    revenue?: number;
  }>;
  topProducts?: Array<{
    productId: string;
    name: string;
    sales: number;
    unitsSold?: number;
    revenue?: number;
  }>;
  topCustomers?: Array<{
    customerId: string;
    name: string;
    totalSpent: number;
    email?: string;
    orderCount?: number;
  }>;
}

export interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  orderStatusCounts?: { [status: string]: number };
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  isActive: boolean;
  backgroundColor?: string; // solid color or fallback
  gradient?: string; // CSS gradient string
}
