import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import { ProtectedRoute } from '../feature/auth';
import { LoadingSpinner } from '../common';

// Lazy load Client Pages
const Home = lazy(() => import('../feature/home').then((m) => ({ default: m.Home })));
const About = lazy(() => import('../feature/home').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('../feature/home').then((m) => ({ default: m.Contact })));
const NotFound = lazy(() => import('../feature/home').then((m) => ({ default: m.NotFound })));

const Login = lazy(() => import('../feature/auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../feature/auth').then((m) => ({ default: m.Register })));
const Profile = lazy(() => import('../feature/auth').then((m) => ({ default: m.Profile })));

const Products = lazy(() => import('../feature/products').then((m) => ({ default: m.Products })));
const ProductDetail = lazy(() => import('../feature/products').then((m) => ({ default: m.ProductDetail })));

const Cart = lazy(() => import('../feature/cart').then((m) => ({ default: m.Cart })));
const Orders = lazy(() => import('../feature/orders').then((m) => ({ default: m.Orders })));
const Checkout = lazy(() => import('../feature/orders').then((m) => ({ default: m.Checkout })));
const MomoReturn = lazy(() => import('../feature/orders').then((m) => ({ default: m.MomoReturn })));

// Lazy load Admin Pages
const AdminLayout = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminLayout })));
const AdminProductList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminProductList })));
const AdminProductCreate = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminProductCreate })));
const AdminProductImages = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminProductImages })));
const AdminProductVariantList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminProductVariantList })));
const AdminCategoryList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminCategoryList })));
const AdminCategoryCreate = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminCategoryCreate })));
const AdminOrderList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminOrderList })));
const AdminUserList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminUserList })));
const AdminVoucherList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminVoucherList })));
const AdminReviewList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminReviewList })));
const AdminInventoryList = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminInventoryList })));
const AdminBanners = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminBanners })));
const AdminSettings = lazy(() => import('../feature/admin').then((m) => ({ default: m.AdminSettings })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner text="Đang tải trang..." />
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Client Public & Protected Storefront */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment/momo/return" element={<MomoReturn />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin Back-Office - Protected by Admin Guard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true} redirectTo="/login">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="categories/new" element={<AdminCategoryCreate />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<AdminProductCreate />} />
            <Route path="products/:id/images" element={<AdminProductImages />} />
            <Route path="users" element={<AdminUserList />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="vouchers" element={<AdminVoucherList />} />
            <Route path="reviews" element={<AdminReviewList />} />
            <Route path="inventory" element={<AdminInventoryList />} />
            <Route path="variants" element={<AdminProductVariantList />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="banners" element={<AdminBanners />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
