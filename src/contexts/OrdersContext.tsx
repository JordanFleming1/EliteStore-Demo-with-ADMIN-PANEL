// Using REAL API with JSON Server - No more mock data!
// This provides accurate, persistent data from a real database

import RealOrdersContext, { RealOrdersProvider } from './RealOrdersContext';

// Export the real context as the default
export const OrdersContext = RealOrdersContext;
export const OrdersProvider = RealOrdersProvider;

export default OrdersContext;
