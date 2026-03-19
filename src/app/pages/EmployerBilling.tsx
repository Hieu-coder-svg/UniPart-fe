import { CreditCard, Download, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function EmployerBilling() {
  const [activeTab, setActiveTab] = useState<"history" | "payment">("history");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const transactions = [
    {
      id: "INV-2024-001",
      date: "2024-03-01",
      description: "Gói Advance - Tháng 3/2024",
      amount: 6000000,
      status: "paid",
      method: "Chuyển khoản",
    },
    {
      id: "INV-2024-002",
      date: "2024-03-10",
      description: "Mua thêm 5 tin tuyển dụng",
      amount: 225000,
      status: "paid",
      method: "MoMo",
    },
    {
      id: "INV-2024-003",
      date: "2024-03-15",
      description: "3 tin tuyển gấp",
      amount: 210000,
      status: "pending",
      method: "Chuyển khoản",
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "bank",
      name: "Ngân hàng Vietcombank",
      number: "**** **** **** 1234",
      expiry: "12/25",
      isDefault: true,
    },
    {
      id: 2,
      type: "momo",
      name: "Ví MoMo",
      number: "0901234567",
      isDefault: false,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Thanh toán</h1>
        <p className="text-gray-600 text-lg">Quản lý lịch sử thanh toán và phương thức</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg mb-2">Gói hiện tại: Advance</h3>
            <div className="space-y-1 text-orange-100">
              <p>• 150 tin thường/tháng (Còn lại: 124)</p>
              <p>• 10 tin tuyển gấp (Còn lại: 7)</p>
              <p>• Gia hạn: 01/04/2024</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">{formatCurrency(6000000)}</div>
            <button className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50">
              Nâng cấp gói
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex gap-2 p-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "history"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Lịch sử thanh toán</span>
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "payment"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Phương thức thanh toán</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Transaction History */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg">Giao dịch gần đây</h3>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-5 h-5" />
                  <span>Xuất Excel</span>
                </button>
              </div>

              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium mb-1">{transaction.description}</h4>
                          <p className="text-sm text-gray-600">Mã GD: {transaction.id}</p>
                        </div>
                        {transaction.status === "paid" ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm">Đã thanh toán</span>
                          </div>
                        ) : transaction.status === "pending" ? (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Chờ xử lý</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Thất bại</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(transaction.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span>{transaction.method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-between gap-2">
                      <div className="text-2xl text-orange-600">{formatCurrency(transaction.amount)}</div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        Tải hóa đơn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg">Phương thức thanh toán của bạn</h3>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                  Thêm mới
                </button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-xl p-6 ${
                      method.isDefault ? "border-orange-500 bg-orange-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{method.name}</h4>
                          <p className="text-gray-600 mb-1">{method.number}</p>
                          {method.type === "bank" && (
                            <p className="text-sm text-gray-500">Hết hạn: {method.expiry}</p>
                          )}
                          {method.isDefault && (
                            <span className="inline-block mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded-full">
                              Mặc định
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                            Đặt mặc định
                          </button>
                        )}
                        <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm">
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supported Payment Methods */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm text-gray-600 mb-4">Chúng tôi chấp nhận</h4>
                <div className="flex flex-wrap gap-4">
                  {["Visa", "Mastercard", "MoMo", "ZaloPay", "VNPay", "Banking"].map(
                    (brand, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm"
                      >
                        {brand}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto Renewal */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg mb-2">Gia hạn tự động</h3>
            <p className="text-gray-600">
              Tự động gia hạn gói dịch vụ khi hết hạn để không bị gián đoạn
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}