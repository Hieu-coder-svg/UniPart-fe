import { Search, Filter, Clock, Eye, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { reportService, ReportResponse } from "../../../services/reportService";
import Swal from "sweetalert2";

export default function AdminReports() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getAllReports();
      if (res.result) {
        setReports(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    const result = await Swal.fire({
      title: 'Xác nhận xử lý',
      text: "Bạn có chắc chắn muốn đánh dấu báo cáo này là Đã xử lý không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    });

    if (!result.isConfirmed) return;

    try {
      await reportService.updateReport(id, { status: "RESOLVED", resolution: "Đã xử lý vi phạm" });
      fetchReports();
      Swal.fire('Thành công!', 'Báo cáo đã được xử lý.', 'success');
    } catch (error) {
      console.error("Failed to resolve report", error);
      Swal.fire('Lỗi', "Cập nhật thất bại. Vui lòng thử lại.", 'error');
    }
  };

  const filteredReports = reports.filter((r) => 
    (r.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (r.targetName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (r.reporterName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Báo cáo</h1>
          <p className="text-gray-600">Xử lý các báo cáo từ người dùng</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm báo cáo..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Không tìm thấy báo cáo nào.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold">{report.reason}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : report.priority === "MEDIUM"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {report.priority === "HIGH"
                        ? "Ưu tiên cao"
                        : report.priority === "MEDIUM"
                        ? "Trung bình"
                        : "Thấp"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : report.status === "REVIEWING"
                          ? "bg-blue-100 text-blue-700"
                          : report.status === "RESOLVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {report.status === "PENDING"
                        ? "Chờ xử lý"
                        : report.status === "REVIEWING"
                        ? "Đang xử lý"
                        : report.status === "RESOLVED"
                        ? "Đã giải quyết"
                        : "Từ chối"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{report.reporterName}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    Báo cáo {report.targetType === "EMPLOYER" ? "nhà tuyển dụng" : report.targetType}:{" "}
                    <span className="font-medium">{report.targetName}</span>
                  </div>
                  <p className="text-gray-700">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(report.createdAt).toLocaleString("vi-VN")}
                </div>
                <div className="flex gap-2">
                  {report.status === "PENDING" && (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      <button 
                        onClick={() => handleResolve(report.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Đã xử lý
                      </button>
                    </>
                  )}
                  {report.status === "RESOLVED" && report.resolvedAt && (
                    <div className="text-sm text-gray-500">
                      Giải quyết: {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
