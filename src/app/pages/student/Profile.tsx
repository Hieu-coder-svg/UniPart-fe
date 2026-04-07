import { useState } from "react";
import {
  User,
  MapPin,
  Briefcase,
  Star,
  Calendar,
  Clock,
  Award,
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
  Zap,
  BarChart2,
  PenLine,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";
import WeeklySchedule from "../../components/WeeklySchedule";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

/* ─────────────────────────────────────────────────────────────
   TAB DEFINITION
───────────────────────────────────────────────────────────── */
type TabKey = "info" | "history" | "schedule";
const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "info",     label: "Thông tin",  icon: User },
  { key: "history",  label: "Lịch sử",   icon: Briefcase },
  { key: "schedule", label: "Lịch trình", icon: Calendar },
];

/* ─────────────────────────────────────────────────────────────
   PROFILE DATA
───────────────────────────────────────────────────────────── */
const studentProfile = {
  name: "Nguyễn Minh Tuấn",
  university: "Đại học Khoa học Tự nhiên TP.HCM",
  major: "Công nghệ Thông tin",
  year: "Năm 3",
  location: "Quận 5, TP.HCM",
  rating: 4.8,
  completedJobs: 12,
  totalHours: 156,
  responseRate: 98,
  joinDate: "Tháng 9, 2025",
  skills: ["Marketing", "Thiết kế", "Tiếng Anh", "React", "UI/UX"],
  email: "nguyentuan@example.com",
  phone: "0987654321",
  experience: "5 năm",
  earnings: "50,000,000đ",
  bio: "Sinh viên năm 3 CNTT, đam mê thiết kế và marketing. Đã tích lũy kinh nghiệm qua nhiều công việc part-time, luôn hoàn thành đúng hạn và duy trì thái độ chuyên nghiệp.",
  achievements: ["Top Performer", "5 Sao Rating", "Đáng tin cậy", "Hoàn thành 10+"],
};

