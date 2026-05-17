import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Briefcase, Users, User, Home, Bookmark, LogOut, LogIn,
  PlusCircle, Bell, FileText, LayoutDashboard, ChevronDown,
  Settings, GraduationCap,
} from "lucide-react";
import ChatBot from "./ChatBot";
import { EmployerChatBot } from "./EmployerChatBot";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import logoImage from "../../assets/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";
import { useState, useRef, useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const hasUnread = unreadCount > 0;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEmployer = user?.role === "EMPLOYER";
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  const getRoleLabel = () => {
    switch (user?.role) {
      case "ADMIN": return "Quản trị viên";
      case "MANAGER": return "Quản lý";
      case "EMPLOYER": return "Nhà tuyển dụng";
      default: return "Sinh viên";
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case "ADMIN": return "/admin";
      case "MANAGER": return "/manager";
      case "EMPLOYER": return "/employer/dashboard";
      default: return "/profile";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { path: "/", icon: Home, label: "Trang chủ" },
    { path: "/jobs", icon: Briefcase, label: "Việc làm" },
  ];

  if (!isAdmin) {
    navItems.push({ path: "/saved", icon: Bookmark, label: "Đã lưu" });
  }

  navItems.push({ path: "/community", icon: Users, label: "Cộng đồng" });


  if (user?.role === "STUDENT") {
    navItems.splice(navItems.length - 1, 0, { path: "/student/applications", icon: FileText, label: "Ứng tuyển" });
  }

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src={logoImage} alt="UniPart" className="h-24" />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">

              {/* EMPLOYER nav */}
              {isEmployer ? (
                <>
                  <Link
                    to="/employer/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname.startsWith("/employer/dashboard")
                        ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/employer/dashboard/jobs"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span>Quản lý tin</span>
                  </Link>
                  <Link
                    to="/employer/dashboard/applicants"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Ứng viên</span>
                  </Link>
                  <Link
                    to="/employer/dashboard/jobs"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all ml-2"
                  >
                    <PlusCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Đăng tin</span>
                  </Link>
                </>
              ) : (
                /* STUDENT / GUEST nav */
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/60"
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                      {/* Active underline pill */}
                      {isActive(item.path) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* ── Right Actions ── */}
            <div className="hidden md:flex items-center gap-2">

              {isAuthenticated ? (
                <>
                  {/* Bell */}
                  <Link
                    to={isEmployer ? "/employer/dashboard/notifications" : "/notifications"}
                    className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Thông báo"
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 text-[10px] leading-4 bg-red-500 rounded-full text-white font-bold flex items-center justify-center border-2 border-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Divider */}
                  <div className="h-7 w-px bg-gray-200 mx-1" />

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all hover:shadow-md ${
                        isEmployer
                          ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-300"
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                          isEmployer
                            ? "bg-gradient-to-br from-orange-500 to-red-600"
                            : "bg-gradient-to-br from-blue-500 to-indigo-600"
                        }`}
                      >
                        {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className={`text-xs font-semibold max-w-[110px] truncate leading-tight ${
                          isEmployer ? "text-orange-700" : isAdmin ? "text-red-700" : "text-blue-700"
                        }`}>
                          {user?.fullName || user?.username}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight">
                          {getRoleLabel()}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow ${
                              isEmployer
                                ? "bg-gradient-to-br from-orange-500 to-red-600"
                                : "bg-gradient-to-br from-blue-500 to-indigo-600"
                            }`}>
                              {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {user?.fullName || user?.username}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                {isEmployer ? (
                                  <><Briefcase className="w-3 h-3" /> {getRoleLabel()}</>
                                ) : isAdmin || isManager ? (
                                  <><Settings className="w-3 h-3" /> {getRoleLabel()}</>
                                ) : (
                                  <><GraduationCap className="w-3 h-3" /> {getRoleLabel()}</>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            {isAdmin || isManager ? "Dashboard" : "Hồ sơ của tôi"}
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Not logged in */
                <div className="flex items-center gap-2">
                  <Link
                    to="/employer/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all"
                  >
                    <Briefcase className="w-4 h-4" />
                    Đăng nhập với nhà tuyển dụng
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 z-50 shadow-lg">
        <div className="grid grid-cols-6 items-center h-16 px-1">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl mx-0.5 transition-all ${
                isActive(item.path)
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-1 py-2 text-red-500 rounded-xl mx-0.5"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium">Thoát</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center gap-0.5 px-1 py-2 text-gray-500 rounded-xl mx-0.5"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-medium">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Floating Employer Button */}
      {isEmployer && (
        <Link
          to="/employer/dashboard/jobs"
          className="md:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm whitespace-nowrap font-medium">Đăng tin</span>
        </Link>
      )}

      {/* ChatBot - role-aware */}
      {isEmployer ? <EmployerChatBot /> : <ChatBot />}
    </div>
  );
}