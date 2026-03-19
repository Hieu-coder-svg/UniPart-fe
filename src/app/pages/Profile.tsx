import { useState } from "react";
import {
  User,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  Clock,
  Award,
  Settings,
  Edit,
  Mail,
  Phone,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Shield,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import WeeklySchedule from "../components/WeeklySchedule";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"info" | "history" | "schedule">("info");
  const { user } = useAuth();

  // Check if user has admin or manager role (demo: you can modify this based on your auth logic)
  const hasAdminAccess = true; // Change based on actual user role
  const hasManagerAccess = true; // Change based on actual user role

  const studentProfile = {
    name: "Nguyễn Minh Tuấn",
    university: "Đại học Khoa học Tự nhiên TP.HCM",
    major: "Công nghệ Thông tin",
    year: "Năm 3",
    location: "Quận 5, TP.HCM",
    rating: 4.8,
    completedJobs: 12,
    totalHours: 156,
    joinDate: "Tháng 9, 2025",
    skills: ["Marketing", "Thiết kế", "Tiếng Anh"],
    availability: ["Thứ 2 chiều", "Thứ 4 chiều", "Cuối tun"],
    email: "nguyentuan@example.com",
    phone: "0987654321",
    experience: "5 năm",
    earnings: "50,000,000đ",
    achievements: ["Top Performer", "5 Sao Rating", "Đáng tin cậy", "Hoàn thành 10+"],
  };

  const workHistory = [
    {
      id: "1",
      title: "Nhân viên pha chế",
      company: "Highlands Coffee",
      duration: "3 tháng",
      rating: 5,
      earnings: "2,100,000đ",
      employerFeedback: "Tuấn là một nhân viên xuất sắc! Làm việc rất chăm chỉ, chu đáo và có thái độ phục vụ khách hàng tuyệt vời. Luôn đúng giờ và sẵn sàng hỗ trợ đồng nghiệp. Chúng tôi rất hài lòng!",
      employerName: "Quản lý Highlands - Quận 5",
      feedbackDate: "15/03/2026",
      studentFeedback: "Môi trường làm việc chuyên nghiệp, đồng nghiệp thân thiện. Được đào tạo kỹ lưỡng và quản lý luôn hỗ trợ nhiệt tình. Lương thưởng đúng hạn, chế độ đãi ngộ tốt. Rất đáng để làm việc lâu dài!",
      studentRating: 5
    },
    {
      id: "2",
      title: "Gia sư Toán",
      company: "Trung tâm Gia sư",
      duration: "2 tháng",
      rating: 5,
      earnings: "3,200,000đ",
      employerFeedback: "Học sinh của Tuấn đã cải thiện điểm số đáng kể. Phương pháp giảng dạy dễ hiểu, kiên nhẫn và nhiệt tình. Phụ huynh rất hài lòng với sự tiến bộ của con.",
      employerName: "Giám đốc Trung tâm Gia sư Thành Đạt",
      feedbackDate: "10/03/2026",
      studentFeedback: "Trung tâm có quy trình làm việc rõ ràng, hỗ trợ giáo án tốt. Học phí được trả đầy đủ và đúng hạn. Phụ huynh và học sinh đều dễ tính, tạo điều kiện tốt cho việc giảng dạy.",
      studentRating: 5
    },
    {
      id: "3",
      title: "Content Writer",
      company: "Digital Agency",
      duration: "1 tháng",
      rating: 4,
      earnings: "1,500,000đ",
      employerFeedback: "Tuấn viết content khá tốt, có sáng tạo và đúng deadline. Tuy nhiên cần cải thiện thêm về SEO và nghiên cứu thị trường. Nhìn chung là một cộng tác viên đáng tin cậy.",
      employerName: "Creative Director - DigiMarketing",
      feedbackDate: "05/03/2026",
      studentFeedback: "Công việc thú vị và học hỏi được nhiều về marketing. Tuy nhiên đôi khi yêu cầu thay đổi nhiều lần trong thời gian ngắn. Brief chưa rõ ràng lắm nhưng team leader nhiệt tình hướng dẫn.",
      studentRating: 4
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20 md:pb-8">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header Section */}
          <div className="p-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzU4NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt={studentProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl mb-2">{studentProfile.name}</h1>
                    <p className="text-gray-600 mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {studentProfile.major} - {studentProfile.year}
                    </p>
                    <p className="text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {studentProfile.university}
                    </p>
                  </div>
                  <button className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Star className="w-4 h-4" />
                  Đánh giá
                </div>
                <div className="text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {studentProfile.rating} ⭐
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                </div>
                <div className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {studentProfile.completedJobs} việc
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-t border-gray-100">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 min-w-[120px] py-4 px-6 transition-all relative ${
                  activeTab === "info"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Thông tin</span>
                </div>
                {activeTab === "info" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 min-w-[120px] py-4 px-6 transition-all relative ${
                  activeTab === "history"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Lịch sử</span>
                </div>
                {activeTab === "history" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={`flex-1 min-w-[120px] py-4 px-6 transition-all relative ${
                  activeTab === "schedule"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Lịch trình</span>
                </div>
                {activeTab === "schedule" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Thông tin cơ bản
                    </h3>
                    <button className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Địa chỉ</div>
                        <div className="text-gray-700">{studentProfile.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Tham gia</div>
                        <div className="text-gray-700">{studentProfile.joinDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Đánh giá TB</div>
                        <div className="text-gray-700">{studentProfile.rating}/5</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Kinh nghiệm</div>
                        <div className="text-gray-700">{studentProfile.experience}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Kỹ năng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm shadow-sm hover:shadow-md transition-shadow"
                      >
                        {skill}
                      </span>
                    ))}
                    <button className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-full text-sm hover:border-blue-500 hover:bg-blue-50 transition-all">
                      + Thêm kỹ năng
                    </button>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    Thông tin liên hệ
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-gray-700 text-sm">{studentProfile.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Điện thoại</div>
                        <div className="text-gray-700">{studentProfile.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin/Manager Access - Only show if user has special roles */}
                {(hasAdminAccess || hasManagerAccess) && (
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 shadow-xl">
                    <h3 className="mb-4 flex items-center gap-2 text-white">
                      <ShieldCheck className="w-5 h-5 text-yellow-400" />
                      Quyền truy cập đặc biệt
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {hasAdminAccess && (
                        <Link
                          to="/admin"
                          className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 p-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <ShieldCheck className="w-6 h-6 text-white" />
                              </div>
                              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="text-xl text-white mb-1">Admin Dashboard</h4>
                            <p className="text-white/80 text-sm">Quản trị viên cấp cao</p>
                          </div>
                        </Link>
                      )}

                      {hasManagerAccess && (
                        <Link
                          to="/manager"
                          className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Shield className="w-6 h-6 text-white" />
                              </div>
                              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="text-xl text-white mb-1">Manager Dashboard</h4>
                            <p className="text-white/80 text-sm">Quản trị hệ thống</p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {workHistory.map((job, index) => (
                  <div
                    key={job.id}
                    className="group p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="mb-1 text-lg">{job.title}</h4>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-yellow-700">{job.rating}.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600 px-3 py-2 bg-blue-50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 px-3 py-2 bg-green-50 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>{job.earnings}</span>
                      </div>
                    </div>

                    {/* Employer Feedback Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Đánh giá từ nhà tuyển dụng</span>
                              <ThumbsUp className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-400">{job.feedbackDate}</span>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3 italic">
                              "{job.employerFeedback}"
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                {job.employerName.charAt(0)}
                              </div>
                              <span>— {job.employerName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student Feedback Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Đánh giá từ tôi</span>
                              <ThumbsUp className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-400">{job.feedbackDate}</span>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3 italic">
                              "{job.studentFeedback}"
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                {job.studentRating}
                              </div>
                              <span>— Tôi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {workHistory.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có lịch sử làm việc</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="space-y-4">
                <WeeklySchedule editable={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}