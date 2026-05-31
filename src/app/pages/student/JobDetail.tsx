import { useParams, Link } from "react-router";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { jobService, JobResponse } from "../../../services/jobService";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedJobs } from "../../contexts/SavedJobsContext";
import { applicationService } from "../../../services/applicationService";
import { userService, EmployerResponse, StudentResponse } from "../../../services/userService";
import { Timer, Map as MapIcon, Calendar, Info, Clock, DollarSign, Star, AlertCircle, CheckCircle, ArrowLeft, Share2, Bookmark, Loader2, MapPin, Flag, X, Building, Mail, Phone, Upload, XCircle } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { calculateDistance, formatDistance } from "../../../utils/location";


// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
import { reportService, ReportRequest } from "../../../services/reportService";
import { reviewService, ReviewResponse } from "../../../services/reviewService";
import { uploadImageToCloudinary } from "../../../services/uploadService";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isJobSaved, saveJob, unsaveJob } = useSavedJobs();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [studentInfo, setStudentInfo] = useState<StudentResponse | null>(null);

  const [reportTarget, setReportTarget] = useState<{ type: "JOB" | "USER", targetId: string, title: string } | null>(null);
  const [reportCategory, setReportCategory] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportEvidence, setReportEvidence] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState(false);
  const [employerDetail, setEmployerDetail] = useState<EmployerResponse | null>(null);
  const [isLoadingEmployer, setIsLoadingEmployer] = useState(false);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);


  useEffect(() => {
    if (id) {
      fetchJobDetail(Number(id));

      // Khắc phục tăng 2 lượt xem do React Strict Mode hoặc F5 reload trang
      const jobIdStr = id.toString();
      const viewedJobs = JSON.parse(sessionStorage.getItem("viewed_jobs") || "[]");
      if (!viewedJobs.includes(jobIdStr)) {
        jobService.incrementViewCount(Number(id))
          .then(() => {
            viewedJobs.push(jobIdStr);
            sessionStorage.setItem("viewed_jobs", JSON.stringify(viewedJobs));
          })
          .catch(err => console.error("Failed to increment view count:", err));
      }

      if (user && user.role === "STUDENT") {
        checkApplicationStatus(Number(id));
        fetchStudentInfo();
      }
    }
  }, [id, user]);

  const fetchStudentInfo = async () => {
    try {
      const res = await userService.getStudentMyInfo();
      if (res.result) {
        setStudentInfo(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch student info", error);
    }
  };

  const checkApplicationStatus = async (jobId: number) => {
    try {
      const studentRes = await userService.getStudentMyInfo();
      if (!studentRes.result) return;

      const res = await jobService.getStudentJobHistory(studentRes.result.id);
      if (res.result) {
        // jobService.getStudentJobHistory returns JobResponse[] where id is jobId, and applicationId is the application's ID.
        const applicationJob = res.result.find(app => app.id === jobId);
        if (applicationJob && applicationJob.applicationId) {
          setHasApplied(true);
          setApplicationId(applicationJob.applicationId);
        } else {
          setHasApplied(false);
          setApplicationId(null);
        }
      }
    } catch (e) {
      console.error("Failed to check application status:", e);
    }
  };

  const fetchJobDetail = async (jobId: number) => {
    setIsLoading(true);
    try {
      const res = await jobService.getJobDetail(jobId);
      if (res.result) {
        setJob(res.result);
        fetchReviews(res.result.employerId);
      }
    } catch (error) {
      console.error("Failed to fetch job details", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (employerId: string) => {
    try {
      const res = await reviewService.getReviewsByEmployerId(employerId);
      if (res.result) {
        const studentReviews = res.result.filter(r => r.reviewType === "STUDENT_TO_EMPLOYER");
        setReviews(studentReviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  useEffect(() => {
    if (!job) return;
    const cooldownData = localStorage.getItem(`cooldown_job_${job.id}`);
    if (cooldownData) {
      const cooldownUntil = parseInt(cooldownData, 10);
      const now = new Date().getTime();
      if (now < cooldownUntil) {
        setCooldownRemaining(Math.floor((cooldownUntil - now) / 1000));
      } else {
        localStorage.removeItem(`cooldown_job_${job.id}`);
      }
    }
  }, [job, hasApplied]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownRemaining > 0 && !hasApplied) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            if (job) localStorage.removeItem(`cooldown_job_${job.id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining, hasApplied, job]);

  const handleToggleSave = async () => {
    if (!user) {
      Swal.fire('Thông báo', "Vui lòng đăng nhập để lưu việc làm!", 'info');
      return;
    }
    if (user.role === "EMPLOYER") {
      Swal.fire('Thông báo', "Đăng nhập với tài khoản học sinh để thực hiện chức năng này", 'info');
      return;
    }
    if (!job) return;

    setIsSaving(true);
    try {
      if (isJobSaved(job.id)) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job.id);
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      Swal.fire('Thông báo', "Vui lòng đăng nhập để ứng tuyển!", 'info');
      return;
    }
    if (user.role === "EMPLOYER") {
      Swal.fire('Thông báo', "Đăng nhập với tài khoản học sinh để thực hiện chức năng này", 'info');
      return;
    }
    if (!job) return;

    if (cooldownRemaining > 0) {
      Swal.fire('Thông báo', "Bạn phải chờ hết thời gian đếm ngược mới được ứng tuyển lại!", 'info');
      return;
    }

    setIsApplying(true);
    try {
      const response = await applicationService.applyJob({ jobId: job.id });
      if (response.result) {
        setHasApplied(true);
        setApplicationId(response.result.id);
        // Clear cooldown if it exists when successfully applying
        localStorage.removeItem(`cooldown_job_${job.id}`);
        setCooldownRemaining(0);
      }
      Swal.fire('Thông báo', "Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.", 'info');
    } catch (error: any) {
      Swal.fire('Thông báo', error.message || "Đã xảy ra lỗi khi ứng tuyển. Vui lòng thử lại sau.", 'info');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!applicationId) {
      Swal.fire('Thông báo', "Không có thông tin ứng tuyển để hủy.", 'info');
      return;
    }

    setIsCancelling(true);
    try {
      await applicationService.deleteApplyJob(applicationId);
      setHasApplied(false);
      setApplicationId(null);

      // Set 5 minutes cooldown (5 * 60 * 1000)
      if (job) {
        const cooldownUntil = new Date().getTime() + 5 * 60 * 1000;
        localStorage.setItem(`cooldown_job_${job.id}`, cooldownUntil.toString());
        setCooldownRemaining(5 * 60);
      }

      Swal.fire('Thông báo', "Bạn đã hủy ứng tuyển thành công. Vui lòng đợi 5 phút để có thể ứng tuyển lại công việc này.", 'info');
    } catch (error: any) {
      Swal.fire('Thông báo', error.message || "Hủy ứng tuyển thất bại. Vui lòng thử lại sau.", 'info');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewEmployer = async () => {
    if (!job) return;
    setIsEmployerModalOpen(true);
    if (!employerDetail) {
      setIsLoadingEmployer(true);
      try {
        const res = await userService.getEmployerById(job.employerId);
        if (res.result) {
          setEmployerDetail(res.result);
        } else {
          throw new Error("Không có dữ liệu");
        }
      } catch (e) {
        console.error("Failed to fetch employer", e);
        // Fallback using job info
        setEmployerDetail({
          id: job.employerId,
          username: "",
          email: "",
          fullName: job.employerName,
          companyName: job.employerName,
          companyAddress: job.address || "Đang cập nhật",
          description: "Thông tin chi tiết về nhà tuyển dụng này hiện đang được cập nhật.",
          isBlocked: false,
          isActived: true,
        });
      } finally {
        setIsLoadingEmployer(false);
      }
    }
  };

  const handleReport = async () => {
    if (!user) {
      Swal.fire('Thông báo', "Vui lòng đăng nhập để báo cáo!", 'info');
      return;
    }
    if (!reportCategory) {
      Swal.fire('Thông báo', "Vui lòng chọn lý do báo cáo!", 'info');
      return;
    }
    if (reportCategory === "Khác" && !reportReason.trim()) {
      Swal.fire('Thông báo', "Vui lòng nhập chi tiết lý do báo cáo!", 'info');
      return;
    }
    const isEvidenceRequired = reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí");
    if (isEvidenceRequired && !reportEvidence) {
      Swal.fire('Thông báo', "Vui lòng tải lên ảnh minh chứng (tin nhắn, ảnh chụp màn hình) cho lý do này!", 'warning');
      return;
    }
    if (!reportTarget) return;

    setIsSubmittingReport(true);
    try {
      const finalReason = reportCategory === "Khác" ? `Khác: ${reportReason.trim()}` : (reportReason.trim() ? `${reportCategory} - ${reportReason.trim()}` : reportCategory);
      const request: ReportRequest = {
        targetType: reportTarget.type,
        targetId: reportTarget.targetId,
        reason: finalReason,
        evidenceUrl: reportEvidence || undefined,
      };
      await reportService.createReport(request);
      Swal.fire('Thành công', "Cảm ơn bạn! Chúng tôi đã tiếp nhận báo cáo và sẽ xử lý trong vòng 24-48 giờ.", 'success');
      setReportTarget(null);
      setReportCategory("");
      setReportReason("");
      setReportEvidence(null);
    } catch (error: any) {
      Swal.fire('Thông báo', error.message || "Báo cáo thất bại. Vui lòng thử lại.", 'info');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Không tìm thấy công việc</h2>
          <Link to="/jobs" className="text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
          {/* Job Image Banner */}
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <ImageWithFallback
              src={job.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Tuyển gấp
                    </span>
                  )}
                </div>
                <h3
                  className="text-gray-600 font-medium hover:text-blue-600 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  onClick={handleViewEmployer}
                  title="Xem thông tin nhà tuyển dụng"
                >
                  <Building className="w-4 h-4" />
                  {job.employerName}
                </h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <Bookmark className={`w-5 h-5 ${job && isJobSaved(job.id) ? "fill-blue-600 text-blue-600" : "text-gray-600"}`} />
                  )}
                </button>
                <button
                  onClick={() => setReportTarget({ type: "JOB", targetId: job.id.toString(), title: "Báo cáo công việc" })}
                  className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  title="Báo cáo công việc"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="flex items-center gap-2 mb-6 cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors inline-flex"
              onClick={() => setIsReviewsModalOpen(true)}
              title="Nhấn để xem đánh giá về nhà tuyển dụng"
            >
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-700">
                {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : "5.0"} ({reviews.length} đánh giá)
              </span>
              <span className="text-sm text-blue-600 hover:underline ml-2">Xem chi tiết</span>
            </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lương/giờ</div>
                <div className="text-sm font-bold text-emerald-700">{job.salary.toLocaleString()}đ</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-blue-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ca làm</div>
                <div className="text-sm font-bold text-blue-700">{job.workingShift}</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <AlertCircle className="w-5 h-5 text-orange-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Số lượng</div>
                <div className="text-sm font-bold text-orange-700">Còn {job.vacancies} chỗ</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-purple-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hạn nộp</div>
                <div className="text-sm font-bold text-purple-700">
                  {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString("vi-VN") : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <MapIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Địa điểm làm việc</div>
                  <div className="text-sm text-gray-700 font-medium">{job.address}</div>
                </div>
                {user?.role === "STUDENT" && (
                  <>
                    {studentInfo?.latitude != null && studentInfo?.longitude != null && job.locationLatitude != null && job.locationLongitude != null ? (
                      <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {formatDistance(calculateDistance(studentInfo.latitude, studentInfo.longitude, job.locationLatitude, job.locationLongitude))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic text-right">
                        {studentInfo?.latitude == null || studentInfo?.longitude == null
                          ? "Cập nhật vị trí hồ sơ để xem khoảng cách"
                          : "Công việc này chưa có tọa độ vị trí"}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <Timer className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ngày đăng tin</div>
                  <div className="text-sm text-gray-700 font-medium">
                    {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            {job.isHide || (job.vacancies ?? 0) <= 0 ? (
              <div className="w-full flex items-center justify-center gap-2 bg-gray-100 border border-gray-200 text-gray-500 py-3 rounded-lg font-semibold">
                <XCircle className="w-5 h-5" />
                Đã đủ người — không thể ứng tuyển
              </div>
            ) : hasApplied ? (
              <button
                onClick={handleCancelApplication}
                disabled={isCancelling}
                className="w-full flex items-center justify-center bg-white border border-red-400 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang hủy...
                  </>
                ) : (
                  "Hủy ứng tuyển"
                )}
              </button>
            ) : cooldownRemaining > 0 ? (
              <button
                disabled
                className="w-full flex items-center justify-center bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                <Timer className="w-5 h-5 mr-2" />
                Thử lại sau {Math.floor(cooldownRemaining / 60)}:{(cooldownRemaining % 60).toString().padStart(2, '0')}
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  "Ứng tuyển ngay"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Mô tả công việc
          </h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Time Slots */}
        {job.timeSlots && job.timeSlots.length > 0 && (
          <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Lịch làm việc chi tiết
            </h2>
            <div className="grid gap-3">
              {job.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {new Date(slot.workDate).toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Map */}
        {job.locationLatitude && job.locationLongitude && (
          <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-rose-600" />
              Vị trí trên bản đồ
            </h2>
            <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200" style={{ zIndex: 0, isolation: "isolate" }}>
              <MapContainer
                center={[job.locationLatitude, job.locationLongitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[job.locationLatitude, job.locationLongitude]}>
                  <Popup>{job.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Reviews - Removed since backend doesn't have review data for jobs yet */}
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{reportTarget.title}</h3>
                <button onClick={() => {
                  setReportTarget(null);
                  setReportCategory("");
                  setReportReason("");
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng chọn lý do bạn muốn báo cáo. Quản trị viên sẽ xem xét và xử lý.
              </p>

              <div className="mb-4 space-y-2">
                {(reportTarget.type === "JOB" ? [
                  "Yêu cầu đóng phí / đặt cọc trước",
                  "Việc làm lừa đảo / đa cấp",
                  "Thông tin công việc không đúng sự thật",
                  "Khác"
                ] : [
                  "Tài khoản giả mạo",
                  "Hành vi lừa đảo",
                  "Tên / Avatar không phù hợp",
                  "Khác"
                ]).map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                    <input
                      type="radio"
                      name="reportCategory"
                      value={category}
                      checked={reportCategory === category}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">{category}</span>
                  </label>
                ))}
              </div>

              {reportCategory === "Khác" && (
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Nhập chi tiết lý do báo cáo..."
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                />
              )}

              {reportEvidence && (
                <div className="relative mb-4">
                  <img src={reportEvidence} alt="Bằng chứng" className="max-h-40 rounded-lg object-contain border border-gray-200" />
                  <button
                    onClick={() => setReportEvidence(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200">
                  <Upload className="w-4 h-4" />
                  Tải ảnh minh chứng {(reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí")) && <span className="text-red-500">*</span>}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadImageToCloudinary(file);
                        setReportEvidence(url);
                      } catch (error) {
                        Swal.fire('Thông báo', "Lỗi tải ảnh lên. Vui lòng thử lại.", 'info');
                      }
                    }}
                  />
                </label>
              </div>

              <div className="mt-4 mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">
                  <span className="font-semibold">Lưu ý:</span> Hành vi cố tình báo cáo sai sự thật nhiều lần có thể dẫn đến việc tài khoản của bạn bị hạn chế.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setReportTarget(null);
                    setReportCategory("");
                    setReportReason("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReport}
                  disabled={isSubmittingReport || !reportCategory || (reportCategory === "Khác" && !reportReason.trim()) || ((reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí")) && !reportEvidence)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employer Profile Modal */}
      {isEmployerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="text-xl font-bold">Thông tin nhà tuyển dụng</h3>
              <button onClick={() => setIsEmployerModalOpen(false)} className="text-white/80 hover:bg-white/20 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {isLoadingEmployer ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-500">Đang tải thông tin...</p>
                </div>
              ) : employerDetail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm">
                      {employerDetail.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{employerDetail.companyName}</h4>
                      <p className="text-gray-500">{employerDetail.fullName}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {employerDetail.email && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Email liên hệ</p>
                          <p className="text-gray-900 font-medium">{employerDetail.email}</p>
                        </div>
                      </div>
                    )}
                    {employerDetail.phoneNumber && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Số điện thoại</p>
                          <p className="text-gray-900 font-medium">{employerDetail.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {employerDetail.companyAddress && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Địa chỉ công ty</p>
                          <p className="text-gray-900 font-medium">{employerDetail.companyAddress}</p>
                        </div>
                      </div>
                    )}
                    {employerDetail.description && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <Info className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Mô tả</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{employerDetail.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Không thể tải thông tin nhà tuyển dụng lúc này.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsEmployerModalOpen(false);
                  setReportTarget({ type: "USER", targetId: job.employerId, title: "Báo cáo nhà tuyển dụng" });
                }}
                className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Flag className="w-4 h-4" /> Báo cáo tài khoản
              </button>
              <button
                onClick={() => setIsEmployerModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                Đánh giá nhà tuyển dụng
              </h3>
              <button onClick={() => setIsReviewsModalOpen(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-700 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Chưa có đánh giá nào cho nhà tuyển dụng này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {review.studentAvatar ? (
                            <img src={review.studentAvatar} alt={review.studentName || "Sinh viên"} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100" />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm">
                              {review.studentName ? review.studentName.charAt(0).toUpperCase() : "SV"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{review.studentName || "Sinh viên"}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <span className="text-sm font-bold text-yellow-700 mr-1">{review.rating}.0</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap border border-gray-100 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}