import { Plus, Edit, Trash2, CheckCircle, TrendingUp } from "lucide-react";

export default function ManagerPackages() {
  // Pricing by quantity
  const quantityPricing = [
    { quantity: 1, normal: 50000, urgent: 70000, code: "TN1/TF1" },
    { quantity: 3, normal: 135000, urgent: 189000, code: "TN3/TF3" },
    { quantity: 5, normal: 200000, urgent: 224000, code: "TN5/TF5" },
  ];

  // Monthly packages
  const monthlyPackages = [
    {
      id: "basic",
      name: "Basic",
      price: 2700000,
      normalPosts: 60,
      dailyLimit: 2,
      urgentPosts: 5,
      color: "from-blue-500 to-blue-600",
      subscriberCount: 145,
      isActive: true,
    },
    {
      id: "advance",
      name: "Advance",
      price: 6000000,
      normalPosts: 150,
      dailyLimit: 5,
      urgentPosts: 10,
      color: "from-purple-500 to-purple-600",
      subscriberCount: 89,
      isActive: true,
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: 10500000,
      normalPosts: 300,
      dailyLimit: 10,
      urgentPosts: 20,
      color: "from-orange-500 to-orange-600",
      subscriberCount: 34,
      isActive: true,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Gói dịch vụ</h1>
          <p className="text-gray-600">Quản lý giá và gói dịch vụ cho nhà tuyển dụng</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          Thêm gói mới
        </button>
      </div>

      <div className="space-y-8">
        {/* Pricing by Quantity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              GIÁ THEO SỐ LƯỢNG TIN
            </h2>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Số tin</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">
                    Tin bình thường (TN)
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">
                    Tin gấp (TF)
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quantityPricing.map((item) => (
                  <tr key={item.quantity} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-blue-600">
                          {item.normal.toLocaleString()}đ
                        </span>
                        <span className="text-sm text-gray-500">
                          ({item.code.split("/")[0]})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-orange-600">
                          {item.urgent.toLocaleString()}đ
                        </span>
                        <span className="text-sm text-gray-500">
                          ({item.code.split("/")[1]})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Packages */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              GIÁ THEO THÁNG
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {monthlyPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-xl relative ${
                  pkg.popular ? "border-purple-500 scale-105" : "border-gray-200"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      PHỔ BIẾN NHẤT
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-semibold mb-3 bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                    {pkg.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {(pkg.price / 1000000).toFixed(1)}
                    </span>
                    <span className="text-gray-500 ml-1">triệu</span>
                  </div>
                  <div className="text-sm text-gray-500">/ tháng</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {pkg.normalPosts} tin thường/tháng
                      </div>
                      <div className="text-sm text-gray-600">
                        Tối đa {pkg.dailyLimit} tin/ngày
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {pkg.urgentPosts} tin tuyển gấp
                      </div>
                      <div className="text-sm text-gray-600">Hiển thị ưu tiên</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mb-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600">Người đăng ký</span>
                    <span className="font-semibold text-blue-600">{pkg.subscriberCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex-1 text-center py-2 rounded-lg text-sm font-medium ${
                        pkg.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pkg.isActive ? "Đang hoạt động" : "Tạm dừng"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}