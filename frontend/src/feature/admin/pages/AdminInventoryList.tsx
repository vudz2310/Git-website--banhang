import React, { useEffect, useState } from 'react';
import { AdminModal } from '../components/AdminModal';
import { FormInput } from '../components/FormFields';
import { EditIcon } from '../../../components/Icons';

interface InventoryItem {
  id: number;
  variant_id: number;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  variant_sku?: string;
  product_name?: string;
  color?: string;
  size?: string;
  price?: number;
}

const AdminInventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editThreshold, setEditThreshold] = useState(10);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      // Dữ liệu kho hàng ban đầu
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          variant_id: 1,
          quantity: 50,
          low_stock_threshold: 10,
          updated_at: '2025-01-01T10:00:00Z',
          variant_sku: 'IP15P-128-BLACK',
          product_name: 'iPhone 15 Pro',
          color: 'Đen',
          size: '128GB',
          price: 28990000,
        },
        {
          id: 2,
          variant_id: 2,
          quantity: 25,
          low_stock_threshold: 5,
          updated_at: '2025-01-01T10:00:00Z',
          variant_sku: 'IP15P-256-BLACK',
          product_name: 'iPhone 15 Pro',
          color: 'Đen',
          size: '256GB',
          price: 31990000,
        },
        {
          id: 3,
          variant_id: 3,
          quantity: 3,
          low_stock_threshold: 10,
          updated_at: '2025-01-01T10:00:00Z',
          variant_sku: 'MBA-M2-8-256',
          product_name: 'MacBook Air M2',
          color: 'Bạc',
          size: '8GB/256GB',
          price: 25000000,
        },
      ];
      setInventory(mockInventory);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách kho hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEditQuantity = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditThreshold(item.low_stock_threshold);
  };

  const handleSaveQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                quantity: Number(editQuantity) || 0,
                low_stock_threshold: Number(editThreshold) || 5,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setEditingItem(null);
    } catch (e: any) {
      setError(e.message || 'Cập nhật số lượng kho thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0)
      return { status: 'Hết hàng', color: 'bg-red-100 text-red-800 border-red-200' };
    if (quantity <= threshold)
      return { status: 'Sắp hết hàng', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { status: 'Còn hàng', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Kho & Tồn kho</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi số lượng hàng tồn theo biến thể sản phẩm và ngưỡng cảnh báo hết hàng
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sản phẩm & Biến thể
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số lượng tồn
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái kho
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {inventory.map((item) => {
                const stock = getStockStatus(item.quantity, item.low_stock_threshold);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.product_name}</div>
                      <div className="text-xs text-gray-500">
                        {item.color} • {item.size}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-mono">
                        {item.variant_sku || '—'}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                      <span className="text-xs text-gray-400 block">
                        (Ngưỡng: {item.low_stock_threshold})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stock.color}`}
                      >
                        {stock.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                      {formatDate(item.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditQuantity(item)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <EditIcon className="w-3.5 h-3.5 mr-1" />
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standardized Form Modal */}
      <AdminModal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Cập nhật Tồn kho"
        subtitle={
          editingItem ? `${editingItem.product_name} (${editingItem.color} - ${editingItem.size})` : ''
        }
        onSubmit={handleSaveQuantity}
        submitText="Lưu tồn kho"
        isLoading={isSubmitting}
        size="md"
      >
        <div className="space-y-4">
          <FormInput
            label="Số lượng sản phẩm trong kho"
            type="number"
            min="0"
            required
            value={editQuantity}
            onChange={(e) => setEditQuantity(Number(e.target.value) || 0)}
            helperText="Nhập số lượng thực tế hiện có trong kho"
          />

          <FormInput
            label="Ngưỡng cảnh báo sắp hết hàng"
            type="number"
            min="1"
            required
            value={editThreshold}
            onChange={(e) => setEditThreshold(Number(e.target.value) || 5)}
            helperText="Hệ thống sẽ chuyển trạng thái 'Sắp hết' khi tồn kho nhỏ hơn hoặc bằng số này"
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminInventoryList;
