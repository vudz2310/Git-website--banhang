import React, { useEffect, useState } from 'react';
import { BannerService } from '../../assets/api/bannerService';
import { UploadService } from '../../assets/api/uploadService';
import type { Banner } from '../../assets/api/bannerService';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    redirectUrl: '',
    isActive: true,
    sort_order: 0
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setUploadingFile(true);
    setError(null);
    try {
      if (files.length === 1) {
        // Upload single file and update image input in form
        const res = await UploadService.uploadSingle(files[0]);
        if (res.success) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          setSuccessMessage('Tải ảnh lên thành công!');
        }
      } else {
        // Upload multiple files and create banners immediately
        const uploadPromises = files.map((file) => UploadService.uploadSingle(file));
        const results = await Promise.all(uploadPromises);
        
        let successCount = 0;
        let lastSortOrder = banners.length > 0 ? Math.max(...banners.map(b => b.sort_order)) : 0;
        
        for (const res of results) {
          if (res.success) {
            lastSortOrder += 1;
            await BannerService.create({
              title: `Banner tự động ${lastSortOrder}`,
              image: res.url,
              redirectUrl: '/products',
              isActive: true,
              sort_order: lastSortOrder
            });
            successCount++;
          }
        }
        
        setSuccessMessage(`Đã tải lên và tạo thành công ${successCount} banner mới!`);
        loadBanners();
      }
    } catch (err: any) {
      console.error(err);
      setError('Tải ảnh lên thất bại: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset file input
    }
  };

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await BannerService.adminGetAll();
      if (res.success) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      redirectUrl: '/products',
      isActive: true,
      sort_order: banners.length + 1
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: banner.image,
      redirectUrl: banner.redirectUrl,
      isActive: banner.isActive,
      sort_order: banner.sort_order
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        // Update
        const res = await BannerService.update(editingBanner._id, formData);
        if (res.success) {
          setSuccessMessage('Cập nhật banner thành công!');
          loadBanners();
          handleCloseForm();
        }
      } else {
        // Create
        const res = await BannerService.create(formData);
        if (res.success) {
          setSuccessMessage('Thêm banner mới thành công!');
          loadBanners();
          handleCloseForm();
        }
      }
    } catch (err) {
      console.error(err);
      setError('Lưu thất bại. Vui lòng kiểm tra lại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này không?')) return;
    try {
      const res = await BannerService.delete(id);
      if (res.success) {
        setSuccessMessage('Xóa banner thành công!');
        loadBanners();
      }
    } catch (err) {
      console.error(err);
      setError('Xóa thất bại.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý Banner</h2>
          <p className="text-sm text-gray-500">Thiết lập các banner trượt ở đầu trang chủ.</p>
        </div>
        <div className="flex space-x-2">
          <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center">
            {uploadingFile ? (
              <span className="animate-pulse">Đang tải...</span>
            ) : (
              <span>+ Tải lên nhiều ảnh</span>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition-all shadow-sm"
          >
            + Thêm Banner mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="font-bold text-green-500 hover:text-green-700">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Thứ tự</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Đường dẫn</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Chưa có banner nào. Hãy bấm nút thêm mới!</td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{banner.sort_order}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={banner.image} alt={banner.title} className="w-24 h-12 object-cover rounded border" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">{banner.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{banner.redirectUrl || '/'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {banner.isActive ? 'Đang hoạt động' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditForm(banner)}
                          className="text-blue-600 hover:text-blue-950 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="text-red-600 hover:text-red-950"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingBanner ? 'Cập nhật Banner' : 'Tạo Banner mới'}
              </h3>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tiêu đề banner</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề giới thiệu banner..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hình ảnh banner</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nhập URL ảnh hoặc chọn file tải lên..."
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm border cursor-pointer font-medium flex items-center justify-center min-w-[90px] text-center">
                    {uploadingFile ? 'Tải...' : 'Chọn file'}
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
                  <div className="mt-2 relative rounded-md overflow-hidden border h-20 bg-gray-50 flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Đường dẫn click (Redirect URL)</label>
                <input
                  type="text"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ví dụ: /products"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    required
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Trạng thái kích hoạt</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="true">Hiển thị (Active)</option>
                    <option value="false">Ẩn (Inactive)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
