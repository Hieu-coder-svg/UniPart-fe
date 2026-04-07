import { Search, Filter, Download, Star, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";
import { useState } from "react";

export default function EmployerApplicants() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "reviewed" | "shortlisted" | "rejected">("all");

  const applicants = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      avatar: "A",
      email: "an.nguyen@student.hcmut.edu.vn",
      phone: "0901234567",
      school: "ĐH Bách Khoa TP.HCM",
      major: "Công nghệ Thông tin",
      year: "Năm 3",
      job: "Nhân viên phục vụ - Part-time",
      appliedDate: "2024-03-14",
      status: "pending",
      rating: 4.5,
      experience: "6 tháng kinh nghiệm",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      avatar: "B",
      email: "binh.tran@student.hcmus.edu.vn",
      phone: "0912345678",
      school: "ĐH Khoa học Tự nhiên",
      major: "Toán học",
      year: "Năm 4",
      job: "Gia sư Toán - Lớp 10",
      appliedDate: "2024-03-13",
      status: "shortlisted",
      rating: 5.0,
      experience: "1 năm kinh nghiệm",
    },
    {
      id: 3,
      name: "Lê Minh Châu",
      avatar: "C",
      email: "chau.le@student.hcmue.edu.vn",
      phone: "0923456789",
      school: "ĐH Sư phạm TP.HCM",
      major: "Ngữ văn",
      year: "Năm 2",
      job: "Nhân viên phục vụ - Part-time",
      appliedDate: "2024-03-12",
      status: "reviewed",
      rating: 4.0,
      experience: "3 tháng kinh nghiệm",
    },
  ];

  const stats = [
    { label: "Tổng ứng viên", value: "156", color: "from-blue-500 to-blue-600" },
    { label: "Chờ xem xét", value: "45", color: "from-yellow-500 to-orange-500" },
    { label: "Đã shortlist", value: "23", color: "from-green-500 to-emerald-500" },
    { label: "Đã từ chối", value: "88", color: "from-red-500 to-red-600" },
  ];

  const filteredApplicants = applicants.filter((applicant) => {
    if (activeTab === "all") return true;
    return applicant.status === activeTab;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Quản lý ứng viên</h1>
        <p className="text-gray-600 text-lg">Xem và quản lý các ứng viên ứng tuyển vào vị trí của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
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
              placeholder="Tìm kiếm ứng viên..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium">
            <Download className="w-5 h-5" />
            <span>Xuất Excel</span>
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
            Tất cả ({applicants.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "pending"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Chờ xem xét
          </button>
          <button
            onClick={() => setActiveTab("reviewed")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "reviewed"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Đã xem
          </button>
          <button
            onClick={() => setActiveTab("shortlisted")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "shortlisted"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Shortlist
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "rejected"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Từ chối
          </button>
        </div>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        {filteredApplicants.map((applicant) => (
          <div key={applicant.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  {applicant.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">{applicant.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500 mb-3">
                    <Star className="w-5 h-5 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{applicant.rating}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span>{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span>{applicant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-sm text-blue-600 mb-1 font-medium">Trường học</div>
                  <div className="text-gray-900 font-semibold">{applicant.school}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="text-sm text-purple-600 mb-1 font-medium">Chuyên ngành</div>
                  <div className="text-gray-900 font-semibold">{applicant.major} - {applicant.year}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="text-sm text-green-600 mb-1 font-medium">Vị trí ứng tuyển</div>
                  <div className="text-gray-900 font-semibold">{applicant.job}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="text-sm text-orange-600 mb-1 font-medium">Kinh nghiệm</div>
                  <div className="text-gray-900 font-semibold">{applicant.experience}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                {applicant.status === "pending" && (
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl text-sm text-center font-medium shadow-lg">
                    Chờ xem xét
                  </span>
                )}
                {applicant.status === "reviewed" && (
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm text-center font-medium shadow-lg">
                    Đã xem
                  </span>
                )}
                {applicant.status === "shortlisted" && (
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm text-center font-medium shadow-lg">
                    Shortlist
                  </span>
                )}
                <button className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium">
                  Xem hồ sơ
                </button>
                <button className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-sm font-medium">
                  Liên hệ
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-100 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Ứng tuyển ngày: <strong>{new Date(applicant.appliedDate).toLocaleDateString("vi-VN")}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
