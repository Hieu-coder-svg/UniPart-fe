import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Shield as ShieldIcon,
  Database,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Flag,
  Package,
  BarChart3,
  Bell,
  Folder,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { adminService } from "../services/adminService";
import logoImage from "../../assets/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    adminService.getStats().then(res => {
      if (res.result) setPendingReports(res.result.pendingReports);
    }).catch(() => {});
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // --- ROLE GUARD ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }
  // --- END ROLE GUARD ---

  const menuItems: Array<{ path: string; icon: any; label: string; exact?: boolean; badge?: string | number }> = [
    {
      path: "/admin",
      icon: LayoutDashboard,
      label: "Tổng quan",
      exact: true,
    },
    {
      path: "/admin/packages",
      icon: Package,
      label: "Gói dịch vụ",
    },

    {
      path: "/admin/accounts",
      icon: ShieldCheck,
      label: "Quản lý tài khoản",
    },

    {
      path: "/admin/report",
      icon: Flag,
      label: "Báo cáo",
      badge: pendingReports > 0 ? pendingReports : undefined,
    },
    {
      path: "/admin/categories",
      icon: Folder,
      label: "Chuyên mục",
    },
    {
      path: "/admin/backup",
      icon: Database,
      label: "Sao lưu dữ liệu",
    },
    {
      path: "/admin/logs",
      icon: FileText,
      label: "Nhật ký hệ thống",
    },
    {
      path: "/admin/notifications",
      icon: Bell,
      label: "Thông báo",
    },
    {
      path: "/admin/settings",
      icon: Settings,
      label: "Cài đặt",
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 fixed h-full z-30 transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Logo */}
        <div
          className={`p-6 border-b border-gray-200 ${
            sidebarCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"
          }`}
        >
          <Link to="/" className="block">
            <img
              src={logoImage}
              alt="UniPart Admin"
              className={sidebarCollapsed ? "h-10 w-auto object-contain" : "h-14 w-auto object-contain"}
            />
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive(item.path, item.exact)
                        ? "bg-white/20 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className={`p-4 border-t border-gray-200 ${sidebarCollapsed ? "flex flex-col items-center" : ""}`}>
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{user?.name || "Admin"}</div>
                  <div className="text-xs text-gray-500 truncate">
                    Quản trị viên cấp cao
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold mb-3">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <Link
                to="/"
                className="block"
                onClick={() => setSidebarOpen(false)}
              >
                <img src={logoImage} alt="UniPart Admin" className="h-14 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path, item.exact)
                        ? "bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          isActive(item.path, item.exact)
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{user?.name || "Admin"}</div>
                  <div className="text-xs text-gray-500 truncate">
                    Quản trị viên cấp cao
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                UniPart Admin
              </span>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}