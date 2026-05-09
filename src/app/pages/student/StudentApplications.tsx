import { useEffect, useState } from "react";
import { Link } from "react-router";
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
  Filter,
  AlertCircle,
  Banknote
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";

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

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status?.toUpperCase() === 'PENDING').length,
    accepted: applications.filter(a => a.status?.toUpperCase() === 'ACCEPTED' || a.status?.toUpperCase() === 'APPROVED').length,
    rejected: applications.filter(a => a.status?.toUpperCase() === 'REJECTED').length,
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText className="w-5 h-5" />} label="Tổng ứng tuyển" value={stats.total} color="blue" />
          <StatCard icon={<Timer className="w-5 h-5" />} label="Đang chờ" value={stats.pending} color="amber" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Đã duyệt" value={stats.accepted} color="emerald" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Đã từ chối" value={stats.rejected} color="rose" />
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
                  {filteredApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onDelete={() => handleDeleteClick(app)}
                      isDeleting={isDeleting === (app.applicationId || app.id)}
                      canDelete={canDelete(app.status)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
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

function ApplicationCard({ application, onDelete, isDeleting, canDelete }: {
  application: JobResponse,
  onDelete: () => void,
  isDeleting: boolean,
  canDelete: boolean
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

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
          {currentStatusStyle.icon}
          {statusLabel[status] || status}
        </div>
        
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
