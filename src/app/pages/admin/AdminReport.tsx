import { useState } from "react";
import { Search, Filter, AlertTriangle, Eye, CheckCircle, XCircle, MoreVertical, Flag, UserX, FileText } from "lucide-react";

// Mock Data Interfaces
interface Report {
  id: string;
  reporterName: string;
  reporterRole: string;
  targetName: string;
  targetType: "user" | "post" | "comment";
  reason: string;
  status: "pending" | "reviewing" | "resolved" | "rejected";
  createdAt: string;
  adminNote?: string;
}

const mockReports: Report[] = [
  {
    id: "RP-2024-001",
    reporterName: "Nguyễn Văn A",
    reporterRole: "Sinh viên",
    targetName: "Công ty TNHH Scam",
    targetType: "user",
    reason: "Nhà tuyển dụng yêu cầu đóng phí trước khi phỏng vấn.",
    status: "pending",
    createdAt: "2024-05-07 08:15",
  },
  {
    id: "RP-2024-002",
    reporterName: "Trần Thị B",
    reporterRole: "Sinh viên",
    targetName: "Tuyển dụng việc nhẹ lương cao",
    targetType: "post",
    reason: "Bài đăng có dấu hiệu lừa đảo, đa cấp.",
    status: "reviewing",
    createdAt: "2024-05-06 14:30",
    adminNote: "Đang liên hệ bộ phận kiểm duyệt kiểm tra lại giấy phép kinh doanh."
  },
  {
    id: "RP-2024-003",
    reporterName: "Lê Văn C",
    reporterRole: "Nhà tuyển dụng",
    targetName: "Sinh viên Spam",
    targetType: "user",
    reason: "Ứng viên này gửi hàng loạt CV rác và sử dụng ngôn từ xúc phạm.",
    status: "resolved",
    createdAt: "2024-05-05 09:12",
    adminNote: "Đã cảnh cáo tài khoản sinh viên và khóa chức năng ứng tuyển 7 ngày."
  },
  {
    id: "RP-2024-004",
    reporterName: "Hệ thống tự động",
    reporterRole: "Hệ thống",
    targetName: "Bình luận khiếm nhã",
    targetType: "comment",
    reason: "Chứa từ khóa vi phạm tiêu chuẩn cộng đồng.",
    status: "rejected",
    createdAt: "2024-05-04 18:20",
    adminNote: "Kiểm tra thấy đây chỉ là hiểu lầm ngữ cảnh, không vi phạm."
  }
];

export default function AdminReport() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.targetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    reviewing: reports.filter(r => r.status === "reviewing").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Chờ xử lý</span>;
      case "reviewing": return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Đang xem xét</span>;
      case "resolved": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Đã giải quyết</span>;
      case "rejected": return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Bị từ chối</span>;
      default: return null;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "user": return <UserX className="w-4 h-4 text-red-500" />;
      case "post": return <FileText className="w-4 h-4 text-orange-500" />;
      case "comment": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleUpdateStatus = (newStatus: Report["status"]) => {
    if (!selectedReport) return;
    
    setReports(reports.map(r => 
      r.id === selectedReport.id 
        ? { ...r, status: newStatus, adminNote } 
        : r
    ));
    setSelectedReport(null);
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
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap text-sm">{report.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="font-medium text-gray-800 text-sm">{report.reporterName}</div>
                    <div className="text-[11px] text-gray-500">{report.reporterRole}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTargetIcon(report.targetType)}
                      <span className="font-medium text-gray-800 text-sm">{report.targetName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">{report.createdAt}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button 
                      onClick={() => {
                        setSelectedReport(report);
                        setAdminNote(report.adminNote || "");
                      }}
                      className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Không tìm thấy báo cáo nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
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
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Người tố cáo</div>
                  <div className="font-semibold text-gray-900">{selectedReport.reporterName}</div>
                  <div className="text-sm text-gray-600">{selectedReport.reporterRole}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="text-xs text-red-500 font-medium mb-1 uppercase tracking-wider">Đối tượng vi phạm</div>
                  <div className="font-semibold text-red-900 flex items-center gap-2">
                    {getTargetIcon(selectedReport.targetType)}
                    {selectedReport.targetName}
                  </div>
                  <div className="text-sm text-red-700 capitalize">Loại: {selectedReport.targetType}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Nội dung báo cáo chi tiết:</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700">
                  {selectedReport.reason}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Ghi chú của Quản trị viên:</h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú xử lý (sẽ được lưu lại trên hệ thống)..."
                  className="w-full h-28 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleUpdateStatus("rejected")}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                >
                  Từ chối (Bỏ qua)
                </button>
                <button 
                  onClick={() => handleUpdateStatus("reviewing")}
                  className="px-5 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl font-medium transition-colors"
                >
                  Chuyển sang Đang xem xét
                </button>
                <button 
                  onClick={() => handleUpdateStatus("resolved")}
                  className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-sm transition-colors"
                >
                  Đánh dấu Đã giải quyết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
