import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Briefcase, Users, User, Home, Bookmark, LogOut, LogIn, PlusCircle } from "lucide-react";
import ChatBot from "./ChatBot";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "figma:asset/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Trang chủ" },
    { path: "/jobs", icon: Briefcase, label: "Việc làm" },
    { path: "/saved", icon: Bookmark, label: "Đã lưu" },
    { path: "/community", icon: Users, label: "Cộng đồng" },
    { path: "/profile", icon: User, label: "Hồ sơ" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src={logoImage} alt="UniPart" className="h-24" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Employer CTA Button */}
              <Link
                to="/employer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all ml-2 font-medium"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="whitespace-nowrap">Đăng tin tuyển dụng</span>
              </Link>
              
              {/* Divider */}
              {isAuthenticated && <div className="h-8 w-px bg-gray-200 mx-2"></div>}
              
              {/* User Badge or Login */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </nav>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-6 items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-2 py-2 ${
                isActive(item.path) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex flex-col items-center gap-1 px-2 py-2 text-gray-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Đăng xuất</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center gap-1 px-2 py-2 text-gray-600"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-xs">Đăng nhập</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Floating Employer Button */}
      <Link
        to="/employer"
        className="md:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <PlusCircle className="w-5 h-5" />
        <span className="text-sm whitespace-nowrap">Đăng tin</span>
      </Link>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}