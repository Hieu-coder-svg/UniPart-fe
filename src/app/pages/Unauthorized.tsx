import { useNavigate } from "react-router";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "ADMIN") {
      navigate("/admin");
    } else if (user.role === "MANAGER") {
      navigate("/manager");
    } else if (user.role === "EMPLOYER") {
      navigate("/employer/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          403 - Không có quyền truy cập
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-2">
          Bạn không có quyền truy cập vào trang này.
        </p>
        {user && (
          <p className="text-sm text-gray-400 mb-8">
            Tài khoản của bạn có vai trò:{" "}
            <span className="font-semibold text-gray-600">{user.role}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Về trang chủ của tôi
          </button>
        </div>
      </div>
    </div>
  );
}
