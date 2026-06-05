/**
 * Login Page
 */

import { useAuth } from "@/hooks/useAuth";
import { MESSAGES, ROLE_ROUTES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect nếu đã login (trường hợp refresh trang)
  useEffect(() => {
    if (user) {
      const roleRoute = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] || "/";
      setLocation(roleRoute);
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      await login(identifier, password);   // Gọi login

      // Redirect thủ công ngay sau khi login thành công
      const roleRoute = ROLE_ROUTES[user?.role as keyof typeof ROLE_ROUTES] || "/"; 
      // Lưu ý: user có thể chưa update ngay, nên ta sẽ redirect về "/" trước
      setLocation("/");   

      toast.success(MESSAGES.LOGIN_SUCCESS || "Đăng nhập thành công!");
    } catch (error: any) {
      const msg = error?.response?.data?.message 
               || error?.message 
               || "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(msg);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundAlt">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">UniHire</h1>
            <p className="text-text-secondary">Đăng nhập vào tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-text mb-2">
                Tên đăng nhập
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="student"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Student123"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Demo: <strong>student</strong> / <strong>Student123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}