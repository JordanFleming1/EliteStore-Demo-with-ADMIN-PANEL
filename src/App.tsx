import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthProvider from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { OrdersProvider } from './contexts/OrdersContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerificationPage from './pages/VerificationPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import DealsPage from './pages/DealsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import AdminContact from './pages/admin/AdminContact';
import AdminAbout from './pages/admin/AdminAbout';
import AdminFooter from './pages/admin/AdminFooter';
import AdminNavbar from './pages/admin/AdminNavbar';
import './App.css';
import Navbar from './components/Navbar';
import EmployerWelcome from './components/EmployerWelcome';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { currentUser } = useAuth();
  // EmployerWelcome popup state
  const [showEmployerWelcome, setShowEmployerWelcome] = React.useState(false);


  // Show popup on first visit (non-admin routes only)
  React.useEffect(() => {
    if (!isAdminRoute) {
      const dismissed = localStorage.getItem('employerWelcomeDismissed');
      if (!dismissed) {
        setShowEmployerWelcome(true);
        // Disable scrolling when popup is open
        document.body.style.overflow = 'hidden';
      }
    }
    // Clean up: restore scrolling if popup is not shown
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdminRoute]);

  React.useEffect(() => {
    if (showEmployerWelcome) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showEmployerWelcome]);

  const handleCloseEmployerWelcome = () => {
    setShowEmployerWelcome(false);
    localStorage.setItem('employerWelcomeDismissed', 'true');
    document.body.style.overflow = '';
  };

  // Persist route on change
  useEffect(() => {
    localStorage.setItem('lastRoute', location.pathname + location.search);
  }, [location]);

  // Restore route on first load (only for non-admin users)
  const navigate = useNavigate();
  useEffect(() => {
    const isHome = window.location.pathname === '/';
    const isDirectProduct = /^\/product\//.test(window.location.pathname);
    const isProductsPage = window.location.pathname === '/products';
    const isAdmin = window.location.pathname.startsWith('/admin');
    const isAdminUser = currentUser && currentUser.role === 'admin';
    // Only restore last route for non-admin users, and never redirect away from /products or /product/:id
    if (isHome && !isDirectProduct && !isProductsPage && !isAdmin && !isAdminUser) {
      const lastRoute = localStorage.getItem('lastRoute');
      if (lastRoute && lastRoute !== '/') {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [navigate, currentUser]);

  // No global loading spinner: always render content
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Only render the main Header/navbar, not the legacy Navbar */}
      {!isAdminRoute && !showEmployerWelcome && <Header />}
      {showEmployerWelcome && <EmployerWelcome onClose={handleCloseEmployerWelcome} />}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* All other routes require verification */}
          <Route path="/*" element={<VerificationPage />} />
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/customers" element={<AdminCustomers />} />
                  <Route path="/analytics" element={<AdminAnalytics />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  <Route path="/hero-slides" element={<AdminHeroSlides />} />
                  <Route path="/contact" element={<AdminContact />} />
                  <Route path="/about" element={<AdminAbout />} />
                  <Route path="/footer" element={<AdminFooter />} />
                  <Route path="/navbar" element={<AdminNavbar />} />
                </Routes>
              </AdminLayout>
            </AdminProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminRoute && !showEmployerWelcome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <OrdersProvider>
              <SiteSettingsProvider>
                <Router>
                  <AppContent />
                </Router>
              </SiteSettingsProvider>
            </OrdersProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </div>
  );
}

export default App;
