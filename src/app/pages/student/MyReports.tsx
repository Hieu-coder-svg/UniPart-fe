import { useState, useEffect } from "react";
import { Flag, Bell, CheckCircle, XCircle, Clock, Loader2, Search, Eye, FileText, UserX, MessageSquare } from "lucide-react";
import { reportService, ReportResponse } from "../../../services/reportService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function MyReports() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getMyReports();
      if (res.result) {
        setReports(res.result);
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
      (report.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || report.status === filterStatus.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "PENDING").length,
    reviewing: reports.filter(r => r.status === "REVIEWING").length,
    resolved: reports.filter(r => r.status === "RESOLVED").length,
    rejected: reports.filter(r => r.status === "REJECTED").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Chờ xử lý
          </span>
        );
      case "REVIEWING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Eye className="w-3 h-3" />
            Đang xem xét
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Đã giải quyết
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Bị từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "USER": return <UserX className="w-4 h-4 text-red-500" />;
      case "POST": return <FileText className="w-4 h-4 text-orange-500" />;
      case "COMMENT": return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case "JOB": return <Flag className="w-4 h-4 text-blue-500" />;
      case "REVIEW": return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Báo cáo của bạn đang chờ quản trị viên xem xét.";
      case "REVIEWING":
        return "Quản trị viên đang xem xét báo cáo của bạn.";
      case "RESOLVED":
        return "Báo cáo của bạn đã được xử lý. Cảm ơn bạn đã phản hồi!";
      case "REJECTED":
        return "Báo cáo của bạn đã bị từ chối. Xem ghi chú bên dưới để biết thêm chi tiết.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo của tôi</h1>
            <p className="text-gray-500 text-sm">Theo dõi trạng thái các báo cáo bạn đã gửi</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Tổng báo cáo</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">Chờ xử lý</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
            <div className="text-xs text-gray-500">Đang xem xét</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-xs text-gray-500">Đã giải quyết</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-600">{stats.rejected}</div>
            <div className="text-xs text-gray-500">Bị từ chối</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewing">Đang xem xét</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
              <p className="text-gray-500 mt-3">Đang tải báo cáo...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                {reports.length === 0 ? "Bạn chưa gửi báo cáo nào" : "Không tìm thấy báo cáo phù hợp"}
              </p>
              <p className="text-gray-400 text-sm">
                {reports.length === 0 
                  ? "Nếu bạn phát hiện nội dung vi phạm, hãy báo cáo để chúng tôi xử lý kịp thời."
                  : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      report.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                      report.status === "REVIEWING" ? "bg-blue-100 text-blue-600" :
                      report.status === "RESOLVED" ? "bg-green-100 text-green-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {getTargetIcon(report.targetType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            Báo cáo #{report.id}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {report.createdAt ? format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {report.targetType}
                        </span>
                        <span className="text-sm text-gray-700 font-medium">
                          {report.targetName || `ID: ${report.targetId}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.reason}</p>
                      {report.status === "REJECTED" && report.adminNote && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg w-fit">
                          <Bell className="w-3 h-3" />
                          Có ghi chú từ quản trị viên
                        </div>
                      )}
                      {report.status === "RESOLVED" && report.adminNote && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Đã có phản hồi
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                Chi tiết Báo cáo #{selectedReport.id}
              </h2>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Status */}
              <div className={`p-4 rounded-xl border ${
                selectedReport.status === "PENDING" ? "bg-yellow-50 border-yellow-200" :
                selectedReport.status === "REVIEWING" ? "bg-blue-50 border-blue-200" :
                selectedReport.status === "RESOLVED" ? "bg-green-50 border-green-200" :
                "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Trạng thái</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <p className={`text-sm ${
                  selectedReport.status === "PENDING" ? "text-yellow-700" :
                  selectedReport.status === "REVIEWING" ? "text-blue-700" :
                  selectedReport.status === "RESOLVED" ? "text-green-700" :
                  "text-gray-700"
                }`}>
                  {getStatusMessage(selectedReport.status)}
                </p>
              </div>

              {/* Target Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Đối tượng báo cáo</div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-100">
                    {getTargetIcon(selectedReport.targetType)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedReport.targetName || `ID: ${selectedReport.targetId}`}
                    </div>
                    <div className="text-sm text-gray-500">{selectedReport.targetType}</div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Lý do báo cáo</div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700">
                  {selectedReport.reason}
                </div>
              </div>

              {/* Evidence */}
              {selectedReport.evidenceUrl && (
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Hình ảnh đính kèm</div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-center">
                    <img 
                      src={selectedReport.evidenceUrl} 
                      alt="Bằng chứng" 
                      className="max-h-48 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(selectedReport.evidenceUrl, '_blank')}
                    />
                  </div>
                </div>
              )}

              {/* Admin Note - Only show if has note */}
              {(selectedReport.adminNote || selectedReport.resolution) && (
                <div className={`p-4 rounded-xl border ${
                  selectedReport.status === "RESOLVED" 
                    ? "bg-green-50 border-green-200" 
                    : selectedReport.status === "REJECTED"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className={`w-4 h-4 ${
                      selectedReport.status === "RESOLVED" ? "text-green-600" :
                      selectedReport.status === "REJECTED" ? "text-red-600" : "text-blue-600"
                    }`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      selectedReport.status === "RESOLVED" ? "text-green-600" :
                      selectedReport.status === "REJECTED" ? "text-red-600" : "text-blue-600"
                    }`}>
                      Phản hồi từ Quản trị viên
                    </span>
                  </div>
                  <div className={`text-sm ${
                    selectedReport.status === "RESOLVED" ? "text-green-700" :
                    selectedReport.status === "REJECTED" ? "text-red-700" : "text-blue-700"
                  }`}>
                    {selectedReport.adminNote || selectedReport.resolution}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Thông tin thời gian</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Ngày gửi</div>
                    <div className="font-medium text-gray-900">
                      {selectedReport.createdAt ? format(new Date(selectedReport.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "-"}
                    </div>
                  </div>
                  {selectedReport.updatedAt && (
                    <div>
                      <div className="text-gray-500 text-xs">Cập nhật lần cuối</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(selectedReport.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
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
