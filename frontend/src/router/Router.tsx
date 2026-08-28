import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts & Guards
import Layout from '../components/Layout';
import { ProtectedRoute } from '../feature/auth';
import {
  AdminLayout,
  AdminProductList,
  AdminProductCreate,
  AdminProductImages,
  AdminProductVariantList,
  AdminCategoryList,
  AdminCategoryCreate,
  AdminOrderList,
  AdminUserList,
  AdminVoucherList,
  AdminReviewList,
  AdminInventoryList,
  AdminBanners,
  AdminSettings,
} from '../feature/admin';

// Feature Pages
import { Home, About, Contact, NotFound } from '../feature/home';
import { Login, Register, Profile } from '../feature/auth';
import { Products, ProductDetail } from '../feature/products';
import { Cart } from '../feature/cart';
import { Orders, Checkout, MomoReturn } from '../feature/orders';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
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
          <Route path="/orders" element={<Orders />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin routes - được bảo vệ bởi ProtectedRoute */}
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
    </Router>
  );
};

export default AppRouter;
