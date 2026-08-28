import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import type { Category, ID } from '../../../api/types';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSelect } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../components/Icons';

const AdminCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete confirm modal state
  const [deleteTargetId, setDeleteTargetId] = useState<ID | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: null as ID | null,
    sort_order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getCategories();
      setCategories(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tạo slug từ tên danh mục
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Vui lòng điền đầy đủ tên và slug danh mục');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await AdminService.updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id,
          sort_order: Number(formData.sort_order) || 0,
        });
      } else {
        await AdminService.createCategory({
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id,
          sort_order: Number(formData.sort_order) || 0,
        });
      }

      closeModal();
      loadCategories();
    } catch (e: any) {
      setError(e.message || 'Thao tác lưu danh mục thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || null,
      sort_order: category.sort_order || 0,
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await AdminService.deleteCategory(deleteTargetId);
      setDeleteTargetId(null);
      loadCategories();
    } catch (e: any) {
      setError(e.message || 'Xóa danh mục thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setFormData({
      name: '',
      slug: '',
      parent_id: null,
      sort_order: 0,
    });
    setEditingCategory(null);
    setShowModal(false);
  };

  const getParentName = (parentId: ID | null | undefined) => {
    if (!parentId) return 'Danh mục gốc';
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : 'Không xác định';
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{categories.length}</span> danh mục sản phẩm
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
          Thêm Danh mục
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

      {/* Danh sách danh mục Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug (Đường dẫn)
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Danh mục cha
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.parent_id
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {getParentName(category.parent_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(category.id)}
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

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">📁</div>
            <p className="font-medium text-gray-700">Chưa có danh mục nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Thêm Danh mục" ở trên để tạo danh mục đầu tiên.</p>
          </div>
        )}
      </div>

      {/* Standardized Form Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
        subtitle={editingCategory ? `ID: #${editingCategory.id}` : 'Nhập thông tin danh mục cần tạo'}
        onSubmit={handleSubmit}
        submitText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Tên danh mục"
            placeholder="Ví dụ: Điện thoại di động"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            helperText="Tên danh mục hiển thị trên giao diện người dùng"
          />

          <FormInput
            label="Slug (Đường dẫn thân thiện)"
            placeholder="dien-thoai-di-dong"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            helperText="Tự động sinh từ tên danh mục"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <FormSelect
            label="Danh mục cha"
            placeholder="-- Chọn danh mục cha (để trống nếu là danh mục gốc) --"
            value={formData.parent_id || ''}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })
            }
            options={categories
              .filter((c) => !editingCategory || c.id !== editingCategory.id)
              .map((c) => ({ value: c.id, label: c.name }))}
            helperText="Để trống nếu là danh mục cấp cao nhất"
          />

          <FormInput
            label="Thứ tự sắp xếp"
            type="number"
            min="0"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
            helperText="Số nhỏ hơn sẽ hiển thị trước (0, 1, 2...)"
          />
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả các liên kết danh mục con hoặc sản phẩm có thể bị ảnh hưởng."
        confirmText="Xóa danh mục"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminCategoryList;