const workHistory = [
  {
    id: "1", title: "Nhân viên pha chế", company: "Highlands Coffee",
    duration: "3 tháng", rating: 5, earnings: "2,100,000đ",
    employerFeedback: "Tuấn là một nhân viên xuất sắc! Làm việc rất chăm chỉ, chu đáo và có thái độ phục vụ khách hàng tuyệt vời. Luôn đúng giờ và sẵn sàng hỗ trợ đồng nghiệp.",
    employerName: "Quản lý Highlands - Quận 5", feedbackDate: "15/03/2026",
    studentFeedback: "Môi trường làm việc chuyên nghiệp, đồng nghiệp thân thiện. Lương thưởng đúng hạn, chế độ đãi ngộ tốt.",
    studentRating: 5,
  },
  {
    id: "2", title: "Gia sư Toán", company: "Trung tâm Gia sư",
    duration: "2 tháng", rating: 5, earnings: "3,200,000đ",
    employerFeedback: "Học sinh của Tuấn đã cải thiện điểm số đáng kể. Phương pháp giảng dạy dễ hiểu, kiên nhẫn và nhiệt tình.",
    employerName: "Giám đốc Trung tâm Gia sư Thành Đạt", feedbackDate: "10/03/2026",
    studentFeedback: "Trung tâm có quy trình làm việc rõ ràng, hỗ trợ giáo án tốt. Học phí được trả đầy đủ và đúng hạn.",
    studentRating: 5,
  },
  {
    id: "3", title: "Content Writer", company: "Digital Agency",
    duration: "1 tháng", rating: 4, earnings: "1,500,000đ",
    employerFeedback: "Tuấn viết content khá tốt, có sáng tạo và đúng deadline. Tuy nhiên cần cải thiện thêm về SEO.",
    employerName: "Creative Director - DigiMarketing", feedbackDate: "05/03/2026",
    studentFeedback: "Công việc thú vị và học hỏi được nhiều về marketing. Brief đôi khi chưa rõ ràng nhưng team leader nhiệt tình hướng dẫn.",
    studentRating: 4,
  },
];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const { user } = useAuth();
  const hasAdminAccess = true;
  const hasManagerAccess = true;

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">

      {/* ══════════════════════════════════════════
          BANNER — abstract SVG pattern + deep blue
      ══════════════════════════════════════════ */}
      <div className="relative h-40 bg-[#0f1f4b] overflow-hidden">
        {/* Abstract SVG pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="80" r="120" fill="url(#bg1)" opacity="0.4" />
          <circle cx="800" cy="20" r="90" fill="#60a5fa" opacity="0.25" />
          <circle cx="1300" cy="100" r="140" fill="#a78bfa" opacity="0.3" />
          <rect x="600" y="30" width="200" height="100" rx="50" fill="#38bdf8" opacity="0.15" transform="rotate(25 700 80)" />
          <rect x="1000" y="10" width="160" height="80" rx="40" fill="#818cf8" opacity="0.2" transform="rotate(-15 1080 50)" />
        </svg>
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Edit cover button */}
        <button className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all border border-white/20">
          <PenLine className="w-3 h-3" /> Đổi ảnh bìa
        </button>
      </div>

      {/* ══════════════════════════════════════════
          PROFILE CARD
      ══════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Identity Section ── */}
          <div className="px-7 pb-0 pt-0">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-1">
              {/* Avatar — large, circle, white border, shadow */}
              <div className="relative flex-shrink-0 -mt-10">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzU4NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt={studentProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Verified badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg" title="Đã xác thực">
                  <BadgeCheck className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* Name & info */}
              <div className="flex-1 pb-4 pt-2 sm:pt-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="text-2xl font-extrabold text-gray-900">{studentProfile.name}</h1>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      {studentProfile.major} · {studentProfile.year}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {studentProfile.university}
                    </p>
                  </div>
                  {/* Edit Profile button — prominent */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl text-sm font-semibold transition-all border border-gray-200 hover:border-blue-200">
                    <Edit className="w-3.5 h-3.5" />
                    Chỉnh sửa hồ sơ
                  </button>
                </div>

                {/* Bio */}
                {studentProfile.bio && (
                  <p className="text-sm text-gray-500 leading-relaxed mt-3 max-w-xl">
                    {studentProfile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats Dashboard Bar ── */}
          <div className="px-7 pb-5 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Rating */}
              <div className="group relative bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 leading-none">{studentProfile.rating}</div>
                <div className="text-[10px] text-amber-500 font-semibold mt-1 uppercase tracking-wide">Đánh giá</div>
                <div className="absolute inset-0 flex items-center justify-center bg-amber-500/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Xem {workHistory.length} đánh giá</span>
                </div>
              </div>

              {/* Completed jobs */}
              <div className="group relative bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600 leading-none">{studentProfile.completedJobs}</div>
                <div className="text-[10px] text-blue-500 font-semibold mt-1 uppercase tracking-wide">Việc xong</div>
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Xem lịch sử</span>
                </div>
              </div>

              {/* Total hours */}
              <div className="group relative bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-violet-600 leading-none">{studentProfile.totalHours}</div>
                <div className="text-[10px] text-violet-500 font-semibold mt-1 uppercase tracking-wide">Giờ làm</div>
                <div className="absolute inset-0 flex items-center justify-center bg-violet-500/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Tổng giờ làm việc</span>
                </div>
              </div>

              {/* Response rate */}
              <div className="group relative bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 leading-none">{studentProfile.responseRate}%</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-1 uppercase tracking-wide">Phản hồi</div>
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Tỷ lệ phản hồi</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="border-t border-gray-100">
            <div className="flex overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 px-5 text-sm font-semibold transition-colors duration-200 ${
                      active ? "text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full transition-opacity duration-200 ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── TAB CONTENT ── */}
          <div className="p-6 space-y-5">

            {/* ════ INFO TAB ════ */}
            {activeTab === "info" && (
              <>
                {/* Basic Info */}
                <section>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Thông tin cơ bản
                    <button className="ml-auto p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { icon: MapPin,       color: "bg-blue-100 text-blue-600",    label: "Địa chỉ",    value: studentProfile.location },
                      { icon: Calendar,     color: "bg-violet-100 text-violet-600", label: "Tham gia",   value: studentProfile.joinDate },
                      { icon: GraduationCap,color: "bg-cyan-100 text-cyan-600",    label: "Trường",     value: studentProfile.university },
                      { icon: TrendingUp,   color: "bg-emerald-100 text-emerald-600",label: "Kinh nghiệm",value: studentProfile.experience },
                      { icon: Mail,         color: "bg-pink-100 text-pink-600",    label: "Email",      value: studentProfile.email },
                      { icon: Phone,        color: "bg-orange-100 text-orange-600", label: "Điện thoại", value: studentProfile.phone },
                    ].map(({ icon: Icon, color, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                          <div className="text-sm font-medium text-gray-800 mt-0.5">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-500" />
                    Kỹ năng
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 hover:shadow-md hover:scale-105 transition-all cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                    <button className="px-3.5 py-1.5 border-2 border-dashed border-blue-200 text-blue-500 rounded-full text-sm hover:border-blue-400 hover:bg-blue-50 transition-all">
                      + Thêm
                    </button>
                  </div>
                </section>

                {/* Achievements */}
                <section>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-500" />
                    Thành tích
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.achievements.map((a) => (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                        🏆 {a}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Admin/Manager Access */}
                {(hasAdminAccess || hasManagerAccess) && (
                  <section>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-yellow-500" />
                      Quyền truy cập đặc biệt
                    </h2>
                    <div className="p-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700">
                      <div className="grid md:grid-cols-2 gap-4">
                        {hasAdminAccess && (
                          <Link to="/admin" className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 p-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-between mb-3">
                              <div className="p-2.5 bg-white/20 rounded-xl"><ShieldCheck className="w-5 h-5 text-white" /></div>
                              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="text-white font-bold mb-0.5">Admin Dashboard</h4>
                            <p className="text-white/70 text-xs">Quản trị viên cấp cao</p>
                          </Link>
                        )}
                        {hasManagerAccess && (
                          <Link to="/manager" className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-between mb-3">
                              <div className="p-2.5 bg-white/20 rounded-xl"><Shield className="w-5 h-5 text-white" /></div>
                              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="text-white font-bold mb-0.5">Manager Dashboard</h4>
                            <p className="text-white/70 text-xs">Quản trị hệ thống</p>
                          </Link>
                        )}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ════ HISTORY TAB ════ */}
            {activeTab === "history" && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Lịch sử làm việc
                  <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                    {workHistory.length} việc
                  </span>
                </h2>

                {workHistory.map((job, index) => (
                  <div key={job.id} className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all">
                    {/* Job header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3.5 h-3.5" /> {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-amber-700 text-xs font-bold">{job.rating}.0</span>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
                        <Clock className="w-3.5 h-3.5" /> {job.duration}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full font-medium">
                        <DollarSign className="w-3.5 h-3.5" /> {job.earnings}
                      </span>
                    </div>

                    {/* Employer feedback */}
                    <FeedbackBlock
                      label="Đánh giá từ nhà tuyển dụng"
                      name={job.employerName}
                      date={job.feedbackDate}
                      text={job.employerFeedback}
                      color="blue"
                    />

                    {/* Student feedback */}
                    <div className="mt-3">
                      <FeedbackBlock
                        label="Nhận xét của tôi"
                        name="Nguyễn Minh Tuấn"
                        date={job.feedbackDate}
                        text={job.studentFeedback}
                        color="violet"
                      />
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* ════ SCHEDULE TAB ════ */}
            {activeTab === "schedule" && (
              <section>
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Lịch trình làm việc
                </h2>
                <WeeklySchedule editable={true} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   FEEDBACK BLOCK COMPONENT
────────────────────────────────── */
function FeedbackBlock({
  label,
  name,
  date,
  text,
  color,
}: {
  label: string;
  name: string;
  date: string;
  text: string;
  color: "blue" | "violet";
}) {
  const c = color === "blue"
    ? { bg: "bg-blue-50", border: "border-blue-100", avatar: "from-blue-500 to-cyan-500", text: "text-blue-700" }
    : { bg: "bg-violet-50", border: "border-violet-100", avatar: "from-violet-500 to-purple-500", text: "text-violet-700" };

  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <MessageSquare className={`w-3.5 h-3.5 ${c.text}`} />
          <span className={`text-xs font-bold ${c.text}`}>{label}</span>
        </div>
        <span className="text-[10px] text-gray-400">{date}</span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed italic mb-3">"{text}"</p>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 bg-gradient-to-br ${c.avatar} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {name.charAt(0)}
        </div>
        <span className="text-xs text-gray-500">— {name}</span>
      </div>
    </div>
  );
}