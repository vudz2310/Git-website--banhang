import React, { useEffect, useState } from 'react';
import { AdminService } from '../services/adminService';
import type { User, ID } from '../../../api/types';
import { AdminModal } from '../components/AdminModal';
import { FormInput, FormSelect } from '../components/FormFields';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { PlusIcon, EditIcon, TrashIcon } from '../../../components/Icons';

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<ID | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'banned',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AdminService.getUsers();
      setUsers(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Tải danh sách users thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.full_name) {
      setError('Vui lòng điền đầy đủ email và họ tên');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingUser) {
        await AdminService.updateUser(editingUser.id, {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
        });
      } else {
        if (!formData.password) {
          setError('Vui lòng nhập mật khẩu cho tài khoản mới');
          setIsSubmitting(false);
          return;
        }

        await AdminService.createUser({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
        });
      }

      closeModal();
      loadUsers();
    } catch (e: any) {
      setError(e.message || 'Thao tác lưu thông tin người dùng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      status: user.status || 'active',
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await AdminService.deleteUser(deleteTargetId);
      setDeleteTargetId(null);
      loadUsers();
    } catch (e: any) {
      setError(e.message || 'Xóa người dùng thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'user',
      status: 'active',
    });
    setEditingUser(null);
    setShowModal(false);
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
        Admin
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        Khách hàng
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Hoạt động
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Tạm dừng
          </span>
        );
      case 'banned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Bị khóa
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Tài khoản & Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số: <span className="font-semibold text-gray-800">{users.length}</span> tài khoản trên hệ thống
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
          Thêm User Mới
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vai trò
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                        {(user.full_name || user.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(user.status || 'active')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(user.id)}
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

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">👤</div>
            <p className="font-medium text-gray-700">Chưa có người dùng nào</p>
            <p className="text-xs text-gray-400 mt-1">Bấm nút "Thêm User Mới" để tạo tài khoản đầu tiên.</p>
          </div>
        )}
      </div>

      {/* Standardized Form Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới'}
        subtitle={editingUser ? `Tài khoản: ${editingUser.email}` : 'Tạo tài khoản quản trị hoặc khách hàng'}
        onSubmit={handleSubmit}
        submitText={editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <FormInput
            label="Địa chỉ Email"
            type="email"
            placeholder="user@example.com"
            required
            disabled={editingUser !== null}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            helperText={editingUser ? 'Email không thể thay đổi sau khi tạo' : undefined}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {!editingUser && (
            <FormInput
              label="Mật khẩu khởi tạo"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText="Tối thiểu 6 ký tự"
            />
          )}

          <FormInput
            label="Số điện thoại"
            type="tel"
            placeholder="0912345678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <FormSelect
            label="Phân quyền vai trò"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
            options={[
              { value: 'user', label: 'Khách hàng (User)' },
              { value: 'admin', label: 'Quản trị viên (Admin)' },
            ]}
          />

          <FormSelect
            label="Trạng thái tài khoản"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'banned' })
            }
            options={[
              { value: 'active', label: 'Hoạt động (Active)' },
              { value: 'inactive', label: 'Tạm ngưng (Inactive)' },
              { value: 'banned', label: 'Khóa tài khoản (Banned)' },
            ]}
          />
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa tài khoản người dùng này? Thao tác này sẽ xóa toàn bộ dữ liệu liên quan."
        confirmText="Xóa tài khoản"
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
};

export default AdminUserList;
