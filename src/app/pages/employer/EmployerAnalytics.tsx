import { TrendingUp, TrendingDown, Eye, Users, Briefcase, Calendar, Download } from "lucide-react";
import { useState } from "react";

export default function EmployerAnalytics() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days");

  const stats = [
    {
      label: "Tổng lượt xem",
      value: "12,456",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "blue",
    },
    {
      label: "Tổng ứng viên",
      value: "456",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "green",
    },
    {
      label: "Tin đang hoạt động",
      value: "24",
      change: "-2.1%",
      trend: "down",
      icon: Briefcase,
      color: "purple",
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: "3.67%",
      change: "+0.5%",
      trend: "up",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  const topJobs = [
    {
      title: "Nhân viên phục vụ - Part-time",
      views: 2456,
      applicants: 124,
      conversionRate: 5.05,
    },
    {
      title: "Gia sư Toán - Lớp 10",
      views: 1890,
      applicants: 89,
      conversionRate: 4.71,
    },
    {
      title: "Nhân viên kho - Ca tối",
      views: 1567,
      applicants: 56,
      conversionRate: 3.57,
    },
  ];

  const viewsData = [
    { day: "T2", views: 340, applicants: 12 },
    { day: "T3", views: 420, applicants: 18 },
    { day: "T4", views: 380, applicants: 15 },
    { day: "T5", views: 520, applicants: 24 },
    { day: "T6", views: 480, applicants: 20 },
    { day: "T7", views: 390, applicants: 16 },
    { day: "CN", views: 280, applicants: 10 },
  ];

  const maxViews = Math.max(...viewsData.map((d) => d.views));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Thống kê & Phân tích</h1>
          <p className="text-gray-600 text-lg">Theo dõi hiệu quả tuyển dụng của bạn</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-3xl mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg mb-6">Lượt xem theo ngày</h3>
          <div className="space-y-4">
            {viewsData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{data.day}</span>
                  <span className="font-medium">{data.views} lượt xem</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${(data.views / maxViews) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicants Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg mb-6">Ứng viên theo ngày</h3>
          <div className="space-y-4">
            {viewsData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{data.day}</span>
                  <span className="font-medium">{data.applicants} ứng viên</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(data.applicants / 24) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg mb-6">Tin tuyển dụng hiệu quả nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Vị trí</th>
                <th className="text-right py-3 px-4 text-sm text-gray-600">Lượt xem</th>
                <th className="text-right py-3 px-4 text-sm text-gray-600">Ứng viên</th>
                <th className="text-right py-3 px-4 text-sm text-gray-600">Tỷ lệ chuyển đổi</th>
                <th className="text-right py-3 px-4 text-sm text-gray-600">Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {topJobs.map((job, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
                        {idx + 1}
                      </div>
                      <span>{job.title}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">{job.views.toLocaleString()}</td>
                  <td className="text-right py-4 px-4">{job.applicants}</td>
                  <td className="text-right py-4 px-4">
                    <span className="text-green-600">{job.conversionRate}%</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className="flex justify-end">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+12%</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg mb-6">Thời gian xem nhiều nhất</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">8:00 - 12:00</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">60%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">12:00 - 16:00</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">16:00 - 20:00</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">95%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">20:00 - 24:00</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">45%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg mb-6">Nguồn truy cập</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tìm kiếm</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">65%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trực tiếp</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">20%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mạng xã hội</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">10%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Khác</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "5%" }}></div>
                </div>
                <span className="text-sm font-medium w-12 text-right">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}