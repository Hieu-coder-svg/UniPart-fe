import { Check, Zap, Package, ShoppingCart, CreditCard, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function EmployerBuyPosts() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Gói mua theo số lượng
  const payPerPostPackages = [
    {
      id: "normal-1",
      type: "normal",
      quantity: 1,
      price: 50000,
      pricePerPost: 50000,
      code: "TN1",
      badge: null,
    },
    {
      id: "normal-3",
      type: "normal",
      quantity: 3,
      price: 135000,
      pricePerPost: 45000,
      code: "TN3",
      badge: "Tiết kiệm 10%",
      popular: false,
    },
    {
      id: "normal-5",
      type: "normal",
      quantity: 5,
      price: 200000,
      pricePerPost: 40000,
      code: "TN5",
      badge: "Tiết kiệm 20%",
      popular: true,
    },
  ];

  const urgentPackages = [
    {
      id: "urgent-1",
      type: "urgent",
      quantity: 1,
      price: 70000,
      pricePerPost: 70000,
      code: "TF1",
      badge: null,
    },
    {
      id: "urgent-3",
      type: "urgent",
      quantity: 3,
      price: 189000,
      pricePerPost: 63000,
      code: "TF3",
      badge: "Tiết kiệm 10%",
      popular: false,
    },
    {
      id: "urgent-5",
      type: "urgent",
      quantity: 5,
      price: 224000,
      pricePerPost: 44800,
      code: "TF5",
      badge: "Tiết kiệm 20%",
      popular: true,
    },
  ];

  // Gói theo tháng
  const monthlyPackages = [
    {
      id: "monthly-basic",
      name: "Basic",
      price: 2700000,
      normalPosts: 60,
      maxPerDay: 2,
      urgentPosts: 5,
      features: [
        "60 tin thường/tháng",
        "Tối đa 2 tin/ngày",
        "5 tin tuyển gấp",
        "Hỗ trợ email",
        "Thống kê cơ bản",
      ],
      gradient: "from-gray-500 to-gray-600",
      popular: false,
    },
    {
      id: "monthly-advance",
      name: "Advance",
      price: 6000000,
      normalPosts: 150,
      maxPerDay: 5,
      urgentPosts: 10,
      features: [
        "150 tin thường/tháng",
        "Tối đa 5 tin/ngày",
        "10 tin tuyển gấp",
        "Hỗ trợ ưu tiên",
        "Hiển thị nổi bật",
        "Thống kê chi tiết",
        "Quản lý ứng viên",
      ],
      gradient: "from-orange-500 to-red-500",
      popular: true,
    },
    {
      id: "monthly-premium",
      name: "Premium",
      price: 10500000,
      normalPosts: 300,
      maxPerDay: 10,
      urgentPosts: 20,
      features: [
        "300 tin thường/tháng",
        "Tối đa 10 tin/ngày",
        "20 tin tuyển gấp",
        "Hỗ trợ 24/7",
        "Hiển thị ưu tiên cao",
        "Phân tích chi tiết",
        "Tư vấn chiến lược",
        "Account manager riêng",
      ],
      gradient: "from-purple-500 to-pink-500",
      popular: false,
    },
  ];

  const handleBuyPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    // Implement purchase logic here
    alert(`Đang xử lý thanh toán cho gói: ${packageId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Mua tin tuyển dụng</span>
        </div>
        <h1 className="text-4xl mb-4">Chọn gói phù hợp với bạn</h1>
        <p className="text-xl text-gray-600">
          Linh hoạt mua theo số lượng hoặc đăng ký gói tháng để tiết kiệm chi phí
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">12,000+</div>
            <div className="text-blue-100">Tin đã đăng</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">95%</div>
            <div className="text-blue-100">Tỷ lệ tìm được ứng viên</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">3.5 ngày</div>
            <div className="text-blue-100">Thời gian tuyển trung bình</div>
          </div>
        </div>
      </div>

      {/* Mua theo số lượng - Tin thường */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tin tuyển dụng thường</h2>
            <p className="text-gray-600">Hiển thị trong danh sách tìm kiếm tiêu chuẩn</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {payPerPostPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                pkg.popular
                  ? "border-blue-500 transform hover:scale-105"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-lg">
                    Phổ biến nhất
                  </span>
                </div>
              )}
              {pkg.badge && !pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                    {pkg.badge}
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">{pkg.quantity}</div>
                <div className="text-gray-600">Tin tuyển dụng</div>
              </div>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(pkg.pricePerPost)}/tin
                </div>
              </div>
              <button
                onClick={() => handleBuyPackage(pkg.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  pkg.popular
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Mua ngay</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mua theo số lượng - Tin gấp */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tin tuyển gấp</h2>
            <p className="text-gray-600">Được đẩy lên top và hiển thị nổi bật với badge "Tuyển gấp"</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {urgentPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                pkg.popular
                  ? "border-orange-500 transform hover:scale-105"
                  : "border-orange-200 hover:border-orange-400"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Hot nhất
                  </span>
                </div>
              )}
              {pkg.badge && !pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                    {pkg.badge}
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">{pkg.quantity}</div>
                <div className="text-gray-700 font-medium">Tin tuyển gấp</div>
              </div>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(pkg.pricePerPost)}/tin
                </div>
              </div>
              <button
                onClick={() => handleBuyPackage(pkg.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                  pkg.popular
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-900 hover:from-orange-200 hover:to-yellow-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Mua ngay</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gói theo tháng */}
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Tiết kiệm hơn với gói tháng</span>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Gói đăng ký theo tháng</h2>
          <p className="text-gray-600">Phù hợp cho doanh nghiệp có nhu cầu tuyển dụng thường xuyên</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {monthlyPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
                pkg.popular
                  ? "border-orange-500 transform scale-105 md:scale-110"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full shadow-lg">
                    Được yêu thích nhất
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${pkg.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-sm text-gray-500">/ tháng</div>
              </div>
              <div className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-5 h-5 bg-gradient-to-br ${pkg.gradient} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleBuyPackage(pkg.id)}
                className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
                  pkg.popular
                    ? `bg-gradient-to-r ${pkg.gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Đăng ký ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ or Support Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
        <div className="max-w-3xl mx-auto text-center">
          <CreditCard className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Thanh toán an toàn & linh hoạt</h3>
          <p className="text-gray-700 mb-6">
            Chúng tôi chấp nhận thanh toán qua Ngân hàng, MoMo, ZaloPay, VNPay và thẻ quốc tế.
            Mọi giao dịch được bảo mật với công nghệ mã hóa SSL.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Visa", "Mastercard", "MoMo", "ZaloPay", "VNPay"].map((brand, idx) => (
              <div
                key={idx}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}