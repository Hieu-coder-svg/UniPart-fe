import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterStudentForm } from "../../components/auth/RegisterStudentForm";
import type { StudentRegistrationRequest } from "../../../types/auth";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
const logoImage = "/src/assets/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, registerStudent } = useAuth();

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string || loginUsername;
    const password = formData.get("password") as string || loginPassword;

    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: StudentRegistrationRequest) => {
    setError("");
    setLoading(true);

    try {
      await registerStudent(data);
      navigate("/verify-otp");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzczNDE4MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Students"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Chào mừng đến với UniPart</h1>
          <p className="text-2xl text-cyan-100 text-center max-w-lg">
            Nền tảng tìm việc bán thời gian hàng đầu dành cho sinh viên
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-cyan-100">Sinh viên</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-cyan-100">Việc làm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo on desktop */}
          <div className="hidden md:block mb-8">
            <Link to="/">
              <img src={logoImage} alt="UniPart" className="h-22 mx-auto" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-3 rounded-lg transition-all font-medium ${
                  isLogin
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-3 rounded-lg transition-all font-medium ${
                  !isLogin
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Đăng ký</span>
                </div>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>

                <div className="text-center text-sm border-t border-gray-200 pt-4">
                  <span className="text-gray-600">Bạn là nhà tuyển dụng? </span>
                  <Link to="/employer/login" className="text-blue-600 hover:underline font-medium">
                    Đăng nhập tại đây
                  </Link>
                </div>
              </form>
            ) : (
              <RegisterStudentForm onSubmit={handleRegister} isLoading={loading} />
            )}
          </div>

          {/* Mobile branding */}
          <div className="md:hidden mt-8 text-center">
            <Link to="/">
              <img src={logoImage} alt="UniPart" className="h-24 mx-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}