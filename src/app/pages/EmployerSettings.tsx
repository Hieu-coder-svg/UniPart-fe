import { Building2, User, Bell, Lock, CreditCard, Mail, Phone, MapPin, Save } from "lucide-react";
import { useState } from "react";

export default function EmployerSettings() {
  const [activeTab, setActiveTab] = useState<"company" | "account" | "notifications" | "security">("company");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Cài đặt</h1>
        <p className="text-gray-600 text-lg">Quản lý thông tin tài khoản và cài đặt hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg">
        <div className="flex gap-2 p-2 border-b-2 border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === "company"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Thông tin công ty</span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === "account"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Tài khoản</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Thông báo</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeTab === "security"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Lock className="w-5 h-5" />
            <span>Bảo mật</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Info Tab */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white text-4xl flex-shrink-0">
                  H
                </div>
                <div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2">
                    Thay đổi logo
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    Xóa
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Tên công ty *</label>
                  <input
                    type="text"
                    defaultValue="Highlands Coffee"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Mã số thuế</label>
                  <input
                    type="text"
                    defaultValue="0123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email công ty *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      defaultValue="hr@highlandscoffee.com.vn"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Số điện thoại *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      defaultValue="1900-xxxx"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Địa chỉ trụ sở</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    rows={3}
                    defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Mô tả công ty</label>
                <textarea
                  rows={5}
                  defaultValue="Highlands Coffee là chuỗi cửa hàng cà phê hàng đầu Việt Nam với hơn 500 cửa hàng trên toàn quốc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Hủy
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-2xl">
                  N
                </div>
                <div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2">
                    Thay đổi ảnh
                  </button>
                  <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                    Xóa
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    defaultValue="Nguyễn Văn A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Chức vụ</label>
                  <input
                    type="text"
                    defaultValue="HR Manager"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email *</label>
                  <input
                    type="email"
                    defaultValue="nguyenvana@highlandscoffee.com.vn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    defaultValue="0901234567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Hủy
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4">Thông báo email</h3>
                <div className="space-y-4">
                  {[
                    { label: "Ứng viên mới ứng tuyển", checked: true },
                    { label: "Tin nhắn mới từ ứng viên", checked: true },
                    { label: "Tin tuyển dụng sắp hết hạn", checked: true },
                    { label: "Báo cáo tuần", checked: false },
                    { label: "Thông tin khuyến mãi", checked: false },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg mb-4">Thông báo push</h3>
                <div className="space-y-4">
                  {[
                    { label: "Ứng viên mới ứng tuyển", checked: true },
                    { label: "Tin nhắn mới", checked: true },
                    { label: "Cập nhật hệ thống", checked: false },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                  <Save className="w-5 h-5" />
                  <span>Lưu cài đặt</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-4">Đổi mật khẩu</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4">Xác thực hai yếu tố (2FA)</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium mb-1">Bảo vệ tài khoản của bạn</p>
                    <p className="text-sm text-gray-600">
                      Thêm một lớp bảo mật bằng cách yêu cầu mã xác thực
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg">
                    Bật 2FA
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4 text-red-600">Vùng nguy hiểm</h3>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="mb-4 text-sm text-gray-700">
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}