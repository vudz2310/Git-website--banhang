import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../api/http';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSelect, FormTextarea, FormSwitch } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../components/Icons';

interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
}

const AdminVoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 100,
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  const [assignForm, setAssignForm] = useState({
    user_id: '',
    voucher_id: '',
    assign_to_all: false,
  });

  useEffect(() => {
    loadVouchers();
    loadUsers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/vouchers?admin=1`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Tải danh sách voucher thất bại');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?admin=1`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const openCreateModal = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    setEditingVoucher(null);
    setVoucherForm({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_discount: 50000,
      usage_limit: 100,
      valid_from: today.toISOString().slice(0, 16),
      valid_until: nextMonth.toISOString().slice(0, 16),
      is_active: true,
    });
    setShowVoucherModal(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setVoucherForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_amount: voucher.min_order_amount || 0,
      max_discount: voucher.max_discount || 0,
      usage_limit: voucher.usage_limit || 1,
      valid_from: voucher.valid_from ? voucher.valid_from.slice(0, 16) : '',
      valid_until: voucher.valid_until ? voucher.valid_until.slice(0, 16) : '',
      is_active: voucher.is_active,
    });
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.code.trim() || !voucherForm.name.trim()) {
      setError('Vui lòng nhập mã và tên voucher');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingVoucher
        ? `${API_BASE_URL}/vouchers/${editingVoucher.id}`
        : `${API_BASE_URL}/vouchers`;

      const method = editingVoucher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(voucherForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Lưu voucher thất bại');
      }

      setShowVoucherModal(false);
      loadVouchers();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.voucher_id) {
      setError('Vui lòng chọn voucher cần gán');
      return;
    }
    if (!assignForm.assign_to_all && !assignForm.user_id) {
      setError('Vui lòng chọn khách hàng hoặc tích chọn gán cho tất cả');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/user-vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(assignForm),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Gán voucher thất bại');
      }

      setShowAssignModal(false);
      setAssignForm({ user_id: '', voucher_id: '', assign_to_all: false });
    } catch (err: any) {
      setError(err.message || 'Gán voucher thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVoucherStatus = async (voucherId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${voucherId}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        loadVouchers();
      }
    } catch (err) {
      console.error('Error toggling voucher status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_BASE_URL}/vouchers/${deleteTargetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteTargetId(null);
        loadVouchers();
      } else {
        throw new Error('Xóa voucher thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa voucher');
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
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
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Voucher & Mã giảm giá</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{vouchers.length}</span> voucher đã tạo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            🎁 Gán Voucher
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-1.5" />
            Tạo Voucher Mới
          </button>
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

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã & Tên Voucher
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mức giảm
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đơn tối thiểu
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đã dùng / Giới hạn
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thời hạn
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
              {vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                        {voucher.code}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{voucher.name}</div>
                    {voucher.description && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">{voucher.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {voucher.discount_type === 'percentage' ? (
                      <div>
                        <span className="text-emerald-600 font-bold">{voucher.discount_value}%</span>
                        {voucher.max_discount ? (
                          <div className="text-xs text-gray-400 font-normal">
                            Tối đa: {formatCurrency(voucher.max_discount)}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-blue-600 font-bold">{formatCurrency(voucher.discount_value)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(voucher.min_order_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-gray-900">{voucher.used_count}</span>
                    <span className="text-xs text-gray-400"> / {voucher.usage_limit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                    <div>{formatDate(voucher.valid_from)}</div>
                    <div className="text-gray-400">đến {formatDate(voucher.valid_until)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleVoucherStatus(voucher.id, voucher.is_active)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        voucher.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {voucher.is_active ? '● Đang bật' : '○ Đang tắt'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(voucher)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(voucher.id)}
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

        {vouchers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">🎟️</div>
            <p className="font-medium text-gray-700">Chưa có voucher nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Tạo Voucher Mới" để tạo mã giảm giá đầu tiên.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Voucher Modal */}
      <AdminModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher Khuyến Mãi Mới'}
        subtitle={editingVoucher ? `Mã: ${editingVoucher.code}` : 'Thiết lập mã giảm giá và điều kiện áp dụng'}
        onSubmit={handleSaveVoucher}
        submitText={editingVoucher ? 'Cập nhật' : 'Tạo Voucher'}
        isLoading={isSubmitting}
        size="xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Mã Voucher"
            placeholder="VD: SALE2025, FREESHIP..."
            required
            value={voucherForm.code}
            onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
            helperText="Khách hàng sẽ nhập mã này khi thanh toán"
          />

          <FormInput
            label="Tên chương trình voucher"
            placeholder="VD: Giảm 20% đơn từ 200k"
            required
            value={voucherForm.name}
            onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })}
          />
        </div>

        <FormTextarea
          label="Mô tả chi tiết"
          placeholder="Mô tả điều kiện hoặc ghi chú về chương trình..."
          rows={2}
          value={voucherForm.description}
          onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <FormSelect
            label="Loại giảm giá"
            value={voucherForm.discount_type}
            onChange={(e) =>
              setVoucherForm({
                ...voucherForm,
                discount_type: e.target.value as 'percentage' | 'fixed',
              })
            }
            options={[
              { value: 'percentage', label: 'Theo phần trăm (%)' },
              { value: 'fixed', label: 'Số tiền cố định (VNĐ)' },
            ]}
          />

          <FormInput
            label={voucherForm.discount_type === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
            type="number"
            min="0"
            required
            value={voucherForm.discount_value}
            onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: Number(e.target.value) || 0 })}
          />

          {voucherForm.discount_type === 'percentage' && (
            <FormInput
              label="Giảm tối đa (VNĐ)"
              type="number"
              min="0"
              value={voucherForm.max_discount}
              onChange={(e) => setVoucherForm({ ...voucherForm, max_discount: Number(e.target.value) || 0 })}
              helperText="0 = Không giới hạn"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <FormInput
            label="Giá trị đơn hàng tối thiểu (VNĐ)"
            type="number"
            min="0"
            value={voucherForm.min_order_amount}
            onChange={(e) => setVoucherForm({ ...voucherForm, min_order_amount: Number(e.target.value) || 0 })}
            helperText="Đơn hàng phải đạt mức này để được áp dụng"
          />

          <FormInput
            label="Số lượt sử dụng tối đa"
            type="number"
            min="1"
            required
            value={voucherForm.usage_limit}
            onChange={(e) => setVoucherForm({ ...voucherForm, usage_limit: Number(e.target.value) || 1 })}
            helperText="Tổng số lần mã có thể được sử dụng"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <FormInput
            label="Thời gian bắt đầu có hiệu lực"
            type="datetime-local"
            required
            value={voucherForm.valid_from}
            onChange={(e) => setVoucherForm({ ...voucherForm, valid_from: e.target.value })}
          />

          <FormInput
            label="Thời gian kết thúc hiệu lực"
            type="datetime-local"
            required
            value={voucherForm.valid_until}
            onChange={(e) => setVoucherForm({ ...voucherForm, valid_until: e.target.value })}
          />
        </div>

        <div className="pt-2">
          <FormSwitch
            label="Kích hoạt voucher ngay"
            description="Cho phép khách hàng áp dụng voucher này trên trang thanh toán"
            checked={voucherForm.is_active}
            onChange={(checked) => setVoucherForm({ ...voucherForm, is_active: checked })}
          />
        </div>
      </AdminModal>

      {/* Assign Voucher Modal */}
      <AdminModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Gán Voucher cho Khách hàng"
        subtitle="Thêm voucher trực tiếp vào ví ưu đãi của khách hàng"
        onSubmit={handleAssignVoucher}
        submitText="Gán Voucher"
        isLoading={isSubmitting}
        size="md"
      >
        <div className="space-y-4">
          <FormSelect
            label="Chọn Voucher"
            placeholder="-- Chọn voucher --"
            required
            value={assignForm.voucher_id}
            onChange={(e) => setAssignForm({ ...assignForm, voucher_id: e.target.value })}
            options={vouchers.map((v) => ({
              value: v.id,
              label: `${v.code} - ${v.name} (${
                v.discount_type === 'percentage' ? `${v.discount_value}%` : formatCurrency(v.discount_value)
              })`,
            }))}
          />

          <FormSwitch
            label="Gán cho tất cả khách hàng"
            description="Tất cả tài khoản trong hệ thống đều sẽ nhận được voucher này"
            checked={assignForm.assign_to_all}
            onChange={(checked) => setAssignForm({ ...assignForm, assign_to_all: checked })}
          />

          {!assignForm.assign_to_all && (
            <FormSelect
              label="Chọn Khách hàng cụ thể"
              placeholder="-- Chọn khách hàng --"
              required={!assignForm.assign_to_all}
              value={assignForm.user_id}
              onChange={(e) => setAssignForm({ ...assignForm, user_id: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.full_name} (${u.email})`,
              }))}
            />
          )}
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa voucher"
        message="Bạn có chắc chắn muốn xóa voucher này? Khách hàng sẽ không thể sử dụng mã này được nữa."
        confirmText="Xóa voucher"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminVoucherList;
