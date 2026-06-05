import {
  Save,
  Globe,
  Shield,
  Bell,
  Mail,
  Palette,
  Database,
  Users,
  Lock,
  Eye,
  EyeOff,
  Server,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const tabs = [
    { id: "general", label: "Chung", icon: Globe },
    { id: "security", label: "Bảo mật", icon: Shield },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "email", label: "Email", icon: Mail },
    { id: "appearance", label: "Giao diện", icon: Palette },
    { id: "backup", label: "Sao lưu", icon: Database },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Cài đặt Hệ thống</h1>
        <p className="text-gray-600">Quản lý cấu hình và tùy chỉnh hệ thống</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 transition-all border-b border-gray-100 last:border-b-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Chung</h2>
                  <p className="text-gray-600 text-sm">Cấu hình cơ bản của hệ thống</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên hệ thống
                    </label>
                    <input
                      type="text"
                      defaultValue="UniHire"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả hệ thống
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Nền tảng tìm kiếm việc làm bán thời gian cho sinh viên"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL hệ thống
                    </label>
                    <input
                      type="url"
                      defaultValue="https://unihire.vn"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Múi giờ
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="Asia/Ho_Chi_Minh">
                        (GMT+7) Hồ Chí Minh, Bangkok
                      </option>
                      <option value="Asia/Singapore">
                        (GMT+8) Singapore, Kuala Lumpur
                      </option>
                      <option value="Asia/Tokyo">(GMT+9) Tokyo, Seoul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngôn ngữ mặc định
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Chế độ bảo trì
                      </div>
                      <div className="text-sm text-gray-600">
                        Tạm khóa hệ thống để bảo trì
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Bảo mật</h2>
                  <p className="text-gray-600 text-sm">
                    Quản lý các thiết lập bảo mật hệ thống
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ dài mật khẩu tối thiểu
                    </label>
                    <input
                      type="number"
                      defaultValue="8"
                      min="6"
                      max="20"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian hết phiên (phút)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      min="15"
                      max="480"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lần đăng nhập sai tối đa
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      min="3"
                      max="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian khóa tài khoản (phút)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="1440"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Yêu cầu xác thực 2 yếu tố (2FA)
                      </div>
                      <div className="text-sm text-gray-600">
                        Bắt buộc tất cả admin sử dụng 2FA
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Mã hóa dữ liệu nhạy cảm
                      </div>
                      <div className="text-sm text-gray-600">
                        Mã hóa thông tin cá nhân và thanh toán
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Ghi log hoạt động admin
                      </div>
                      <div className="text-sm text-gray-600">
                        Lưu lại tất cả thao tác của quản trị viên
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        defaultValue="sk_live_51NxY8zK9vW3pQ2rS7H..."
                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Thông báo</h2>
                  <p className="text-gray-600 text-sm">
                    Quản lý các loại thông báo hệ thống
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Thông báo qua Email
                      </div>
                      <div className="text-sm text-gray-600">
                        Gửi email cho các sự kiện quan trọng
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Thông báo tài khoản mới
                      </div>
                      <div className="text-sm text-gray-600">
                        Thông báo khi có người dùng đăng ký mới
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Cảnh báo bảo mật
                      </div>
                      <div className="text-sm text-gray-600">
                        Thông báo về các vấn đề bảo mật
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Thông báo thanh toán
                      </div>
                      <div className="text-sm text-gray-600">
                        Thông báo về giao dịch và thanh toán
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Báo cáo hệ thống
                      </div>
                      <div className="text-sm text-gray-600">
                        Gửi báo cáo định kỳ về hiệu suất
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Cảnh báo lỗi hệ thống
                      </div>
                      <div className="text-sm text-gray-600">
                        Thông báo ngay khi có lỗi nghiêm trọng
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Email</h2>
                  <p className="text-gray-600 text-sm">
                    Cấu hình máy chủ email và mẫu thông báo
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máy chủ SMTP
                    </label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cổng SMTP
                      </label>
                      <input
                        type="number"
                        defaultValue="587"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã hóa
                      </label>
                      <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">Không</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email gửi đi
                    </label>
                    <input
                      type="email"
                      defaultValue="unipartrecruitment@gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên người gửi
                    </label>
                    <input
                      type="text"
                      defaultValue="UniHire Support"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập SMTP
                    </label>
                    <input
                      type="text"
                      defaultValue="unipartrecruitment@gmail.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu SMTP
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? "text" : "password"}
                        defaultValue="••••••••••••"
                        className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Mail className="w-4 h-4" />
                      Gửi email kiểm tra
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Giao diện</h2>
                  <p className="text-gray-600 text-sm">
                    Tùy chỉnh giao diện và màu sắc hệ thống
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ đề hệ thống
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="light">Sáng</option>
                      <option value="dark">Tối</option>
                      <option value="auto">Tự động</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Màu chủ đạo
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { name: "Đỏ", color: "bg-red-600" },
                        { name: "Hồng", color: "bg-pink-600" },
                        { name: "Tím", color: "bg-purple-600" },
                        { name: "Xanh dương", color: "bg-blue-600" },
                        { name: "Xanh lá", color: "bg-green-600" },
                        { name: "Cam", color: "bg-orange-600" },
                      ].map((item) => (
                        <button
                          key={item.name}
                          className={`${item.color} h-12 rounded-lg hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent hover:ring-gray-400`}
                          title={item.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo hệ thống
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <Palette className="w-8 h-8 text-gray-400" />
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Tải lên logo mới
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                        <Palette className="w-6 h-6 text-gray-400" />
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Tải lên favicon
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Hiển thị logo trên header
                      </div>
                      <div className="text-sm text-gray-600">
                        Hiển thị logo ở phần đầu trang
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Hiệu ứng chuyển trang
                      </div>
                      <div className="text-sm text-gray-600">
                        Bật hiệu ứng animation khi chuyển trang
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === "backup" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-1">Cài đặt Sao lưu</h2>
                  <p className="text-gray-600 text-sm">
                    Cấu hình sao lưu tự động và lưu trữ
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        Sao lưu tự động
                      </div>
                      <div className="text-sm text-gray-600">
                        Bật sao lưu dữ liệu định kỳ
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tần suất sao lưu
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                      <option value="monthly">Hàng tháng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ sao lưu
                    </label>
                    <input
                      type="time"
                      defaultValue="02:00"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số bản sao lưu giữ lại
                    </label>
                    <input
                      type="number"
                      defaultValue="7"
                      min="1"
                      max="30"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vị trí lưu trữ
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="local">Máy chủ cục bộ</option>
                      <option value="aws">Amazon S3</option>
                      <option value="google">Google Cloud Storage</option>
                      <option value="azure">Microsoft Azure</option>
                    </select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 mb-1">
                          Sao lưu gần nhất
                        </div>
                        <div className="text-sm text-blue-700">
                          17/03/2026 - 02:00 AM (234 MB)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                      <Database className="w-4 h-4" />
                      Sao lưu ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200 mt-8">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Khôi phục mặc định
                </button>
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all">
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
