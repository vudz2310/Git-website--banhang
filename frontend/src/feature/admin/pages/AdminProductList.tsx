import React, { useEffect, useState } from 'react';
import { ProductService } from '../../products';
import { AdminService } from '../services/adminService';
import { CategoryService } from '../services/categoryService';
import { UploadService } from '../../../api/uploadService';
import type { Product, Category, ID } from '../../../api/types';
import { Link } from 'react-router-dom';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSelect, FormTextarea, FormSwitch } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import {
  EditIcon,
  TrashIcon,
  RefreshIcon,
  PlusIcon,
  ImageIcon,
  SettingsIcon,
} from '../../../components/Icons';

const AdminProductList: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<ID | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    product_img: '',
    brand: '',
    category_id: null as ID | null,
    is_active: true,
  });

  useEffect(() => {
    load(1);
    loadCategories();
  }, []);

  const load = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await ProductService.getList(p, pageSize);
      setItems(res.data || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await CategoryService.list();
      setCategories(response.data || []);
    } catch (e: any) {
      console.error('Load categories error:', e);
    }
  };

  // Tự động tạo slug từ tên sản phẩm
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploadingImage(true);
      const res = await UploadService.uploadSingle(file);
      if (res.success) {
        setFormData((prev) => ({ ...prev, product_img: res.url }));
      }
    } catch (err: any) {
      setError('Tải ảnh thất bại: ' + (err.message || 'Lỗi'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku || '',
      description: product.description || '',
      product_img: product.product_img || '',
      brand: product.brand || '',
      category_id: product.category_id || null,
      is_active: product.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Vui lòng điền đầy đủ tên và slug sản phẩm');
      return;
    }

    try {
      setIsSubmitting(true);
      await AdminService.updateProduct(editingProduct.id, {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        description: formData.description,
        product_img: formData.product_img,
        brand: formData.brand,
        category_id: formData.category_id,
        is_active: formData.is_active,
      });

      setShowEditModal(false);
      setEditingProduct(null);
      load(page);
    } catch (e: any) {
      setError(e.message || 'Cập nhật sản phẩm thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await AdminService.deleteProduct(deleteTargetId);
      setDeleteTargetId(null);
      load(page);
    } catch (e: any) {
      setError(e.message || 'Xóa sản phẩm thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng: <span className="font-semibold text-gray-800">{total}</span> sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => load(page)}
            className="inline-flex items-center px-3.5 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all"
            title="Tải lại danh sách"
          >
            <RefreshIcon className="w-4 h-4 mr-1.5" />
            Làm mới
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-1.5" />
            Thêm Sản phẩm
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Products Table Container with horizontal scroll */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="w-16 px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sản phẩm & Danh mục
                </th>
                <th className="w-40 px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã SKU / Slug
                </th>
                <th className="w-32 px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thương hiệu
                </th>
                <th className="w-28 px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="w-36 px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {items.map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden mx-auto flex items-center justify-center">
                        {product.product_img ? (
                          <img
                            src={product.product_img}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">No img</span>
                        )}
                      </div>
                    </td>

                    {/* Product Name & Category */}
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                          {category ? category.name : 'Chưa phân loại'}
                        </span>
                        <span className="text-xs text-gray-400">ID: #{product.id}</span>
                      </div>
                    </td>

                    {/* SKU & Slug */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-mono font-medium text-gray-800">
                        {product.sku || '—'}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono truncate max-w-[140px]">
                        /{product.slug}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {product.brand || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Đang bán' : 'Tạm ẩn'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/admin/products/${product.id}/images`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Quản lý Album ảnh"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          to="/admin/variants"
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Biến thể"
                        >
                          <SettingsIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(product.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">📦</div>
            <p className="font-medium text-gray-700">Chưa có sản phẩm nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Thêm Sản phẩm" để tạo sản phẩm đầu tiên.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Trang <span className="font-semibold text-gray-800">{page}</span> / {totalPages} (Tổng {total} sản phẩm)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Standardized Edit Product Modal */}
      <AdminModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa Sản phẩm"
        subtitle={editingProduct ? `ID: #${editingProduct.id} • SKU: ${editingProduct.sku || 'N/A'}` : ''}
        onSubmit={handleSubmit}
        submitText="Lưu thay đổi"
        isLoading={isSubmitting}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Tên sản phẩm"
              placeholder="VD: iPhone 15 Pro Max 256GB"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <FormInput
              label="Slug (Đường dẫn)"
              placeholder="iphone-15-pro-max-256gb"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Mã SKU"
              placeholder="IP15PM-256"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />

            <FormSelect
              label="Danh mục sản phẩm"
              placeholder="-- Chọn danh mục --"
              value={formData.category_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })
              }
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <FormInput
              label="Thương hiệu (Brand)"
              placeholder="VD: Apple, Samsung..."
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh đại diện sản phẩm</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Nhập URL ảnh hoặc bấm Tải ảnh..."
                value={formData.product_img}
                onChange={(e) => setFormData({ ...formData, product_img: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer flex-shrink-0 transition-colors flex items-center">
                <span>{uploadingImage ? 'Đang tải...' : 'Tải ảnh'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {formData.product_img && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 w-24 h-24 bg-gray-50 flex items-center justify-center">
                <img src={formData.product_img} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <FormTextarea
            label="Mô tả sản phẩm"
            placeholder="Nhập mô tả tóm tắt hoặc đặc điểm nổi bật..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="pt-2">
            <FormSwitch
              label="Trạng thái kinh doanh"
              description="Cho phép hiển thị sản phẩm trên trang chủ và trang danh mục"
              checked={formData.is_active}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa Sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Tất cả các biến thể và hình ảnh liên quan có thể bị xóa theo."
        confirmText="Xóa sản phẩm"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminProductList;
