import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService } from "../../../services/applicationService";
import { userService } from "../../../services/userService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Loader2,
  FileText,
  Trash2,
  ExternalLink,
  MapPin,
  Building2,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronRight,
  ChevronLeft,
  Filter,
  AlertCircle,
  Banknote,
  Star,
  MessageSquare,
  User
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";
import { reviewService, ReviewResponse } from "../../../services/reviewService";

export default function StudentApplications() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

  const setCurrentPage = (pageIdx: number | ((prev: number) => number)) => {
    setSearchParams((prev) => {
      const nextIdx = typeof pageIdx === "function" ? pageIdx(currentPage) : pageIdx;
      if (nextIdx === 0) {
        prev.delete("page");
      } else {
        prev.set("page", String(nextIdx + 1));
      }
      return prev;
    });
  };

  const ITEMS_PER_PAGE = 5;
  const isFirstRender = useRef(true);

  // Reset currentPage to 0 when filterStatus or searchQuery changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(0);
  }, [searchQuery, filterStatus]);

  const [reviewedMap, setReviewedMap] = useState<Record<string, ReviewResponse>>({});
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [reviewDetailModal, setReviewDetailModal] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const makeReviewKey = (employerId: string, jobId: number) => `${employerId}_${jobId}`;

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status?.toUpperCase() === 'PENDING').length,
    accepted: applications.filter(a => a.status?.toUpperCase() === 'ACCEPTED' || a.status?.toUpperCase() === 'APPROVED').length,
    rejected: applications.filter(a => a.status?.toUpperCase() === 'REJECTED').length,
    completed: applications.filter(a => a.status?.toUpperCase() === 'COMPLETED').length,
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get student ID
      const studentRes = await userService.getStudentMyInfo();
      if (!studentRes.result) throw new Error("Không thể lấy thông tin sinh viên.");

      // 2. Fetch job history details and applications simultaneously
      const [historyRes, appsRes] = await Promise.all([
        jobService.getStudentJobHistory(studentRes.result.id),
        applicationService.getStudentApplications().catch(err => {
          console.warn("Backend API GET /application chưa sẵn sàng:", err);
          return null; // Fallback gracefully if endpoint doesn't exist
        })
      ]);
      
      if (historyRes?.result) {
        const studentApps = appsRes?.result || [];
        console.log("Danh sách ứng tuyển từ API /application:", studentApps);
        
        // Helper to handle Spring Boot LocalDateTime array format: [year, month, day, hour, minute, second]
        const parseDateHelper = (val: any) => {
          if (!val) return new Date();
          if (Array.isArray(val)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = val;
            return new Date(year, month - 1, day, hour, minute, second);
          }
          return new Date(val);
        };

        // Merge the appliedAt from applications into the job history items if available
        const merged = historyRes.result.map(job => {
          const app = studentApps.find((a: any) => 
            (a.id && job.applicationId && String(a.id) === String(job.applicationId)) || 
            (a.jobId && String(a.jobId) === String(job.id)) ||
            (a.job_id && String(a.job_id) === String(job.id))
          );
          
          if (app) {
            return {
              ...job,
              // Backend might return applied_at or appliedAt
              appliedAt: app.appliedAt || app.applied_at,
              applicationId: app.id || job.applicationId,
              status: app.status || job.status
            };
          }
          return {
            ...job,
            appliedAt: undefined // Explicitly unset it if not found, to trigger the "Đang cập nhật..." text
          };
        });

        // Sort by newest application date (or job creation date if appliedAt missing)
        const sorted = merged.sort((a, b) => {
          const dateA = parseDateHelper(a.appliedAt || a.createdAt).getTime();
          const dateB = parseDateHelper(b.appliedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        setApplications(sorted);
        setFilteredApplications(sorted);

        try {
          const reviewsRes = await reviewService.getReviewsWrittenByStudent(studentRes.result.id);
          if (reviewsRes.result) {
            const newMap: Record<string, ReviewResponse> = {};
            reviewsRes.result.forEach(r => {
              newMap[makeReviewKey(r.employerId, r.jobId)] = r;
            });
            setReviewedMap(newMap);
          }
        } catch (e) {
          console.warn("Could not fetch reviews:", e);
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải lịch sử ứng tuyển.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.employerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const status = app.status?.toUpperCase() || "";
      const matchesStatus = filterStatus === "ALL" || status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredApplications(filtered);
  }, [searchQuery, filterStatus, applications]);

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE) || 1;
  const paginatedApplications = filteredApplications.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để xem lịch sử ứng tuyển.");
      setIsLoading(false);
      return;
    }
    fetchApplications();
  }, [authLoading, isAuthenticated]);

  const handleDeleteClick = (job: any) => {
    // Chỉ lưu vào state để hiện Popup xác nhận
    setJobToDelete(job);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    
    const appId = jobToDelete.applicationId;

    if (!appId) {
      toast.error("Hệ thống (Backend) chưa trả về ID của đơn ứng tuyển này (Application ID bị trống). Không thể xóa được.");
      setJobToDelete(null);
      return;
    }

    setIsDeleting(appId);
    try {
      // Gọi service xóa
      const res = await applicationService.deleteApplyJob(appId);
      if (res.result || res.code === 1000) {
        setApplications(prev => prev.filter(app => (app.applicationId || app.id) !== appId));
        toast.success("Đã hủy đơn ứng tuyển thành công.");
      } else {
        toast.error(`Hủy ứng tuyển thất bại: ${res.message || 'Lỗi không xác định'}`);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(`Lỗi hệ thống khi hủy: ${err.message || "Vui lòng thử lại sau"}`);
    } finally {
      setIsDeleting(null);
      setJobToDelete(null); // Đóng popup
    }
  };

  const canDelete = (status: string) => {
    return status?.toUpperCase() === 'PENDING';
  };

  const handleOpenReview = (job: JobResponse) => {
    setReviewModal({
      jobId: job.id,
      employerId: job.employerId,
      employerName: job.employerName || "Nhà tuyển dụng",
      jobTitle: job.title
    });
    setReviewRating(5);
    setReviewHover(0);
    setReviewComment("");
    setReviewSuccess(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await reviewService.studentReviewEmployer({
        jobId: reviewModal.jobId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      if (res.result) {
        const key = makeReviewKey(reviewModal.employerId, reviewModal.jobId);
        setReviewedMap(prev => ({ ...prev, [key]: res.result! }));
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModal(null);
          setReviewSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleViewReviewDetail = async (job: JobResponse) => {
    const key = makeReviewKey(job.employerId, job.id);
    const myReview = reviewedMap[key] || null;
    
    setReviewDetailModal({
      employerName: job.employerName || "Nhà tuyển dụng",
      jobTitle: job.title,
      studentReview: myReview,
      employerReview: null,
      loading: true
    });

    try {
      const res = await reviewService.getReviewsWrittenByEmployer(job.employerId);
      if (res.result) {
        const empReview = res.result.find(r => r.jobId == job.id) || null;
        setReviewDetailModal(prev => prev ? { ...prev, employerReview: empReview, loading: false } : null);
      } else {
        setReviewDetailModal(prev => prev ? { ...prev, loading: false } : null);
      }
    } catch {
      setReviewDetailModal(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] bg-purple-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-wider uppercase text-xs mb-3">
              <span className="w-8 h-[2px] bg-blue-600" />
              Lịch sử của bạn
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Quản lý <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ứng tuyển</span>
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<FileText className="w-5 h-5" />} label="Tổng ứng tuyển" value={stats.total} color="blue" />
          <StatCard icon={<Timer className="w-5 h-5" />} label="Đang chờ" value={stats.pending} color="amber" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Đã duyệt" value={stats.accepted} color="emerald" />
          <StatCard icon={<Star className="w-5 h-5" />} label="Hoàn thành" value={stats.completed} color="indigo" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Từ chối" value={stats.rejected} color="rose" />
        </div>

        {/* Filters & List */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên công việc hoặc nhà tuyển dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 md:w-48 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="ACCEPTED">Đã chấp nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu của bạn...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-red-100 p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-semibold">{error}</p>
                <button onClick={fetchApplications} className="mt-4 text-blue-600 font-bold hover:underline">Thử lại</button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-blue-300" />
                </div>
                <p className="text-2xl font-black text-gray-800 mb-2">Không tìm thấy ứng tuyển nào</p>
                <p className="text-gray-500 font-medium">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div 
                  className="grid gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedApplications.map((app) => (
                      <ApplicationCard
                        key={app.id || app.applicationId}
                        application={app}
                        onDelete={() => handleDeleteClick(app)}
                        isDeleting={isDeleting === (app.applicationId || app.id)}
                        canDelete={canDelete(app.status)}
                        reviewedMap={reviewedMap}
                        onReview={handleOpenReview}
                        onViewReview={handleViewReviewDetail}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100/80">
                    <p className="text-sm text-gray-500 font-medium">
                      Trang <span className="text-gray-900 font-semibold">{currentPage + 1}</span> trên <span className="text-gray-900 font-semibold">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Trang trước"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i).map((pageIdx) => {
                        const active = pageIdx === currentPage;
                        return (
                          <button
                            key={pageIdx}
                            onClick={() => setCurrentPage(pageIdx)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                              active
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {pageIdx + 1}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Trang sau"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Xác Nhận Xóa */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy ứng tuyển</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn ứng tuyển cho công việc <span className="font-semibold text-gray-900">"{jobToDelete?.jobTitle || jobToDelete?.title}"</span>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting !== null}>Trở lại</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Tránh đóng popup trước khi API chạy xong
                confirmDelete();
              }}
              disabled={isDeleting !== null}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              {isDeleting !== null ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang hủy...</span>
                </div>
              ) : (
                "Đồng ý hủy"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !submittingReview && setReviewModal(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            {reviewSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá thành công!</h3>
                <p className="text-gray-500">Cảm ơn bạn đã đánh giá nhà tuyển dụng.</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Star className="w-5 h-5 fill-white text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Đánh giá nhà tuyển dụng</h3>
                        <p className="text-sm text-white/80">Chia sẻ trải nghiệm của bạn</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReviewModal(null)}
                      disabled={submittingReview}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {reviewModal.employerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{reviewModal.employerName}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {reviewModal.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Đánh giá sao</label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="group transition-all duration-200 hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-10 h-10 transition-all duration-200 ${
                              star <= (reviewHover || reviewRating)
                                ? "fill-amber-400 text-amber-400 drop-shadow-md"
                                : "fill-gray-200 text-gray-200 group-hover:fill-amber-200 group-hover:text-amber-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm font-medium text-gray-500">
                        {reviewRating === 1 && "Không tốt"}
                        {reviewRating === 2 && "Cần cải thiện"}
                        {reviewRating === 3 && "Bình thường"}
                        {reviewRating === 4 && "Tốt"}
                        {reviewRating === 5 && "Xuất sắc"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1.5" />
                      Nhận xét
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm làm việc tại đây..."
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setReviewModal(null)}
                      disabled={submittingReview}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewComment.trim()}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          Gửi đánh giá
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Review Detail Modal ── */}
      {reviewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewDetailModal(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Chi tiết đánh giá</h3>
                    <p className="text-sm text-white/80">{reviewDetailModal.employerName} — {reviewDetailModal.jobTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewDetailModal(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
              {reviewDetailModal.loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                  <p className="text-gray-500 text-sm">Đang tải đánh giá...</p>
                </div>
              ) : (
                <>
                  {/* ── Student's review of employer ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Đánh giá của bạn</h4>
                    </div>
                    {reviewDetailModal.studentReview ? (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-5 h-5 ${s <= reviewDetailModal.studentReview.rating ? "fill-blue-400 text-blue-400" : "fill-gray-200 text-gray-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold text-blue-700">{reviewDetailModal.studentReview.rating}/5</span>
                        </div>
                        {reviewDetailModal.studentReview.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed italic">
                            "{reviewDetailModal.studentReview.comment}"
                          </p>
                        )}
                        <p className="text-xs text-blue-600/60 mt-3">
                          {new Date(reviewDetailModal.studentReview.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                        <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Bạn chưa đánh giá nhà tuyển dụng này</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">đánh giá 2 chiều</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* ── Employer's review of student ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Đánh giá từ nhà tuyển dụng</h4>
                    </div>
                    {reviewDetailModal.employerReview ? (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-5 h-5 ${s <= reviewDetailModal.employerReview.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-bold text-amber-700">{reviewDetailModal.employerReview.rating}/5</span>
                        </div>
                        {reviewDetailModal.employerReview.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed italic">
                            "{reviewDetailModal.employerReview.comment}"
                          </p>
                        )}
                        <p className="text-xs text-amber-600/60 mt-3">
                          {new Date(reviewDetailModal.employerReview.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                        <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Nhà tuyển dụng chưa đánh giá bạn</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={() => setReviewDetailModal(null)}
                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
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

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className={`p-5 rounded-2xl border bg-white shadow-sm flex items-center gap-4 hover:shadow-md transition-all`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function ApplicationCard({ application, onDelete, isDeleting, canDelete, reviewedMap, onReview, onViewReview }: {
  application: JobResponse,
  onDelete: () => void,
  isDeleting: boolean,
  canDelete: boolean,
  reviewedMap?: Record<string, ReviewResponse>,
  onReview?: (job: JobResponse) => void,
  onViewReview?: (job: JobResponse) => void
}) {
  const status = application.status?.toUpperCase() || "PENDING";

  const statusStyles: Record<string, { bg: string, text: string, border: string, icon: any }> = {
    PENDING: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: <Timer className="w-3.5 h-3.5" /> },
    ACCEPTED: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    REJECTED: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  const currentStatusStyle = statusStyles[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100", icon: <AlertCircle className="w-3.5 h-3.5" /> };

  const statusLabel: Record<string, string> = {
    PENDING: "ĐANG CHỜ",
    ACCEPTED: "ĐÃ DUYỆT",
    APPROVED: "ĐÃ DUYỆT",
    REJECTED: "TỪ CHỐI",
  };

  const parseDateHelper = (val: any) => {
    if (!val) return new Date();
    if (Array.isArray(val)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = val;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(val);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-6"
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <Link to={`/jobs/${application.id}`} className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 hover:opacity-90 transition-opacity">
          <ImageWithFallback
            src={application.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80"}
            alt={application.title}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/jobs/${application.id}`}
            className="text-[17px] font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {application.title}
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500 font-medium truncate">{application.employerName || "Nhà tuyển dụng"}</span>
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate max-w-[150px]">{application.address || "Chưa cập nhật"}</span>
            </div>
            {application.salary && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                <span>{application.salary.toLocaleString()} VNĐ/giờ</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{application.appliedAt ? format(parseDateHelper(application.appliedAt), "HH:mm, dd/MM/yyyy", { locale: vi }) : "Đang cập nhật ngày ứng tuyển"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 flex-shrink-0">
        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
          {currentStatusStyle.icon}
          {statusLabel[status] || status}
        </div>
        
        {/* View Review Button & Write Review Button */}
        {status === 'COMPLETED' && reviewedMap && onReview && onViewReview && (() => {
          const reviewKey = `${application.employerId}_${application.jobId || application.id}`;
          const existingReview = reviewedMap[reviewKey];

          return (
            <div className="flex items-center gap-2">
              {existingReview ? (
                <button
                  onClick={() => onViewReview(application)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 text-blue-700 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                  Đã đánh giá ({existingReview.rating}/5)
                </button>
              ) : (
                <button
                  onClick={() => onReview(application)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Star className="w-4 h-4" />
                  Đánh giá
                </button>
              )}
              
              <button
                onClick={() => onViewReview(application)}
                className="px-3.5 py-1.5 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all text-sm font-medium flex items-center justify-center gap-1.5"
                title="Xem đánh giá 2 chiều"
              >
                <MessageSquare className="w-4 h-4" />
                Xem
              </button>
            </div>
          );
        })()}

        {status === 'PENDING' && (
          <button
            onClick={onDelete}
            disabled={isDeleting || !canDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Hủy ứng tuyển"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
