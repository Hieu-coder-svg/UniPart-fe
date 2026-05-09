import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import {
  LayoutDashboard,
  Briefcase,
  Package,
  Users,
  MessageSquare,
  UserCircle2,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { EmployerChatBot } from "./EmployerChatBot";
import logoImage from "../../assets/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function EmployerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // --- ROLE GUARD ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/employer/login" replace />;
  }
  if (user.role !== "EMPLOYER") {
    return <Navigate to="/unauthorized" replace />;
  }
  // --- END ROLE GUARD ---

  const menuItems = [
    {
      path: "/employer/dashboard",
      icon: LayoutDashboard,
      label: "Tổng quan",
      exact: true,
      group: "main",
    },
    {
      path: "/employer/dashboard/jobs",
      icon: Briefcase,
      label: "Quản lý tin tuyển dụng",
      group: "main",
    },
    {
      path: "/employer/dashboard/applicants",
      icon: Users,
      label: "Ứng viên",
      group: "main",
    },
    {
      path: "/employer/dashboard/notifications",
      icon: Bell,
      label: "Thông báo",
      badge: unreadCount > 0 ? unreadCount : undefined,
      group: "main",
    },
    {
      path: "/employer/dashboard/pricing",
      icon: Package,
      label: "Gói dịch vụ",
      group: "business",
    },
    {
      path: "/employer/dashboard/billing",
      icon: CreditCard,
      label: "Thanh toán",
      group: "business",
    },
    {
      path: "/employer/dashboard/analytics",
      icon: BarChart3,
      label: "Thống kê",
      group: "business",
    },
    {
      path: "/employer/dashboard/settings",
      icon: UserCircle2,
      label: "Hồ sơ",
      group: "system",
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 fixed h-full z-30 transition-all duration-300 ${
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 ${sidebarCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"}`}>
          <Link to="/" className="block">
            <img 
              src={logoImage} 
              alt="UniPart Employer" 
              className={sidebarCollapsed ? "h-14" : "h-22"} 
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
            {/* Main group */}
            {menuItems.filter(item => item.group === "main").map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive(item.path, item.exact)
                        ? "bg-white/20"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {item.badge}
                  </div>
                )}
              </Link>
            ))}

            {/* Divider */}
            {!sidebarCollapsed && (
              <div className="my-4">
                <div className="border-t border-gray-200"></div>
              </div>
            )}
            {sidebarCollapsed && <div className="my-2 mx-4 border-t border-gray-200"></div>}

            {/* Business group */}
            {menuItems.filter(item => item.group === "business").map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            ))}

            {/* Divider */}
            {!sidebarCollapsed && (
              <div className="my-4">
                <div className="border-t border-gray-200"></div>
              </div>
            )}
            {sidebarCollapsed && <div className="my-2 mx-4 border-t border-gray-200"></div>}

            {/* System group */}
            {menuItems.filter(item => item.group === "system").map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "E"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.fullName || user?.username || "Nhà tuyển dụng"}</div>
              <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Nhà tuyển dụng
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/employer/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
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
                <img src={logoImage} alt="UniPart Employer" className="h-22" />
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
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "E"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user?.fullName || user?.username || "Nhà tuyển dụng"}</div>
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Nhà tuyển dụng
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/employer/login");
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
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      }`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Page title - shown on mobile */}
              <div className="lg:hidden text-lg">Dashboard</div>

              {/* Desktop: Search or breadcrumbs could go here */}
              <div className="hidden lg:block">
                <h1 className="text-xl text-gray-800">
                  Chào mừng trở lại, {user?.fullName || user?.username || "Nhà tuyển dụng"}!
                </h1>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                  onClick={() => navigate("/employer/dashboard/notifications")}
                  className="relative p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[0.9rem] h-3 px-1 text-[10px] leading-3 bg-red-500 rounded-full text-white font-bold flex items-center justify-center border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User menu - desktop only */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-sm">
                      {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "E"}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <Link
                        to="/employer/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircle2 className="w-4 h-4" />
                        <span className="text-sm">Hồ sơ</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          navigate("/employer/login");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 md:pb-12">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* About Section */}
              <div>
                <div className="mb-4">
                  <img src={logoImage} alt="UniPart Employer" className="h-22" />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Nền tảng tuyển dụng sinh viên hàng đầu Việt Nam. 
                  Kết nối doanh nghiệp với nguồn nhân lực trẻ chất lượng cao.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/employer/dashboard" className="text-sm hover:text-orange-400 transition-colors">
                      Tổng quan
                    </Link>
                  </li>
                  <li>
                    <Link to="/employer/dashboard/jobs" className="text-sm hover:text-orange-400 transition-colors">
                      Quản lý tin tuyển dụng
                    </Link>
                  </li>
                  <li>
                    <Link to="/employer/dashboard/applicants" className="text-sm hover:text-orange-400 transition-colors">
                      Ứng viên
                    </Link>
                  </li>
                  <li>
                    <Link to="/employer/dashboard/pricing" className="text-sm hover:text-orange-400 transition-colors">
                      Gói dịch vụ
                    </Link>
                  </li>
                  <li>
                    <Link to="/employer/dashboard/analytics" className="text-sm hover:text-orange-400 transition-colors">
                      Thống kê
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                      Trung tâm trợ giúp
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                      Hướng dẫn đăng tin
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                      Điều khoản sử dụng
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                      Chính sách bảo mật
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                      Câu hỏi thường gặp
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-orange-400" />
                    <span>268 Lý Thường Kiệt, Quận 10, TP. HCM</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 flex-shrink-0 text-orange-400" />
                    <a href="tel:+84123456789" className="hover:text-orange-400 transition-colors">
                      +84 123 456 789
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 flex-shrink-0 text-orange-400" />
                    <a href="mailto:employer@unipart.vn" className="hover:text-orange-400 transition-colors">
                      employer@unipart.vn
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} UniPart Employer. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm">
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Bản đồ trang
                  </a>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    An toàn & Bảo mật
                  </a>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Accessibility
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* AI ChatBot */}
      <EmployerChatBot />
    </div>
  );
}