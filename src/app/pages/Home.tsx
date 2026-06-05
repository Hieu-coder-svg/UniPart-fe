/**
 * Home Page
 * Design: Modern Enterprise Minimalism
 */

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ROUTES } from "@/lib/constants";
import { Link, useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">UniHire</h1>
          </Link>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <span className="cursor-pointer font-medium text-text-secondary hover:text-primary transition-colors">
                    Đăng nhập
                  </span>
                </Link>
                <Link href="/register">
                  <span className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors font-medium shadow-sm">
                    Đăng ký
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text hidden sm:block">
                  Xin chào, {user?.fullName || user?.username}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation(ROLE_ROUTES[user?.role as keyof typeof ROLE_ROUTES] || "/")}
                  className="font-medium"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleLogout}
                  className="font-medium"
                >
                  Đăng xuất
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-6 leading-tight">
            Nền tảng tuyển dụng <br />
            <span className="text-primary">sinh viên hàng đầu</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed">
            Kết nối sinh viên ưu tú với các doanh nghiệp hàng đầu. Quản lý tuyển dụng, tìm kiếm việc làm và phát triển sự nghiệp trên một nền tảng duy nhất.
          </p>
          {!isAuthenticated ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <span className="cursor-pointer inline-block px-8 py-3.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-center shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5">
                    Đăng nhập ngay
                  </span>
                </Link>
                <Link href="/register">
                  <span className="cursor-pointer inline-block px-8 py-3.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-semibold text-center bg-white">
                    Tạo tài khoản mới
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <p className="text-lg text-text-secondary font-medium">Chào mừng trở lại, <span className="text-primary font-bold">{user?.fullName || user?.username}</span>!</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setLocation(ROLE_ROUTES[user?.role as keyof typeof ROLE_ROUTES] || "/")}
                  className="px-8 py-6 text-base font-semibold shadow-md"
                >
                  Đi đến Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="px-8 py-6 text-base font-semibold bg-white"
                >
                  Khám phá việc làm
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-backgroundAlt py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-text mb-4">Tính năng nổi bật</h3>
            <p className="text-text-secondary max-w-2xl mx-auto">Các công cụ mạnh mẽ giúp bạn tối ưu hóa quy trình tuyển dụng và tìm kiếm việc làm.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Dành cho Doanh nghiệp",
                description: "Đăng tin tuyển dụng miễn phí, quản lý hồ sơ ứng viên thông minh và tìm kiếm nhân tài dễ dàng.",
                icon: "🏢"
              },
              {
                title: "Dành cho Sinh viên",
                description: "Tạo CV chuyên nghiệp, tiếp cận hàng ngàn cơ hội thực tập và việc làm phù hợp với ngành học.",
                icon: "🎓"
              },
              {
                title: "Kết nối Thông minh",
                description: "Hệ thống gợi ý ứng viên và việc làm tự động dựa trên kỹ năng và yêu cầu công việc.",
                icon: "⚡"
              },
            ].map((feature) => (
               <div key={feature.title} className="bg-white border border-border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-4xl mb-4">{feature.icon}</div>
                 <h4 className="text-xl font-bold text-text mb-3">{feature.title}</h4>
                 <p className="text-text-secondary leading-relaxed">{feature.description}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-text-secondary">
          <h2 className="text-2xl font-bold text-primary mb-4">UniHire</h2>
          <p className="mb-6">Nền tảng kết nối sinh viên và doanh nghiệp hàng đầu.</p>
          <p className="text-sm">&copy; 2024 UniHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
