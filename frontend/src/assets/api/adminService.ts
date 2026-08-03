import { httpGet, httpPost } from './http';
import type { Product, Category, User, Order, ProductImage, ID } from './types';

export const AdminService = {
  // Products
  async createProduct(data: Partial<Product>): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>('products', data);
  },

  async getProducts(): Promise<{ data: Product[] }> {
    return httpGet<{ data: Product[] }>('products');
  },

  async updateProduct(id: ID, data: Partial<Product>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${id}`, { ...data, _method: 'PUT' });
  },

  async deleteProduct(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${id}`, { _method: 'DELETE' });
  },

  // Categories
  async getCategories(): Promise<{ data: Category[] }> {
    return httpGet<{ data: Category[] }>('categories');
  },

  async createCategory(data: Partial<Category>): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>('categories', data);
  },

  async updateCategory(id: ID, data: Partial<Category>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`categories/${id}`, { ...data, _method: 'PUT' });
  },

  async deleteCategory(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`categories/${id}`, { _method: 'DELETE' });
  },

  // Product Images
  async createProductImage(productId: ID, data: Partial<ProductImage>): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>(`products/${productId}/images`, data);
  },

  async updateProductImage(imageId: ID, data: Partial<ProductImage>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-images/${imageId}`, { ...data, _method: 'PUT' });
  },

  // Upload file ảnh
  async uploadImage(file: File): Promise<{ success: boolean; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload file thất bại');
    }
    
    return response.json();
  },

  // Upload multiple files
  async uploadMultipleImages(files: File[]): Promise<{ success: boolean; files: Array<{ url: string; filename: string }> }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch('/api/upload-multiple', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload files thất bại');
    }
    
    return response.json();
  },

  async deleteProductImage(productId: ID, imageId: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`products/${productId}/images/${imageId}`, { _method: 'DELETE' });
  },

  // Users
  async getUsers(): Promise<{ data: User[] }> {
    return httpGet<{ data: User[] }>('users');
  },

  async createUser(data: Partial<User> & { password: string }): Promise<{ success: boolean; id: ID }> {
    const { password, ...userData } = data;
    return httpPost<{ success: boolean; id: ID }>('users', { ...userData, password_hash: password });
  },

  async updateUser(id: ID, data: Partial<User>): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`users/${id}`, { ...data, _method: 'PUT' });
  },

  async deleteUser(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`users/${id}`, { _method: 'DELETE' });
  },

  // Orders
  async getOrders(): Promise<{ data: Order[] }> {
    return httpGet<{ data: Order[] }>('orders');
  },

  async updateOrderStatus(id: ID, status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/status`, { status });
  },

  async updatePaymentStatus(id: ID, payment_status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/payment-status`, { payment_status });
  },

  async updateShippingStatus(id: ID, shipping_status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}/shipping-status`, { shipping_status });
  },

  async deleteOrder(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`orders/${id}`, { _method: 'DELETE' });
  },

  // Vouchers
  async createVoucher(data: any): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>('vouchers', data);
  },

  async updateVoucher(id: ID, data: any): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`vouchers/${id}`, { ...data, _method: 'PUT' });
  },

  async deleteVoucher(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`vouchers/${id}`, { _method: 'DELETE' });
  },

  // Reviews
  async updateReviewStatus(id: ID, status: string): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`reviews/${id}/status`, { status });
  },

  async deleteReview(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`reviews/${id}`, { _method: 'DELETE' });
  },

  // Inventory
  async updateInventory(variantId: ID, quantity: number): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`inventory/${variantId}`, { quantity });
  },

  // Product Variants
  async getProductVariants(): Promise<{ data: any[] }> {
    return httpGet<{ data: any[] }>('product-variants');
  },

  async createProductVariant(data: any): Promise<{ success: boolean; id: ID }> {
    return httpPost<{ success: boolean; id: ID }>('product-variants', data);
  },

  async updateProductVariant(id: ID, data: any): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-variants/${id}`, { ...data, _method: 'PUT' });
  },

  async deleteProductVariant(id: ID): Promise<{ success: boolean }> {
    return httpPost<{ success: boolean }>(`product-variants/${id}`, { _method: 'DELETE' });
  },
}; 