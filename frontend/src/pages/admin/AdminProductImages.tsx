import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductService } from '../../assets/api/productService';
import { AdminService } from '../../assets/api/adminService';
import { UploadService } from '../../assets/api/uploadService';
import type { Product, ProductImage } from '../../assets/api/types';

interface NewImageData {
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File | null;
}

const AdminProductImages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newImage, setNewImage] = useState<NewImageData>({ 
    url: '', 
    is_primary: false, 
    sort_order: 0,
    file: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProduct = async () => {
    if (!productId) return;
    try {
      const detail = await ProductService.getDetail(productId);
      setProduct(detail.product);
      setImages(detail.images);
    } catch (e: any) {
      setError(e.message || 'Tải thông tin sản phẩm thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Xử lý upload ảnh
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setNewImage(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file)
      }));
    } else {
      alert('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setNewImage(prev => ({
      ...prev,
      file: null,
      url: ''
    }));
  };

  const handleAddImage = async () => {
    if (!newImage.url.trim() && !newImage.file) return;
    
    setUploading(true);
    try {
      if (newImage.file) {
        const uploadRes = await UploadService.uploadSingle(newImage.file);
        if (uploadRes.success) {
          await AdminService.createProductImage(productId, {
            url: uploadRes.url,
            is_primary: newImage.is_primary,
            sort_order: newImage.sort_order
          });
        } else {
          throw new Error('Upload ảnh thất bại');
        }
      } else {
        // Sử dụng URL
        await AdminService.createProductImage(productId, {
          url: newImage.url,
          is_primary: newImage.is_primary,
          sort_order: newImage.sort_order
        });
      }
      
      setNewImage({ url: '', is_primary: false, sort_order: 0, file: null });
      loadProduct(); // Reload để lấy ảnh mới
    } catch (e: any) {
      setError(e.message || 'Thêm ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await AdminService.deleteProductImage(productId, imageId);
      loadProduct();
    } catch (e: any) {
      setError(e.message || 'Xóa ảnh thất bại');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!product) return <div>Sản phẩm không tồn tại</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quản lý ảnh: {product.name}</h1>
        <button onClick={() => loadProduct()} className="px-3 py-2 bg-gray-200 rounded">
          Làm mới
        </button>
      </div>

      {/* Form thêm ảnh mới */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thêm ảnh mới</h2>
        
        {/* Upload ảnh từ file */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Upload ảnh từ file:</label>
          
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-3">
              <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Chọn ảnh</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </label>
                <span className="text-gray-500"> hoặc kéo thả ảnh vào đây</span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF tối đa 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Hoặc nhập URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-600">
            Hoặc nhập URL ảnh:
          </label>
          <input
            type="url"
            value={newImage.url}
            onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Preview ảnh đã chọn */}
        {(newImage.url || newImage.file) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Ảnh đã chọn:</span>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-sm text-red-600 hover:text-red-800"
              >
                🗑️ Xóa ảnh
              </button>
            </div>
            <div className="relative">
              {newImage.url && (
                <img
                  src={newImage.url}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                  }}
                />
              )}
              {newImage.file && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  File mới
                </div>
              )}
            </div>
            {newImage.file && (
              <p className="text-xs text-green-600 mt-2">
                📂 {newImage.file.name} ({(newImage.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        {/* Các tùy chọn khác */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Thứ tự</label>
            <input
              type="number"
              value={newImage.sort_order}
              onChange={(e) => setNewImage({ ...newImage, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newImage.is_primary}
                onChange={(e) => setNewImage({ ...newImage, is_primary: e.target.checked })}
                className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Ảnh chính</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddImage}
              disabled={uploading || (!newImage.url.trim() && !newImage.file)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '🔄 Đang xử lý...' : '➕ Thêm ảnh'}
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách ảnh */}
      <div className="bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold p-6 border-b border-gray-200">Danh sách ảnh ({images.length})</h2>
        {images.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">Chưa có ảnh nào</p>
            <p className="text-sm">Hãy thêm ảnh đầu tiên cho sản phẩm này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {images.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Ảnh ${image.id}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiNEN0Q5RDEiLz4KPHBhdGggZD0iTTM1IDM1VjY1SDY1VjM1SDM1WiIgZmlsbD0iI0M3Q0QxQyIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">ID: {image.id}</span>
                    <span className="text-xs text-gray-500">Thứ tự: {image.sort_order}</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      image.is_primary 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {image.is_primary ? '🖼️ Ảnh chính' : '📷 Ảnh phụ'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductImages;
