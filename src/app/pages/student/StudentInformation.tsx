import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Star, 
  GraduationCap, 
  Briefcase, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  Calendar, 
  CheckCircle,
  MessageSquare,
  DollarSign,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { userService, StudentResponse } from "../../../services/userService";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService } from "../../../services/applicationService";
import { reviewService, ReviewResponse } from "../../../services/reviewService";

export default function StudentInformation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const studentId = searchParams.get("id");

  // States
  const [studentInfo, setStudentInfo] = useState<StudentResponse | null>(null);
  const [completedJobs, setCompletedJobs] = useState<JobResponse[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<ReviewResponse[]>([]);
  const [isApplied, setIsApplied] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Security Route Guard
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    const isAuthorized = 
      user.role === "ADMIN" || 
      user.role === "EMPLOYER" || 
      (user.role === "STUDENT" && String(user.id) === String(studentId));

    if (!isAuthorized) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, isAuthLoading, studentId, navigate]);

  // Fetch all necessary data
  useEffect(() => {
    if (!studentId) {
      setError("Không tìm thấy mã số sinh viên hợp lệ.");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch Student Info
        const studentRes = await userService.getStudentById(studentId);
        if (!studentRes.result) {
          setError("Không thể tải thông tin sinh viên.");
          setIsLoading(false);
          return;
        }
        setStudentInfo(studentRes.result);

        // 2. Fetch Job History & Filter Completed
        const [historyRes, appsRes, reviewsRes] = await Promise.all([
          jobService.getStudentJobHistory(studentId).catch(() => null),
          applicationService.getStudentApplications().catch(() => null),
          reviewService.getReviewsByStudentId(studentId).catch(() => null),
        ]);

        if (historyRes?.result) {
          const apps = appsRes?.result || [];
          const merged = historyRes.result.map((job: any) => {
            const app = apps.find((a: any) => 
              (a.id && job.applicationId && String(a.id) === String(job.applicationId)) || 
              (a.jobId && String(a.jobId) === String(job.id)) ||
              (a.job_id && String(a.job_id) === String(job.id))
            );
            return {
              ...job,
              status: app?.status || job.status
            };
          });
          const completed = merged.filter((j: any) => j.status?.toUpperCase() === 'COMPLETED');
          setCompletedJobs(completed);
        }

        // 3. Fetch Reviews Received
        if (reviewsRes?.result) {
          const received = reviewsRes.result.filter(r => r.reviewType === "EMPLOYER_TO_STUDENT");
          setReviewsReceived(received);
        }

        // 4. Check if the student has an ACCEPTED or COMPLETED application for any of the currently logged-in employer's jobs
        if (user?.role === "EMPLOYER") {
          const employerAppsRes = await applicationService.getEmployerApplications().catch(() => null);
          if (employerAppsRes?.result) {
            const hasAcceptedApp = employerAppsRes.result.some(
              (app) => String(app.studentId) === String(studentId) && 
                       (app.status === "ACCEPTED" || app.status === "COMPLETED")
            );
            setIsApplied(hasAcceptedApp);
          }
        }
      } catch (err) {
        console.error("Error loading student details:", err);
        setError("Đã xảy ra lỗi khi kết nối hệ thống. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId, user]);

  // Compute average rating
  const averageRating = useMemo(() => {
    if (reviewsReceived.length === 0) return 5.0;
    const sum = reviewsReceived.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviewsReceived.length;
  }, [reviewsReceived]);

  const displayRating = (studentInfo?.rating && studentInfo.rating > 0) ? studentInfo.rating : averageRating;

  // Security Check: Who can view sensitive contact details
  const canSeeContact = useMemo(() => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    if (user.role === "STUDENT" && String(user.id) === String(studentId)) return true;
    if (user.role === "EMPLOYER" && isApplied) return true;
    return false;
  }, [user, studentId, isApplied]);

  // Masking helpers
  const maskEmail = (email?: string) => {
    if (!email) return "Chưa cập nhật";
    if (canSeeContact) return email;
    const parts = email.split("@");
    if (parts.length !== 2) return "********";
    const name = parts[0];
    const domain = parts[1];
    return `${name.substring(0, Math.min(3, name.length))}***@${domain}`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return "Chưa cập nhật";
    if (canSeeContact) return phone;
    return `${phone.substring(0, Math.max(3, phone.length - 6))}******`;
  };

  const maskAddress = (address?: string) => {
    if (!address) return "Chưa cập nhật";
    if (canSeeContact) return address;
    // Show only city/province if possible
    const parts = address.split(",");
    const city = parts[parts.length - 1]?.trim() || "Việt Nam";
    return `(Địa chỉ cụ thể bị ẩn) - ${city}`;
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-gray-50/50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">Đang tải hồ sơ sinh viên...</p>
      </div>
    );
  }

  if (error || !studentInfo) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-gray-50/50">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-gray-500 mb-6">{error || "Không tìm thấy hồ sơ sinh viên."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      
      {/* ── Breadcrumb & Action ── */}
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại</span>
      </button>

      {/* ── Top Profile Header Card ── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-indigo-50/30 rounded-full blur-3xl -z-10" />

        {/* Student Avatar */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-lg shadow-blue-100 shrink-0 select-none transform hover:scale-105 transition-transform duration-300">
          {studentInfo.avatar ? (
            <img 
              src={studentInfo.avatar} 
              alt={studentInfo.fullName} 
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            studentInfo.fullName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info detail and statistics */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {studentInfo.fullName}
            </h1>
            <p className="text-blue-600 font-semibold flex items-center justify-center md:justify-start gap-1.5 mt-1">
              <GraduationCap className="w-4.5 h-4.5" />
              <span>{studentInfo.major || "Chưa cập nhật chuyên ngành"}</span>
            </p>
            <p className="text-gray-400 text-sm font-medium mt-0.5">
              {studentInfo.university || "Chưa cập nhật trường học"}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {/* Rating badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full font-extrabold text-sm shadow-sm select-none">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{displayRating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider ml-0.5">Đánh giá</span>
            </div>

            {/* Completed count badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full font-extrabold text-sm shadow-sm select-none">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>{completedJobs.length}</span>
              <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider ml-0.5">Việc xong</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Information Card (With security check) ── */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Section title & lock status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông tin liên hệ
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Số điện thoại, email và địa chỉ cụ thể của sinh viên</p>
          </div>

          {/* Premium unlock status badge */}
          {canSeeContact ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full font-bold text-xs shadow-sm self-start select-none">
              <Unlock className="w-3.5 h-3.5" />
              <span>Đã mở khóa thông tin</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-full font-bold text-xs shadow-sm self-start select-none">
              <Lock className="w-3.5 h-3.5" />
              <span>Ẩn (Chỉ hiển thị khi đã chấp nhận ứng tuyển)</span>
            </div>
          )}
        </div>

        {/* Contact details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email card */}
          <div className="group bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</span>
            </div>
            <p className={`text-base font-bold transition-colors ${canSeeContact ? "text-gray-900 group-hover:text-blue-700" : "text-gray-400 italic"}`}>
              {maskEmail(studentInfo.email)}
            </p>
          </div>

          {/* Phone card */}
          <div className="group bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:bg-violet-50/30 hover:border-violet-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Điện thoại</span>
            </div>
            <p className={`text-base font-bold transition-colors ${canSeeContact ? "text-gray-900 group-hover:text-violet-700" : "text-gray-400 italic"}`}>
              {maskPhone(studentInfo.phoneNumber)}
            </p>
          </div>

          {/* Address card */}
          <div className="group bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Địa chỉ</span>
            </div>
            <p className={`text-base font-bold transition-colors ${canSeeContact ? "text-gray-900 group-hover:text-emerald-700" : "text-gray-400 italic"}`}>
              {maskAddress(studentInfo.address)}
            </p>
          </div>
        </div>

        {/* Informative notice block if restricted */}
        {!canSeeContact && (
          <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Quyền bảo mật thông tin cá nhân của Sinh viên</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Để bảo vệ quyền riêng tư, thông tin liên lạc nhạy cảm của sinh viên (số điện thoại, email cụ thể và địa chỉ chi tiết) sẽ bị ẩn.
                Các thông tin này sẽ **tự động mở khóa hoàn toàn** ngay sau khi bạn chấp nhận đơn ứng tuyển của sinh viên này vào bất kỳ công việc nào của bạn.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── History and Reviews Section (Always publicly visible to employers) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Job History */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col min-h-[400px]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Lịch sử làm việc ({completedJobs.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Các công việc sinh viên đã hoàn thành xuất sắc trên nền tảng</p>
          </div>

          {/* List items */}
          <div className="space-y-4 flex-1">
            {completedJobs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl min-h-[250px]">
                <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold">Chưa có lịch sử làm việc</p>
                <p className="text-gray-400 text-xs mt-1">Sinh viên chưa hoàn thành dự án hoặc công việc nào.</p>
              </div>
            ) : (
              completedJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="group bg-gray-50 border border-gray-100 hover:border-blue-200 rounded-2xl p-4.5 shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-gray-500 text-xs font-semibold mt-0.5">{job.employerName}</p>
                    </div>
                    {/* Salary badge */}
                    <span className="shrink-0 flex items-center gap-0.5 text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{job.salary.toLocaleString("vi-VN")}đ/giờ</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200/50 text-[11px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Ca làm việc: {job.workingShift || "Chưa cập nhật"}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col min-h-[400px]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Đánh giá từ nhà tuyển dụng ({reviewsReceived.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Nhận xét và xếp hạng năng lực làm việc từ các đối tác</p>
          </div>

          {/* List items */}
          <div className="space-y-4 flex-1">
            {reviewsReceived.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-2xl min-h-[250px]">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold">Chưa có đánh giá nào</p>
                <p className="text-gray-400 text-xs mt-1">Chưa có nhà tuyển dụng nào gửi đánh giá cho sinh viên này.</p>
              </div>
            ) : (
              reviewsReceived.map((review) => (
                <div 
                  key={review.id} 
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm">
                        ⭐
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Nhà tuyển dụng liên kết</h4>
                        <p className="text-gray-400 text-[10px]">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>

                    {/* Stars badge */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed italic bg-white border border-gray-100 rounded-xl p-3 shadow-inner shadow-gray-50">
                    "{review.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
