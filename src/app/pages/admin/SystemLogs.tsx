import { useState, useEffect } from "react";
import { Search, Filter, AlertCircle, Info, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { logService, SystemLog } from "../../../services/logService";
import { toast } from "sonner";

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await logService.getSystemLogs(500);
      setLogs(data);
    } catch (error) {
      toast.error("Lỗi khi tải nhật ký hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLevelIcon = (level: string) => {
    switch ((level || "").toLowerCase()) {
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
    return classes[(level || "").toLowerCase() as keyof typeof classes] || classes.info;
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogs.filter(log => {
    const matchesSearch = 
      (log?.message || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log?.source || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === "all" || (log?.level || "").toLowerCase() === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    info: safeLogs.filter(l => (l?.level || "").toLowerCase() === "info").length,
    success: safeLogs.filter(l => (l?.level || "").toLowerCase() === "success").length,
    warning: safeLogs.filter(l => (l?.level || "").toLowerCase() === "warning").length,
    error: safeLogs.filter(l => (l?.level || "").toLowerCase() === "error").length,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Nhật ký Hệ thống</h1>
          <p className="text-gray-600">Theo dõi các hoạt động và sự kiện hệ thống</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="all">Tất cả Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
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
              <div className="text-2xl font-semibold">{stats.info}</div>
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
              <div className="text-2xl font-semibold">{stats.success}</div>
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
              <div className="text-2xl font-semibold">{stats.warning}</div>
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
              <div className="text-2xl font-semibold">{stats.error}</div>
              <div className="text-xs text-gray-500">Error</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      {loading && safeLogs.length === 0 ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
          Không tìm thấy log nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log?.id || Math.random().toString()}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{getLevelIcon(log?.level || "info")}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(log?.level || "info")}`}>
                      {(log?.level || "info").toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{log?.source || ""}</span>
                    <span className="text-xs text-gray-400">{log?.timestamp || ""}</span>
                  </div>
                  <div className="font-medium text-gray-900 mb-1 break-words">{log?.message || ""}</div>
                  {log.details && (
                    <div className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 font-mono whitespace-pre-wrap overflow-x-auto">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
