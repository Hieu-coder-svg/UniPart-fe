import { Search, Filter, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

export default function SystemLogs() {
  const logs = [
    {
      id: "1",
      level: "info",
      message: "Backup completed successfully",
      timestamp: "2026-03-14 02:12:45",
      source: "BackupService",
      details: "Full backup created - Size: 2.4GB",
    },
    {
      id: "2",
      level: "warning",
      message: "High memory usage detected",
      timestamp: "2026-03-14 01:45:23",
      source: "SystemMonitor",
      details: "Memory usage: 85% - Threshold: 80%",
    },
    {
      id: "3",
      level: "error",
      message: "Failed to send email notification",
      timestamp: "2026-03-14 01:30:12",
      source: "NotificationService",
      details: "SMTP connection timeout after 30s",
    },
    {
      id: "4",
      level: "info",
      message: "New user registered",
      timestamp: "2026-03-14 01:15:33",
      source: "AuthService",
      details: "User: student_12458@unipart.com",
    },
    {
      id: "5",
      level: "success",
      message: "Database optimization completed",
      timestamp: "2026-03-14 01:00:00",
      source: "DatabaseService",
      details: "Tables optimized: 45, Time: 3.2s",
    },
    {
      id: "6",
      level: "warning",
      message: "Unusual API request pattern detected",
      timestamp: "2026-03-14 00:45:18",
      source: "SecurityService",
      details: "IP: 192.168.1.100 - Requests: 1200/min",
    },
    {
      id: "7",
      level: "info",
      message: "Cache cleared successfully",
      timestamp: "2026-03-14 00:30:00",
      source: "CacheService",
      details: "Redis cache flushed - 2.3GB freed",
    },
    {
      id: "8",
      level: "error",
      message: "Payment gateway connection failed",
      timestamp: "2026-03-14 00:15:44",
      source: "PaymentService",
      details: "VNPay API timeout - Retrying...",
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const classes = {
      error: "bg-red-100 text-red-700",
      warning: "bg-orange-100 text-orange-700",
      success: "bg-green-100 text-green-700",
      info: "bg-blue-100 text-blue-700",
    };
    return classes[level as keyof typeof classes] || classes.info;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Nhật ký Hệ thống</h1>
          <p className="text-gray-600">Theo dõi các hoạt động và sự kiện hệ thống</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm logs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">3</div>
              <div className="text-xs text-gray-500">Info</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">1</div>
              <div className="text-xs text-gray-500">Success</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">2</div>
              <div className="text-xs text-gray-500">Warning</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">2</div>
              <div className="text-xs text-gray-500">Error</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">{getLevelIcon(log.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{log.source}</span>
                  <span className="text-xs text-gray-400">{log.timestamp}</span>
                </div>
                <div className="font-medium text-gray-900 mb-1">{log.message}</div>
                <div className="text-sm text-gray-600">{log.details}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Trước
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg">
          1
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          2
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          3
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Sau
        </button>
      </div>
    </div>
  );
}
