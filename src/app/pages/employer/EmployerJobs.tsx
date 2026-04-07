import { Plus, Search, Filter, MoreVertical, Eye, Users, Calendar, MapPin } from "lucide-react";
import { useState } from "react";

export default function EmployerJobs() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("all");

  const jobs = [
    {
      id: 1,
      title: "Nhân viên phục vụ - Part-time",
      company: "Highlands Coffee",
      location: "Quận 1, TP.HCM",
      salary: "25,000đ/giờ",
      type: "Part-time",
      status: "active",
      postedDate: "2024-03-10",
      expiryDate: "2024-04-10",
      views: 245,
      applicants: 12,
    },
    {
      id: 2,
      title: "Gia sư Toán - Lớp 10",
      company: "Center English",
      location: "Quận 3, TP.HCM",
      salary: "100,000đ/buổi",
      type: "Gia sư",
      status: "active",
      postedDate: "2024-03-12",
      expiryDate: "2024-04-12",
      views: 189,
      applicants: 8,
    },
    {
      id: 3,
      title: "Nhân viên kho - Ca tối",
      company: "Circle K",
      location: "Quận 7, TP.HCM",
      salary: "22,000đ/giờ",
      type: "Part-time",
      status: "expired",
      postedDate: "2024-02-15",
      expiryDate: "2024-03-15",
      views: 567,
      applicants: 34,
    },
  ];

  const stats = [
    { label: "Tổng tin đăng", value: "24", color: "blue", icon: Calendar },
    { label: "Đang hoạt động", value: "12", color: "green", icon: Eye },
    { label: "Tổng ứng viên", value: "156", color: "purple", icon: Users },
    { label: "Đã hết hạn", value: "12", color: "gray", icon: Calendar },
  ];

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "all") return true;
    return job.status === activeTab;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-600 text-lg">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <Plus className="w-5 h-5" />
          <span>Đăng tin mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                stat.color === 'green' ? 'from-green-500 to-green-600' :
                stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-gray-500 to-gray-600'
              } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="T��m kiếm tin tuyển dụng..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b-2 border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "all"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Tất cả ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "active"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Đang hoạt động ({jobs.filter((j) => j.status === "active").length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "expired"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Đã hết hạn ({jobs.filter((j) => j.status === "expired").length})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-600 mb-3 font-medium">{job.company}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-600 font-semibold">{job.salary}</span>
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-medium">
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:flex-col lg:items-end">
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold mb-1">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <span>{job.views}</span>
                    </div>
                    <div className="text-xs text-gray-500">Lượt xem</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold mb-1">
                      <Users className="w-5 h-5 text-green-500" />
                      <span>{job.applicants}</span>
                    </div>
                    <div className="text-xs text-gray-500">Ứng viên</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === "active" ? (
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      Đã hết hạn
                    </span>
                  )}
                  <button className="p-2 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Đăng ngày: <strong>{new Date(job.postedDate).toLocaleDateString("vi-VN")}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Hết hạn: <strong>{new Date(job.expiryDate).toLocaleDateString("vi-VN")}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}