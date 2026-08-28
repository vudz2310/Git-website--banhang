import React, { useEffect, useState } from 'react';
import type { Order, OrderItem, OrderItemWithDetails, ID } from '../../../api/types';
import { AdminService } from '../services/adminService';
import { OrderService } from '../../orders';
import { AdminModal } from '../components/AdminModal';
import { FormSelect } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { RefreshIcon, TrashIcon } from '../../../components/Icons';

interface OrderWithItems extends Order {
  items?: OrderItem[];
  user_name?: string;
  full_name?: string;
  email?: string;
}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Editable statuses in modal
  const [statusForm, setStatusForm] = useState({
    status: '',
    payment_status: '',
    shipping_status: '',
  });

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<ID | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getOrders();
      setOrders(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách đơn hàng thất bại');
      // Fallback mock data
      setOrders([
        {
          id: 1,
          user_id: 1,
          code: 'ORD001',
          status: 'pending',
          subtotal: 1000000,
          discount: 100000,
          shipping_fee: 50000,
          tax: 50000,
          total: 1000000,
          currency: 'VND',
          payment_status: 'pending',
          shipping_status: 'pending',
          placed_at: '2025-01-01T10:00:00Z',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
          full_name: 'Nguyễn Văn A',
          email: 'nguyenvana@gmail.com',
        },
        {
          id: 2,
          user_id: 2,
          code: 'ORD002',
          status: 'completed',
          subtotal: 2000000,
          discount: 0,
          shipping_fee: 50000,
          tax: 100000,
          total: 2150000,
          currency: 'VND',
          payment_status: 'success',
          shipping_status: 'delivered',
          placed_at: '2025-01-02T14:00:00Z',
          created_at: '2025-01-02T14:00:00Z',
          updated_at: '2025-01-02T16:00:00Z',
          full_name: 'Trần Thị B',
          email: 'tranthib@gmail.com',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderDetail = async (order: OrderWithItems) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status || 'pending',
      payment_status: order.payment_status || 'pending',
      shipping_status: order.shipping_status || 'pending',
    });

    try {
      setLoadingItems(true);
      const items = await OrderService.getOrderItemsWithDetails(order.id);
      setOrderItems(items || []);
    } catch (err: any) {
      console.error('Error loading order items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdatingStatus(true);
      if (statusForm.status !== selectedOrder.status) {
        await AdminService.updateOrderStatus(selectedOrder.id, statusForm.status);
      }
      if (statusForm.payment_status !== selectedOrder.payment_status) {
        await AdminService.updatePaymentStatus(selectedOrder.id, statusForm.payment_status);
      }
      if (statusForm.shipping_status !== selectedOrder.shipping_status) {
        await AdminService.updateShippingStatus(selectedOrder.id, statusForm.shipping_status);
      }

      setSelectedOrder(null);
      loadOrders();
    } catch (err: any) {
      setError(err.message || 'Cập nhật trạng thái đơn hàng thất bại');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await AdminService.deleteOrder(deleteTargetId);
      setDeleteTargetId(null);
      loadOrders();
    } catch (e: any) {
      setError(e.message || 'Xóa đơn hàng thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Chờ xử lý</span>;
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Đã thanh toán</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Đang giao</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Đã hủy</span>;
      case 'refunded':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Đã hoàn tiền</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Chưa thanh toán</span>;
      case 'refunded':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">Đã hoàn tiền</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">Thất bại</span>;
    }
  };

  if (loading && orders.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{orders.length}</span> đơn hàng phát sinh
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshIcon className="w-4 h-4 mr-1.5" />
          Làm mới danh sách
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

      {/* Orders Table Container with responsive layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="w-32 px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="w-32 px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="w-32 px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái đơn
                </th>
                <th className="w-32 px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="w-36 px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="w-28 px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openOrderDetail(order)}
                      className="font-mono font-bold text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {order.code || `#ORD-${order.id}`}
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {order.full_name || order.user_name || `User #${order.user_id}`}
                    </div>
                    {order.email && <div className="text-xs text-gray-500">{order.email}</div>}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    {getOrderStatusBadge(order.status)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    {getPaymentStatusBadge(order.payment_status)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                    {formatDate(order.placed_at || order.created_at)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(order.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa đơn hàng"
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

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-medium text-gray-700">Chưa có đơn hàng nào</p>
            <p className="text-xs text-gray-400 mt-1">Khi khách hàng đặt hàng, danh sách sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>

      {/* Order Details & Status Update Modal */}
      <AdminModal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết Đơn hàng ${selectedOrder?.code || `#ORD-${selectedOrder?.id}`}`}
        subtitle={`Ngày đặt: ${formatDate(selectedOrder?.placed_at || selectedOrder?.created_at)}`}
        onSubmit={handleUpdateStatus}
        submitText="Cập nhật trạng thái"
        isLoading={isUpdatingStatus}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Control Card */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                Cập nhật trạng thái đơn hàng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormSelect
                  label="Trạng thái đơn hàng"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  options={[
                    { value: 'pending', label: 'Chờ xử lý' },
                    { value: 'paid', label: 'Đã thanh toán' },
                    { value: 'shipped', label: 'Đang giao hàng' },
                    { value: 'completed', label: 'Hoàn thành' },
                    { value: 'cancelled', label: 'Đã hủy' },
                    { value: 'refunded', label: 'Hoàn tiền' },
                  ]}
                />

                <FormSelect
                  label="Trạng thái thanh toán"
                  value={statusForm.payment_status}
                  onChange={(e) => setStatusForm({ ...statusForm, payment_status: e.target.value })}
                  options={[
                    { value: 'pending', label: 'Chưa thanh toán' },
                    { value: 'success', label: 'Thanh toán thành công' },
                    { value: 'refunded', label: 'Đã hoàn tiền' },
                    { value: 'failed', label: 'Thanh toán thất bại' },
                  ]}
                />

                <FormSelect
                  label="Trạng thái vận chuyển"
                  value={statusForm.shipping_status}
                  onChange={(e) => setStatusForm({ ...statusForm, shipping_status: e.target.value })}
                  options={[
                    { value: 'pending', label: 'Chờ đóng gói' },
                    { value: 'processing', label: 'Đang xử lý' },
                    { value: 'shipped', label: 'Đang vận chuyển' },
                    { value: 'delivered', label: 'Đã giao hàng' },
                    { value: 'cancelled', label: 'Hủy giao hàng' },
                  ]}
                />
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Thông tin khách hàng
                </h4>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedOrder.full_name || selectedOrder.user_name || 'Khách vãng lai'}
                </p>
                {selectedOrder.email && <p className="text-xs text-gray-600 mt-1">Email: {selectedOrder.email}</p>}
                <p className="text-xs text-gray-500 mt-1">Mã khách hàng: #{selectedOrder.user_id}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Tổng kết tài chính
                </h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatCurrency(selectedOrder.shipping_fee || 0)}</span>
                  </div>
                  {selectedOrder.discount ? (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá voucher:</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Danh sách sản phẩm trong đơn
              </h4>
              {loadingItems ? (
                <div className="p-6 text-center text-xs text-gray-500">Đang tải sản phẩm...</div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Sản phẩm</th>
                        <th className="px-4 py-2.5 text-center font-semibold text-gray-600">Số lượng</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-gray-600">Đơn giá</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-gray-600">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(orderItems.length > 0 ? orderItems : selectedOrder.items || []).map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <div>{(item as any).name_snapshot || (item as any).product_name || `Sản phẩm #${item.product_id}`}</div>
                            {(item as any).sku_snapshot && (
                              <div className="text-[11px] text-gray-400 font-mono">{(item as any).sku_snapshot}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700">
                            x{item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(item.total || item.unit_price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa Đơn hàng"
        message="Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này sẽ xóa vĩnh viễn dữ liệu đơn hàng khỏi hệ thống."
        confirmText="Xóa đơn hàng"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminOrderList;
