import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import type { Product } from '../../../api/types';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSelect, FormSwitch } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../components/Icons';

interface ProductVariant {
  id: number;
  product_id: number;
  variant_sku?: string;
  color?: string;
  size?: string;
  price: number;
  compare_price?: number;
  weight?: number;
  is_active: boolean;
  created_at: string;
  product_name?: string;
}

const AdminProductVariantList: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    product_id: '',
    variant_sku: '',
    color: '',
    size: '',
    price: 0,
    compare_price: 0,
    weight: 0,
    is_active: true,
  });

  const loadVariants = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getProductVariants();
      setVariants(response.data || []);
    } catch (e: any) {
      console.error('Load variants error:', e);
      setError(e.message || 'Tải danh sách biến thể thất bại');
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await AdminService.getProducts();
      setProducts(response.data || []);
    } catch (e: any) {
      console.error('Load products error:', e);
    }
  };

  useEffect(() => {
    loadVariants();
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.price) {
      setError('Vui lòng chọn sản phẩm và nhập giá bán');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingVariant) {
        await AdminService.updateProductVariant(editingVariant.id, formData);
      } else {
        await AdminService.createProductVariant(formData);
      }

      closeModal();
      loadVariants();
    } catch (e: any) {
      setError(e.message || 'Lưu biến thể thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product_id.toString(),
      variant_sku: variant.variant_sku || '',
      color: variant.color || '',
      size: variant.size || '',
      price: variant.price || 0,
      compare_price: variant.compare_price || 0,
      weight: variant.weight || 0,
      is_active: variant.is_active,
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await AdminService.deleteProductVariant(deleteTargetId);
      setDeleteTargetId(null);
      loadVariants();
    } catch (e: any) {
      setError(e.message || 'Xóa biến thể thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setFormData({
      product_id: '',
      variant_sku: '',
      color: '',
      size: '',
      price: 0,
      compare_price: 0,
      weight: 0,
      is_active: true,
    });
    setEditingVariant(null);
    setShowModal(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Biến thể Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{variants.length}</span> biến thể (màu sắc, dung lượng, kích thước)
          </p>
        </div>
        <button
          onClick={() => {
            closeModal();
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all"
        >
          <PlusIcon className="w-5 h-5 mr-1.5" />
          Thêm Biến thể Mới
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Variants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Màu sắc / Size
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {variant.product_name || `Sản phẩm #${variant.product_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                      {variant.variant_sku || '—'}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs font-medium mr-1.5">
                      {variant.color || 'Mặc định'}
                    </span>
                    {variant.size && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                        {variant.size}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    <div>{formatPrice(variant.price)}</div>
                    {variant.compare_price && variant.compare_price > variant.price && (
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(variant.compare_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        variant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {variant.is_active ? 'Đang bán' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(variant)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(variant.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {variants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="font-medium text-gray-700">Chưa có biến thể sản phẩm nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Thêm Biến thể Mới" để tạo biến thể đầu tiên.</p>
          </div>
        )}
      </div>

      {/* Standardized Form Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingVariant ? 'Chỉnh sửa Biến thể' : 'Thêm Biến thể Mới'}
        subtitle="Thiết lập màu sắc, kích cỡ và giá riêng cho biến thể"
        onSubmit={handleSubmit}
        submitText={editingVariant ? 'Cập nhật' : 'Tạo Biến thể'}
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="space-y-4">
          <FormSelect
            label="Thuộc Sản phẩm"
            placeholder="-- Chọn sản phẩm cha --"
            required
            disabled={editingVariant !== null}
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Mã SKU Biến thể"
              placeholder="VD: IP15-PRO-256-BLACK"
              value={formData.variant_sku}
              onChange={(e) => setFormData({ ...formData, variant_sku: e.target.value })}
            />

            <FormInput
              label="Màu sắc"
              placeholder="VD: Đen Titan, Xanh..."
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />

            <FormInput
              label="Kích cỡ / Dung lượng"
              placeholder="VD: 128GB, 256GB, XL..."
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <FormInput
              label="Giá bán (VNĐ)"
              type="number"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
            />

            <FormInput
              label="Giá so sánh (Gốc)"
              type="number"
              min="0"
              value={formData.compare_price}
              onChange={(e) => setFormData({ ...formData, compare_price: Number(e.target.value) || 0 })}
              helperText="Hiển thị gạch ngang giảm giá"
            />

            <FormInput
              label="Khối lượng (gram)"
              type="number"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="pt-2">
            <FormSwitch
              label="Kích hoạt biến thể"
              description="Cho phép khách hàng lựa chọn và mua biến thể này"
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
        title="Xóa Biến thể"
        message="Bạn có chắc chắn muốn xóa biến thể này? Khách hàng sẽ không thể đặt mua biến thể này nữa."
        confirmText="Xóa biến thể"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminProductVariantList;
