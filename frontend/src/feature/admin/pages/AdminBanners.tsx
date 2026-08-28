import React, { useEffect, useState } from 'react';
import { BannerService } from '../services/bannerService';
import { UploadService } from '../../../api/uploadService';
import type { Banner } from '../services/bannerService';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSwitch } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../components/Icons';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    redirectUrl: '',
    isActive: true,
    sort_order: 0,
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await BannerService.adminGetAll();
      if (res.success) {
        setBanners(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setUploadingFile(true);
    setError(null);
    try {
      if (files.length === 1) {
        const res = await UploadService.uploadSingle(files[0]);
        if (res.success) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          setSuccessMessage('Tải ảnh lên thành công!');
        }
      } else {
        const uploadPromises = files.map((file) => UploadService.uploadSingle(file));
        const results = await Promise.all(uploadPromises);

        let successCount = 0;
        let lastSortOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.sort_order)) : 0;

        for (const res of results) {
          if (res.success) {
            lastSortOrder += 1;
            await BannerService.create({
              title: `Banner mới ${lastSortOrder}`,
              image: res.url,
              redirectUrl: '/products',
              isActive: true,
              sort_order: lastSortOrder,
            });
            successCount++;
          }
        }

        setSuccessMessage(`Đã tải lên và tạo thành công ${successCount} banner mới!`);
        loadBanners();
      }
    } catch (err: any) {
      setError('Tải ảnh lên thất bại: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleOpenCreateForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      redirectUrl: '/products',
      isActive: true,
      sort_order: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditForm = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: banner.image,
      redirectUrl: banner.redirectUrl || '/products',
      isActive: banner.isActive,
      sort_order: banner.sort_order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      setError('Vui lòng điền tiêu đề và tải lên/nhập link hình ảnh');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingBanner) {
        const res = await BannerService.update(editingBanner._id, formData);
        if (res.success) {
          setSuccessMessage('Cập nhật banner thành công!');
          setIsModalOpen(false);
          loadBanners();
        }
      } else {
        const res = await BannerService.create(formData);
        if (res.success) {
          setSuccessMessage('Thêm banner mới thành công!');
          setIsModalOpen(false);
          loadBanners();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lưu banner thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      const res = await BannerService.delete(deleteTargetId);
      if (res.success) {
        setSuccessMessage('Xóa banner thành công!');
        setDeleteTargetId(null);
        loadBanners();
      }
    } catch (err: any) {
      setError(err.message || 'Xóa banner thất bại');
    } finally {
      setIsDeleting(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Banner & Trình chiếu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{banners.length}</span> banner trình chiếu trên trang chủ
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm cursor-pointer transition-all">
            {uploadingFile ? (
              <span className="animate-pulse">Đang tải...</span>
            ) : (
              <span>📸 Tải nhiều ảnh</span>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploadingFile}
            />
          </label>

          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-1.5" />
            Thêm Banner Mới
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Banners Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đường dẫn điều hướng
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
              {banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-700 text-sm">
                    {banner.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-28 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{banner.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                      {banner.redirectUrl || '/'}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {banner.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditForm(banner)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(banner._id)}
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

        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="font-medium text-gray-700">Chưa có banner nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Thêm Banner Mới" hoặc tải ảnh lên để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* Standardized Form Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
        subtitle="Thiết lập hình ảnh, tiêu đề và liên kết điều hướng"
        onSubmit={handleSubmit}
        submitText={editingBanner ? 'Cập nhật' : 'Tạo Banner'}
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="space-y-4">
          <FormInput
            label="Tiêu đề Banner"
            placeholder="VD: Siêu Sale Khai Trương Giảm 50%"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hình ảnh Banner <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="Nhập URL ảnh hoặc bấm Tải ảnh..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <label className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer flex-shrink-0 transition-colors flex items-center">
                <span>Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFile}
                />
              </label>
            </div>
            {formData.image && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 max-h-40 bg-gray-50 flex items-center justify-center">
                <img src={formData.image} alt="Preview" className="h-full object-contain max-h-40" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormInput
              label="Đường dẫn liên kết (Link)"
              placeholder="/products hoặc /products/iphone-15"
              value={formData.redirectUrl}
              onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
              helperText="Đường dẫn khi khách hàng bấm vào banner"
            />

            <FormInput
              label="Thứ tự hiển thị"
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
              helperText="Số nhỏ hơn sẽ hiển thị trước"
            />
          </div>

          <div className="pt-2">
            <FormSwitch
              label="Hiển thị banner trên trang chủ"
              description="Cho phép banner hiển thị trong slide chạy ngoài trang chủ"
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa Banner"
        message="Bạn có chắc chắn muốn xóa banner này không? Banner sẽ không còn xuất hiện trên trang chủ."
        confirmText="Xóa banner"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminBanners;
