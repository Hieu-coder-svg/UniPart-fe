import { Search, Filter, Clock, Eye, CheckCircle } from "lucide-react";
import { mockUserReports } from "../../data/mockData";

export default function ManagerReports() {
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
              placeholder="Tìm kiếm báo cáo..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {mockUserReports.map((report) => (
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
                      report.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : report.priority === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {report.priority === "high"
                      ? "Ưu tiên cao"
                      : report.priority === "medium"
                      ? "Trung bình"
                      : "Thấp"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : report.status === "reviewing"
                        ? "bg-blue-100 text-blue-700"
                        : report.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {report.status === "pending"
                      ? "Chờ xử lý"
                      : report.status === "reviewing"
                      ? "Đang xử lý"
                      : report.status === "resolved"
                      ? "Đã giải quyết"
                      : "Từ chối"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{report.reporterName}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  Báo cáo {report.targetType === "employer" ? "nhà tuyển dụng" : report.targetType}:{" "}
                  <span className="font-medium">{report.targetName}</span>
                </div>
                <p className="text-gray-700">{report.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {report.createdAt}
              </div>
              <div className="flex gap-2">
                {report.status === "pending" && (
                  <>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Xử lý
                    </button>
                  </>
                )}
                {report.status === "resolved" && (
                  <div className="text-sm text-gray-500">
                    Giải quyết: {report.resolvedAt}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
