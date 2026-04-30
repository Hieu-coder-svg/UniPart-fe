import { useState, useEffect } from "react";
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
  Zap,
  BarChart2,
  PenLine,
  GraduationCap,
  BadgeCheck,
  Save,
  Lock,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { userService, StudentResponse, StudentUpdateRequest } from "../../../services/userService";

/* ─────────────────────────────────────────────────────────────
   TAB DEFINITION
───────────────────────────────────────────────────────────── */
type TabKey = "info" | "history" | "password";
const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "info",     label: "Thông tin",  icon: User },
  { key: "history",  label: "Lịch sử",   icon: Briefcase },
  { key: "password", label: "Đổi mật khẩu", icon: Shield },
];

/* ─────────────────────────────────────────────────────────────
   MOCK DATA FALLBACKS
───────────────────────────────────────────────────────────── */
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
  }
];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const { user, changePassword } = useAuth();
  
  // States
  const [studentInfo, setStudentInfo] = useState<StudentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form States
  const [formData, setFormData] = useState<StudentUpdateRequest>({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    gender: "",
    university: "",
    major: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getStudentMyInfo();
      if (res.result) {
        setStudentInfo(res.result);
        setFormData({
          fullName: res.result.fullName || "",
          dateOfBirth: res.result.dateOfBirth || "",
          phoneNumber: res.result.phoneNumber || "",
          gender: res.result.gender || "",
          university: res.result.university || "",
          major: res.result.major || "",
          address: res.result.address || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch student info", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate Full Name
    if (!formData.fullName || !formData.fullName.trim() || formData.fullName.trim().length < 2 || formData.fullName.trim().length > 100) {
      newErrors.fullName = "Họ tên phải từ 2 đến 100 ký tự.";
    }

    // Validate Phone Number
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống.";
    } else {
      const phoneStr = formData.phoneNumber.replace(/\s/g, '');
      if (!/^\d{10}$/.test(phoneStr)) {
        newErrors.phoneNumber = "Số điện thoại phải gồm đúng 10 chữ số.";
      }
    }

    // Validate Age > 16
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống.";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        newErrors.dateOfBirth = "Bạn phải đủ 16 tuổi trở lên để cập nhật hồ sơ.";
      }
    }

    // Validate Gender
    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
    }

    // Validate University
    if (!formData.university || !formData.university.trim()) {
      newErrors.university = "Trường đại học không được để trống.";
    }

    // Validate Major
    if (!formData.major || !formData.major.trim()) {
      newErrors.major = "Chuyên ngành không được để trống.";
    }

    // Validate Address
    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await userService.updateProfileStudent(formData);
      if (res.result) {
        setStudentInfo(res.result);
        setIsEditing(false);
        setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Có lỗi xảy ra khi cập nhật." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới phải khác mật khẩu hiện tại!" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Đổi mật khẩu thất bại." });
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = studentInfo?.fullName || user?.fullName || user?.username || "Sinh viên";
  const displayMajor = studentInfo?.major || "Chưa cập nhật chuyên ngành";
  const displayUni = studentInfo?.university || "Chưa cập nhật trường";

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">

      {/* ══════════════════════════════════════════
          BANNER
      ══════════════════════════════════════════ */}
      <div className="relative h-40 bg-[#0f1f4b] overflow-hidden">
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
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
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
              {/* Avatar */}
              <div className="relative flex-shrink-0 -mt-10">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                  <ImageWithFallback
                    src={user?.avatar || "https://images.unsplash.com/photo-1600178572204-6ac8886aae63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzU4NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg" title="Đã xác thực">
                  <BadgeCheck className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* Name & info */}
              <div className="flex-1 pb-4 pt-2 sm:pt-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="text-2xl font-extrabold text-gray-900">{displayName}</h1>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      {displayMajor}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {displayUni}
                    </p>
                  </div>
                  {/* Edit Profile button */}
                  {activeTab === 'info' && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl text-sm font-semibold transition-all border border-gray-200 hover:border-blue-200">
                      <Edit className="w-3.5 h-3.5" />
                      Chỉnh sửa hồ sơ
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-3 max-w-xl">
                  {studentInfo?.address ? `Sống tại ${studentInfo.address}. ` : ''}Đam mê học hỏi và phát triển. Đã tích lũy kinh nghiệm qua nhiều công việc part-time, luôn hoàn thành đúng hạn và duy trì thái độ chuyên nghiệp.
                </p>
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
                <div className="text-2xl font-extrabold text-amber-600 leading-none">4.8</div>
                <div className="text-[10px] text-amber-500 font-semibold mt-1 uppercase tracking-wide">Đánh giá</div>
              </div>

              {/* Completed jobs */}
              <div className="group relative bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600 leading-none">{workHistory.length}</div>
                <div className="text-[10px] text-blue-500 font-semibold mt-1 uppercase tracking-wide">Việc xong</div>
              </div>

              {/* Total hours */}
              <div className="group relative bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-violet-600 leading-none">156</div>
                <div className="text-[10px] text-violet-500 font-semibold mt-1 uppercase tracking-wide">Giờ làm</div>
              </div>

              {/* Response rate */}
              <div className="group relative bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-md duration-200">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 leading-none">98%</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-1 uppercase tracking-wide">Phản hồi</div>
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
                    onClick={() => {
                      setActiveTab(key);
                      setIsEditing(false);
                      setMessage({ type: "", text: "" });
                      setErrors({});
                    }}
                    className={`relative flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 px-5 text-sm font-semibold transition-colors duration-200 ${
                      active ? "text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
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

          {/* Alert Message */}
          {message.text && (
            <div className={`mx-7 mt-5 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* ── TAB CONTENT ── */}
          <div className="p-6 space-y-5">

            {/* ════ INFO TAB ════ */}
            {activeTab === "info" && (
              <>
                {!isEditing ? (
                  <section>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Thông tin cơ bản
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { icon: MapPin,       color: "bg-blue-100 text-blue-600",    label: "Địa chỉ",    value: studentInfo?.address },
                        { icon: Calendar,     color: "bg-violet-100 text-violet-600", label: "Ngày sinh", value: studentInfo?.dateOfBirth },
                        { icon: GraduationCap,color: "bg-cyan-100 text-cyan-600",    label: "Trường",     value: studentInfo?.university },
                        { icon: TrendingUp,   color: "bg-emerald-100 text-emerald-600",label: "Chuyên ngành",value: studentInfo?.major },
                        { icon: Mail,         color: "bg-pink-100 text-pink-600",    label: "Email",      value: studentInfo?.email },
                        { icon: Phone,        color: "bg-orange-100 text-orange-600", label: "Điện thoại", value: studentInfo?.phoneNumber },
                      ].map(({ icon: Icon, color, label, value }) => (
                        <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
                            <div className="text-sm font-medium text-gray-800 mt-0.5">{value || <span className="text-gray-400 italic">Chưa cập nhật</span>}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Cập nhật hồ sơ cá nhân</h3>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input type="text" value={formData.fullName} onChange={e => {setFormData({...formData, fullName: e.target.value}); setErrors({...errors, fullName: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} required />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input 
                          type="tel" 
                          value={formData.phoneNumber} 
                          onChange={e => {
                            const onlyNums = e.target.value.replace(/[^0-9+]/g, '');
                            setFormData({...formData, phoneNumber: onlyNums}); 
                            setErrors({...errors, phoneNumber: ''});
                          }} 
                          className={`w-full p-2.5 rounded-lg border ${errors.phoneNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} 
                        />
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh (YYYY-MM-DD)</label>
                        <input type="date" value={formData.dateOfBirth} onChange={e => {setFormData({...formData, dateOfBirth: e.target.value}); setErrors({...errors, dateOfBirth: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.dateOfBirth ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} />
                        {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select value={formData.gender} onChange={e => {setFormData({...formData, gender: e.target.value}); setErrors({...errors, gender: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.gender ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}>
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trường đại học</label>
                        <input type="text" value={formData.university} onChange={e => {setFormData({...formData, university: e.target.value}); setErrors({...errors, university: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.university ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} />
                        {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                        <input type="text" value={formData.major} onChange={e => {setFormData({...formData, major: e.target.value}); setErrors({...errors, major: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.major ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} />
                        {errors.major && <p className="text-red-500 text-xs mt-1">{errors.major}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input type="text" value={formData.address} onChange={e => {setFormData({...formData, address: e.target.value}); setErrors({...errors, address: ''})}} className={`w-full p-2.5 rounded-lg border ${errors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                        Hủy
                      </button>
                      <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
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
                  </div>
                ))}
              </section>
            )}

            {/* ════ PASSWORD TAB ════ */}
            {activeTab === "password" && (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleChangePassword} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Đổi mật khẩu</h3>
                      <p className="text-xs text-gray-500">Đảm bảo tài khoản của bạn luôn được bảo mật</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input 
                        type={showOldPassword ? "text" : "password"} 
                        value={passwordForm.oldPassword} 
                        onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                        className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowOldPassword(!showOldPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        value={passwordForm.newPassword} 
                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                        className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={passwordForm.confirmPassword} 
                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                        className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cập nhật mật khẩu"}
                  </button>
                </form>
              </div>
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