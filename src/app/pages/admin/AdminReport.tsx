import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, Eye, CheckCircle, XCircle, MoreVertical, Flag, UserX, FileText, Loader2, EyeOff, User } from "lucide-react";
import { reportService, ReportResponse } from "../../../services/reportService";
import Swal from "sweetalert2";
import { userService } from "../../../services/userService";
import { postService } from "../../../services/postService";
import { jobService } from "../../../services/jobService";

export default function AdminReport() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [isProcessingTarget, setIsProcessingTarget] = useState(false);
  // Track hide status of the currently viewed target
  const [targetIsHidden, setTargetIsHidden] = useState<boolean | null>(null);
  const [loadingTargetStatus, setLoadingTargetStatus] = useState(false);

  // Load hide status when modal opens
  const loadTargetStatus = async (report: ReportResponse) => {
    setTargetIsHidden(null);
    if (report.targetType === "POST") {
      setLoadingTargetStatus(true);
      try {
        const res = await postService.getPostById(Number(report.targetId));
        setTargetIsHidden(res.result?.isHide ?? false);
      } catch { setTargetIsHidden(false); }
      finally { setLoadingTargetStatus(false); }
    } else if (report.targetType === "JOB") {
      setLoadingTargetStatus(true);
      try {
        const res = await jobService.getJobDetail(Number(report.targetId));
        setTargetIsHidden(res.result?.isHide ?? false);
      } catch { setTargetIsHidden(false); }
      finally { setLoadingTargetStatus(false); }
    }
  };

  const handleToggleJob = async (jobId: string) => {
    const hide = !targetIsHidden;
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: hide ? "Bạn có chắc muốn ẩn công việc này?" : "Bạn có chắc muốn bỏ ẩn công việc này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;
    setIsProcessingTarget(true);
    try {
      if (hide) await jobService.hideJob(Number(jobId));
      else await jobService.unhideJob(Number(jobId));
      setTargetIsHidden(hide);
      Swal.fire('Thành công!', hide ? "Đã ẩn công việc thành công!" : "Đã bỏ ẩn công việc thành công!", 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', "Đã xảy ra lỗi.", 'error');
    } finally {
      setIsProcessingTarget(false);
    }
  };

  const handleTogglePost = async (postId: string) => {
    const hide = !targetIsHidden;
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: hide ? "Bạn có chắc muốn ẩn bài viết này?" : "Bạn có chắc muốn bỏ ẩn bài viết này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;
    setIsProcessingTarget(true);
    try {
      if (hide) await postService.hidePost(Number(postId));
      else await postService.unhidePost(Number(postId));
      setTargetIsHidden(hide);
      Swal.fire('Thành công!', hide ? "Đã ẩn bài viết thành công!" : "Đã bỏ ẩn bài viết thành công!", 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', "Đã xảy ra lỗi.", 'error');
    } finally {
      setIsProcessingTarget(false);
    }
  };

  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const handleViewUser = async (userId: string) => {
    setViewingUserId(userId);
    setLoadingUser(true);
    try {
      const usersRes = await userService.getAllUsers();
      const basicUser = usersRes.result?.find((u: any) => u.id === userId);

      if (!basicUser) {
        Swal.fire('Lỗi', "Không tìm thấy thông tin cơ bản của người dùng này.", 'error');
        setLoadingUser(false);
        return;
      }

      let detailedUser = { ...basicUser };
      try {
        if (basicUser.roleName?.toUpperCase() === "STUDENT") {
          const res = await userService.getStudentById(userId);
          if (res.result) detailedUser = { ...detailedUser, ...res.result };
        } else if (basicUser.roleName?.toUpperCase() === "EMPLOYER") {
          const res = await userService.getEmployerById(userId);
          if (res.result) detailedUser = { ...detailedUser, ...res.result };
        }
      } catch (err) {
        console.warn("Could not fetch detailed profile", err);
      }

      setViewingUser(detailedUser);
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', "Đã xảy ra lỗi khi tải thông tin người dùng.", 'error');
      setViewingUserId(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [reportsRes, usersRes] = await Promise.all([
        reportService.getAllReports(),
        userService.getAllUsers().catch(() => ({ result: [] }))
      ]);

      if (reportsRes.result) {
        const users = usersRes.result || [];
        const enrichedReports = reportsRes.result.map((report: any) => {
          if (report.targetType === "USER" && (!report.targetName || !report.targetName.trim())) {
            const user = users.find((u: any) => u.id === report.targetId);
            if (user) {
              return { ...report, targetName: user.fullName || user.username };
            }
          }
          return report;
        });
        setReports(enrichedReports);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      (report.targetName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (report.reporterName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (report.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || report.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    reviewing: reports.filter(r => r.status === "REVIEWING").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Chờ xử lý</span>;
      case "REVIEWING": return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Đang xem xét</span>;
      case "RESOLVED": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Đã giải quyết</span>;
      case "REJECTED": return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Bị từ chối</span>;
      default: return null;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "USER": return <UserX className="w-4 h-4 text-red-500" />;
      case "POST": return <FileText className="w-4 h-4 text-orange-500" />;
      case "COMMENT": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleUpdateStatus = async (newStatus: "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED") => {
    if (!selectedReport) return;

    let statusText = "";
    switch (newStatus) {
      case "REVIEWING": statusText = "Đang xem xét"; break;
      case "RESOLVED": statusText = "Đã giải quyết"; break;
      case "REJECTED": statusText = "Từ chối (Bỏ qua)"; break;
      default: statusText = "Chờ xử lý";
    }

    if ((newStatus === "RESOLVED" || newStatus === "REJECTED") && !adminNote.trim()) {
      Swal.fire('Thiếu thông tin', "Vui lòng nhập ghi chú xử lý để lưu vết hệ thống trước khi từ chối/giải quyết báo cáo này!", 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận chuyển trạng thái',
      text: `Bạn có chắc chắn muốn chuyển báo cáo này sang trạng thái "${statusText}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Đang xử lý...',
      text: 'Vui lòng chờ trong giây lát',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await reportService.updateReport(selectedReport.id, {
        status: newStatus,
        adminNote: adminNote
      });
      fetchReports();
      setSelectedReport(null);
      Swal.fire('Thành công!', 'Cập nhật trạng thái thành công.', 'success');
    } catch (error) {
      console.error("Failed to update report status", error);
      Swal.fire('Lỗi', "Cập nhật thất bại. Vui lòng thử lại.", 'error');
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Báo cáo Vi phạm</h1>
          <p className="text-gray-600">Theo dõi và xử lý các báo cáo từ cộng đồng người dùng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Flag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Tổng báo cáo</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-gray-500">Chờ xử lý</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.reviewing}</div>
              <div className="text-sm text-gray-500">Đang xem xét</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="text-sm text-gray-500">Đã giải quyết</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo người báo cáo, đối tượng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white min-w-[180px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="py-4 px-6 font-medium whitespace-nowrap text-sm">Mã BC</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-sm">Người tố cáo</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-sm">Đối tượng bị tố cáo</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-sm">Ngày tạo</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-sm">Trạng thái</th>
                <th className="py-4 px-6 font-medium text-right whitespace-nowrap text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Không tìm thấy báo cáo nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-sm">RP-{report.id.toString().padStart(3, '0')}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-medium text-gray-800 text-sm">{report.reporterName}</div>
                      <div className="text-[11px] text-gray-500">Hệ thống</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTargetIcon(report.targetType)}
                        <span className="font-medium text-gray-800 text-sm">{report.targetName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">{new Date(report.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNote((report as any).adminNote || report.resolution || "");
                          loadTargetStatus(report);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredReports.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredReports.length}</span> báo cáo
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Trước
                </button>

                <span className="text-sm text-gray-600 px-2 font-medium">
                  Trang <span className="text-gray-900">{currentPage}</span> / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                Xử lý Báo cáo {selectedReport.id}
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Người tố cáo</div>
                  <button
                    onClick={() => handleViewUser(selectedReport.reporterId)}
                    className="text-sm text-gray-800 bg-white hover:bg-gray-100 p-3 rounded-lg mt-2 border border-gray-200 w-full text-left flex justify-between items-center transition-colors shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(selectedReport.reporterName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedReport.reporterName}</div>
                        <div className="text-xs text-gray-500">Nhấn để xem thông tin chi tiết</div>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-xs text-red-500 font-medium mb-1 uppercase tracking-wider">Đối tượng vi phạm</div>
                  {selectedReport.targetType !== "USER" && (
                    <>
                      <div className="font-semibold text-red-900 flex items-center gap-2">
                        {getTargetIcon(selectedReport.targetType)}
                        {selectedReport.targetName}
                      </div>
                      <div className="text-sm text-red-700 capitalize mb-2">Loại: {selectedReport.targetType}</div>
                    </>
                  )}

                  {selectedReport.targetType === "JOB" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a href={`/jobs/${selectedReport.targetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline bg-white/60 px-3 py-1.5 rounded-md border border-blue-100">
                        <Eye className="w-3 h-3" /> Xem chi tiết
                      </a>
                      {loadingTargetStatus ? (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-white/60 px-3 py-1.5 rounded-md border border-gray-200">
                          <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleJob(selectedReport.targetId)}
                          disabled={isProcessingTarget}
                          className={`inline-flex items-center gap-1 text-sm ${targetIsHidden
                              ? "text-green-600 hover:text-green-800 hover:underline border-green-100"
                              : "text-orange-600 hover:text-orange-800 hover:underline border-orange-100"
                            } bg-white/60 px-3 py-1.5 rounded-md border disabled:opacity-50`}
                        >
                          {isProcessingTarget ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : targetIsHidden ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {targetIsHidden ? "Bỏ ẩn công việc" : "Ẩn công việc"}
                        </button>
                      )}
                    </div>
                  )}
                  {selectedReport.targetType === "POST" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a href={`/community?postId=${selectedReport.targetId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline bg-white/60 px-3 py-1.5 rounded-md border border-blue-100">
                        <Eye className="w-3 h-3" /> Xem chi tiết
                      </a>
                      {loadingTargetStatus ? (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-white/60 px-3 py-1.5 rounded-md border border-gray-200">
                          <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTogglePost(selectedReport.targetId)}
                          disabled={isProcessingTarget}
                          className={`inline-flex items-center gap-1 text-sm ${targetIsHidden
                              ? "text-green-600 hover:text-green-800 hover:underline border-green-100"
                              : "text-orange-600 hover:text-orange-800 hover:underline border-orange-100"
                            } bg-white/60 px-3 py-1.5 rounded-md border disabled:opacity-50`}
                        >
                          {isProcessingTarget ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : targetIsHidden ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {targetIsHidden ? "Bỏ ẩn bài viết" : "Ẩn bài viết"}
                        </button>
                      )}
                    </div>
                  )}
                  {selectedReport.targetType === "USER" && (
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => handleViewUser(selectedReport.targetId)}
                        className="text-sm text-red-800 bg-red-100/60 hover:bg-red-100 p-3 rounded-lg border border-red-200 w-full text-left flex justify-between items-center transition-colors shadow-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner">
                            {(selectedReport.targetName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{selectedReport.targetName?.trim() ? selectedReport.targetName : `ID: ${selectedReport.targetId.split('-')[0]}...`}</div>
                            <div className="text-xs text-red-600/70">Nhấn để xem thông tin chi tiết</div>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={async () => {
                          const { value: reason } = await Swal.fire({
                            title: 'Khóa tài khoản này?',
                            html: `<p class="text-sm text-gray-500 mb-4">Người dùng sẽ bị đăng xuất, không thể đăng nhập lại và sẽ nhận được email thông báo.</p>`,
                            input: 'textarea',
                            inputLabel: 'Vui lòng nhập lý do khóa (Bắt buộc)',
                            inputPlaceholder: 'Ví dụ: Vi phạm quy định hệ thống...',
                            icon: 'warning',
                            iconColor: '#ef4444',
                            showCancelButton: true,
                            confirmButtonText: 'Đồng ý khóa',
                            cancelButtonText: 'Hủy bỏ',
                            customClass: {
                              popup: 'rounded-3xl shadow-2xl pb-6',
                              title: 'text-xl font-bold text-gray-900 pt-4',
                              input: 'w-full h-32 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm mx-auto',
                              inputLabel: 'text-sm font-semibold text-gray-700 text-left w-full block mb-2',
                              confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors',
                              cancelButton: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors mr-3',
                              actions: 'flex gap-3 mt-6 w-full justify-center'
                            },
                            buttonsStyling: false,
                            inputValidator: (value) => {
                              if (!value || !value.trim()) {
                                return 'Bạn cần nhập lý do khóa tài khoản!'
                              }
                            }
                          });

                          if (reason) {
                            const confirmResult = await Swal.fire({
                              title: 'Xác nhận khóa?',
                              html: `<p class="text-sm text-gray-500 mb-4">Bạn có chắc chắn muốn khóa tài khoản này với lý do sau đây không?</p>
                                     <div class="bg-gray-50 p-3 rounded-lg text-sm text-left border border-gray-200 text-gray-700 italic">"${reason}"</div>`,
                              icon: 'warning',
                              iconColor: '#ef4444',
                              showCancelButton: true,
                              confirmButtonText: 'Đồng ý khóa',
                              cancelButtonText: 'Hủy bỏ',
                              customClass: {
                                popup: 'rounded-3xl shadow-2xl pb-6',
                                title: 'text-xl font-bold text-gray-900 pt-4',
                                confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors',
                                cancelButton: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors mr-3',
                                actions: 'flex gap-3 mt-6 w-full justify-center'
                              },
                              buttonsStyling: false
                            });

                            if (!confirmResult.isConfirmed) return;
                            try {
                              setIsProcessingTarget(true);
                              await userService.blockUser(selectedReport.targetId, reason);
                              Swal.fire('Đã khóa', 'Tài khoản đã bị khóa thành công.', 'success');
                            } catch (error) {
                              Swal.fire('Lỗi', 'Không thể khóa tài khoản này.', 'error');
                            } finally {
                              setIsProcessingTarget(false);
                            }
                          }
                        }}
                        disabled={isProcessingTarget}
                        className="inline-flex items-center justify-center gap-2 text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors font-medium w-full disabled:opacity-50"
                      >
                        {isProcessingTarget ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                        Khóa tài khoản vi phạm
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Nội dung báo cáo chi tiết:</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700">
                  {selectedReport.reason}
                </div>
              </div>

              {selectedReport.evidenceUrl && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Hình ảnh đính kèm:</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-center">
                    <img
                      src={selectedReport.evidenceUrl}
                      alt="Bằng chứng báo cáo"
                      className="max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(selectedReport.evidenceUrl, '_blank')}
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Ghi chú của Quản trị viên:</h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú xử lý (sẽ được lưu lại trên hệ thống)..."
                  className="w-full h-28 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={selectedReport.status === "RESOLVED" || selectedReport.status === "REJECTED"}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-end shrink-0">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors shadow-sm"
              >
                {(selectedReport.status === "RESOLVED" || selectedReport.status === "REJECTED") ? "Đóng" : "Hủy bỏ"}
              </button>
              {!(selectedReport.status === "RESOLVED" || selectedReport.status === "REJECTED") && (
                <>
                  <button
                    onClick={() => handleUpdateStatus("REJECTED")}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors shadow-sm"
                  >
                    Từ chối (Bỏ qua)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("REVIEWING")}
                    className="px-5 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl font-medium transition-colors"
                  >
                    Chuyển sang Đang xem xét
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-sm transition-colors"
                  >
                    Đánh dấu Đã giải quyết
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewingUserId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {selectedReport && viewingUserId === selectedReport.reporterId ? (
                  <User className="w-5 h-5 text-gray-500" />
                ) : (
                  <UserX className="w-5 h-5 text-gray-500" />
                )}
                {selectedReport && viewingUserId === selectedReport.reporterId
                  ? "Thông tin người tố cáo"
                  : "Thông tin người bị báo cáo"}
              </h3>
              <button
                onClick={() => { setViewingUserId(null); setViewingUser(null); }}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingUser ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
                  <p className="text-gray-500 text-sm">Đang tải thông tin...</p>
                </div>
              ) : viewingUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    {viewingUser.avatar ? (
                      <img
                        src={viewingUser.avatar}
                        alt={viewingUser.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-inner ${viewingUser.avatar ? 'hidden' : ''}`}>
                      {(viewingUser.fullName || viewingUser.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{viewingUser.fullName || viewingUser.username}</h4>
                      <div className="text-gray-500 text-sm">{viewingUser.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Vai trò</div>
                      <div className="font-semibold text-gray-900">{viewingUser.roleName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Trạng thái</div>
                      <div className="font-semibold">
                        {viewingUser.isBlocked ? (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Bị khóa</span>
                        ) : (
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Hoạt động</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Số điện thoại</div>
                      <div className="font-semibold text-gray-900">
                        {viewingUser.phoneNumber || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Ngày sinh</div>
                      <div className="font-semibold text-gray-900">
                        {viewingUser.dateOfBirth ? new Date(viewingUser.dateOfBirth).toLocaleDateString('vi-VN') : <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Giới tính</div>
                      <div className="font-semibold text-gray-900">
                        {viewingUser.gender || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Ngày tham gia</div>
                      <div className="font-semibold text-gray-900">
                        {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString('vi-VN') : <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                      </div>
                    </div>

                    {viewingUser.university && (
                      <div className="col-span-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-500 uppercase tracking-wider mb-1 font-medium">Trường học</div>
                        <div className="font-semibold text-blue-900">{viewingUser.university}</div>
                        {viewingUser.major && (
                          <div className="mt-1 text-sm text-blue-800">Chuyên ngành: {viewingUser.major}</div>
                        )}
                      </div>
                    )}

                    {viewingUser.companyName && (
                      <div className="col-span-2 bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                        <div className="text-xs text-purple-500 uppercase tracking-wider mb-1 font-medium">Công ty</div>
                        <div className="font-semibold text-purple-900">{viewingUser.companyName}</div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Địa chỉ</div>
                      <div className="font-semibold text-gray-900">
                        {viewingUser.address || viewingUser.companyAddress || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
                      </div>
                    </div>

                    {(viewingUser.bio || viewingUser.description) && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Mô tả / Giới thiệu</div>
                        <div className="font-medium text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                          {viewingUser.bio || viewingUser.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Không có thông tin
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => { setViewingUserId(null); setViewingUser(null); }}
                className="px-5 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium shadow-sm"
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
