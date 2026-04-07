import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Shield,
  UserCircle,
  Building2,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../../assets/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function ManagerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/manager",
      icon: LayoutDashboard,
      label: "Tổng quan",
      exact: true,
    },
    {
      path: "/manager/packages",
      icon: Package,
      label: "Gói dịch vụ",
    },
    {
      path: "/manager/reports",
      icon: Bell,
      label: "Báo cáo",
      badge: 12,
    },
    {
      path: "/manager/users",
      icon: Users,
      label: "Người dùng",
    },
    {
      path: "/manager/analytics",
      icon: BarChart3,
      label: "Thống kê",
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
          collapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Logo & Toggle Button */}
        <div className={`p-6 border-b border-gray-200 ${collapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"}`}>
          {collapsed ? (
            <Link to="/manager" className="block">
              <img src={logoImage} alt="UniPart Manager" className="h-14" />
            </Link>
          ) : (
            <Link to="/manager" className="block">
              <img src={logoImage} alt="UniPart Manager" className="h-22" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? (
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
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={collapsed ? item.label : ""}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </div>
                {item.badge && !collapsed && (
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
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer group relative"
                title={user?.name || "Manager"}
              >
                {user?.name?.charAt(0).toUpperCase() || "M"}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  <div>{user?.name || "Manager"}</div>
                  <div className="text-xs text-gray-300">Quản trị hệ thống</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Đăng xuất
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    {user?.name || "Manager"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    Quản trị hệ thống
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
                <img src={logoImage} alt="UniPart Manager" className="h-22" />
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
                        ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg"
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
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{user?.name || "Manager"}</div>
                  <div className="text-xs text-gray-500 truncate">
                    Quản trị hệ thống
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
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
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
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UniPart Manager
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