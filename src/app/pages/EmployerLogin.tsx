import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, Building2, CheckCircle, ArrowLeft, Sparkles, User, Phone } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import logoImage from "figma:asset/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function EmployerLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerCompany, setRegisterCompany] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(loginEmail, loginPassword, "employer");
      if (success) {
        navigate("/employer/dashboard");
      } else {
        setError("Email hoặc mật khẩu không đúng");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate password match
    if (registerPassword !== registerConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    
    setLoading(true);

    try {
      const success = await register(
        registerName,
        registerEmail,
        registerPassword,
        "employer",
        { phone: registerPhone }
      );
      if (success) {
        navigate("/employer/dashboard");
      } else {
        setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-6">
            <div>
              <Link to="/employer">
                <img src={logoImage} alt="UniPart Employer" className="h-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <h1 className="text-3xl mb-2">
                Nền tảng tuyển dụng <br />
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  sinh viên hàng đầu
                </span>
              </h1>
              <p className="text-lg text-gray-600">
                Kết nối với hơn 10,000+ sinh viên ưu tú
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758873268364-15bef4162221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtJTIwbWVldGluZ3xlbnwxfHx8fDE3NzM3NTQxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Employer hiring"
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Đăng tin miễn phí</div>
                  <div className="text-xs text-gray-500">Không cần thanh toán trước</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">AI thông minh</div>
                  <div className="text-xs text-gray-500">Gợi ý ứng viên phù hợp nhất</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md">
                <div className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600">Sinh viên</div>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md">
                <div className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600">Công ty</div>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-md">
                <div className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">95%</div>
                <div className="text-sm text-gray-600">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl mb-2">
                {isLogin ? "Chào mừng trở li" : "Tạo tài khoản mới"}
              </h2>
              <p className="text-gray-600">
                {isLogin 
                  ? "Đăng nhập để quản lý tuyển dụng của bạn" 
                  : "Bắt đầu tuyển dụng sinh viên ngay hôm nay"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-3 rounded-lg transition-all font-medium ${ 
                  isLogin
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                  <label className="block text-sm mb-2 text-gray-700">Email doanh nghiệp</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="hr@company.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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
                  <button type="button" className="text-orange-600 hover:text-orange-700">
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                <div className="text-center text-sm">
                  <span className="text-gray-600">Bạn là sinh viên? </span>
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Đăng nhập tại đây
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Đăng nhập demo: bất kỳ email + mật khẩu ≥ 6 ký tự
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="0123456789"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đăng ký tài khoản"
                  )}
                </button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Bạn là sinh viên? </span>
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Đăng ký tại đây
                  </Link>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <button type="button" className="text-orange-600 hover:underline">
                    Điều khoản dịch vụ
                  </button>{" "}
                  và{" "}
                  <button type="button" className="text-orange-600 hover:underline">
                    Chính sách bảo mật
                  </button>
                </div>
              </form>
            )}

            {/* Mobile branding */}
            <div className="md:hidden mt-8 text-center">
              <Link to="/employer">
                <img src={logoImage} alt="UniPart Employer" className="h-20 mx-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}