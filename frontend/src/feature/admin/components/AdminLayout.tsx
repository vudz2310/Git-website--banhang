import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { AuthService } from "../../auth";
import {
  BoxIcon,
  LabelIcon,
  ListIcon,
  VoucherIcon,
  StarIcon,
  SettingsIcon,
  UserIcon,
  ChartBarIcon,
  ImageIcon,
  MenuIcon,
  XIcon,
} from "../../../components/Icons";

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      const user = AuthService.getUser();

      if (!user) {
        navigate("/login", {
          replace: true,
          state: {
            message: "Vui lòng đăng nhập để truy cập trang admin",
            intendedPath: location.pathname,
          },
        });
        return;
      }

      if (user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang admin!");
        navigate("/", { replace: true });
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [navigate, location.pathname]);

  // Đóng sidebar trên mobile khi chuyển trang
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: "/admin/products", label: "Sản phẩm", icon: BoxIcon },
    { path: "/admin/categories", label: "Danh mục", icon: LabelIcon },
    { path: "/admin/orders", label: "Đơn hàng", icon: ListIcon },
    { path: "/admin/users", label: "Khách hàng & Users", icon: UserIcon },
    { path: "/admin/vouchers", label: "Mã giảm giá", icon: VoucherIcon },
    { path: "/admin/reviews", label: "Đánh giá SP", icon: StarIcon },
    { path: "/admin/inventory", label: "Kho hàng", icon: ChartBarIcon },
    { path: "/admin/variants", label: "Biến thể SP", icon: SettingsIcon },
    { path: "/admin/banners", label: "Banner quảng cáo", icon: ImageIcon },
    { path: "/admin/settings", label: "Cấu hình hệ thống", icon: SettingsIcon },
  ];

  const currentUser = AuthService.getUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header - Full Width & Sticky */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>

              <Link to="/admin/products" className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  ⚡
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 text-lg hidden sm:inline-block">
                    Admin Portal
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                    PRO
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: User profile & Action */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="mr-1.5">🏪</span>
                <span className="hidden sm:inline">Xem website</span>
                <span className="sm:hidden">Web</span>
              </Link>

              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center shadow-inner">
                  {(currentUser?.full_name || currentUser?.email || "A")[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-800 leading-tight">
                    {currentUser?.full_name || "Quản trị viên"}
                  </div>
                  <div className="text-xs text-gray-500">{currentUser?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quản lý hệ thống
            </div>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {React.createElement(item.icon, {
                    className: `mr-3 w-5 h-5 transition-colors ${
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    }`,
                  })}
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-400 text-center">
              Phiên bản 1.0 • Admin Dashboard
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
