import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { StoreProvider } from './context/StoreContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Layout } from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminProductFormPage from './pages/admin/AdminProductFormPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminInventoryPage from './pages/admin/AdminInventoryPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminCustomersPage from './pages/admin/AdminCustomersPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import ProtectedRoute from './pages/admin/ProtectedRoute.jsx';
import SiteBrandAssets from './components/common/SiteBrandAssets.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <SiteBrandAssets />
            <ScrollToTop />
            <Routes>
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/edit/:id" element={<AdminProductFormPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ToastProvider>
  );
}