import {
  Download,
  Upload,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Calendar,
} from "lucide-react";
import { useState } from "react";

export default function SystemBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const backupHistory = [
    {
      id: "1",
      type: "full",
      status: "completed",
      size: "2.4 GB",
      date: "15/03/2026 02:00",
      duration: "12 phút",
    },
    {
      id: "2",
      type: "full",
      status: "completed",
      size: "2.3 GB",
      date: "14/03/2026 02:00",
      duration: "11 phút",
    },
    {
      id: "3",
      type: "incremental",
      status: "completed",
      size: "450 MB",
      date: "13/03/2026 14:00",
      duration: "3 phút",
    },
    {
      id: "4",
      type: "full",
      status: "completed",
      size: "2.2 GB",
      date: "13/03/2026 02:00",
      duration: "13 phút",
    },
    {
      id: "5",
      type: "incremental",
      status: "failed",
      size: "-",
      date: "12/03/2026 14:00",
      duration: "-",
    },
  ];

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
    }, 3000);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Sao lưu Dữ liệu</h1>
        <p className="text-gray-600">Quản lý sao lưu và khôi phục dữ liệu hệ thống</p>
      </div>

      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <Database className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl mb-2">Sao lưu ngay</h3>
            <p className="text-sm opacity-90 mb-4">Tạo bản sao lưu toàn bộ hệ thống</p>
            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isBackingUp ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Đang sao lưu...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Bắt đầu
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <Upload className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl mb-2">Khôi phục</h3>
            <p className="text-sm opacity-90 mb-4">Khôi phục từ bản sao lưu</p>
            <button className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Chọn file
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <Calendar className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl mb-2">Lịch tự động</h3>
            <p className="text-sm opacity-90 mb-4">Cấu hình sao lưu định kỳ</p>
            <button className="w-full bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Cài đặt
            </button>
          </div>
        </div>

        {/* Backup Schedule */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl mb-4">Lịch sao lưu tự động</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Sao lưu đầy đủ (Full)</h3>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Đang hoạt động
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Hàng ngày lúc 02:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Bao gồm: Database, Files, Logs</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Sao lưu gia tăng</h3>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Đang hoạt động
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Mỗi 6 giờ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Bao gồm: Database changes only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl">Lịch sử sao lưu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Kích thước
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Thời lượng
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          backup.type === "full"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {backup.type === "full" ? "Đầy đủ" : "Gia tăng"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {backup.status === "completed" ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700">Hoàn thành</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-700">Thất bại</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{backup.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{backup.duration}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {backup.status === "completed" && (
                          <>
                            <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                              <Download className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                              <Upload className="w-4 h-4 text-purple-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl mb-4">Dung lượng lưu trữ</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Sao lưu đã sử dụng</span>
                <span className="text-sm font-semibold">8.2 GB / 50 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full w-[16.4%]"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900">{backupHistory.length}</div>
                <div className="text-xs text-gray-500">Tổng bản sao lưu</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-semibold text-green-600">
                  {backupHistory.filter((b) => b.status === "completed").length}
                </div>
                <div className="text-xs text-gray-500">Thành công</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-semibold text-gray-900">2.3 GB</div>
                <div className="text-xs text-gray-500">Trung bình/backup</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
