import {
  Search,
  Filter,
  Download,
  Star,
  Mail,
  Phone,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";
import { useApplicationRealTime } from "../../../hooks/useApplicationRealTime";

type TabStatus = "all" | "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Chờ xem xét",
    className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    icon: Star,
  },
};

export default function EmployerApplicants() {
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    if (showLoading) setError(null);
    try {
      const res = await applicationService.getEmployerApplications();
      if (res.result) setApplications(res.result);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (showLoading) setError("Không thể tải danh sách ứng viên. Vui lòng thử lại.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // --- WebSocket real-time: listen for new application notifications ---
  useApplicationRealTime({
    onNewApplication: () => {
      fetchApplications(false); // Silent refresh on new application
    },
  });

  // --- Polling fallback (every 10s) in case WebSocket drops ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchApplications(false);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Initial load ---
  useEffect(() => {
    fetchApplications(true);
  }, []);

  // --- Computed stats ---
  const stats = useMemo(() => {
    const uniqueStudents = new Set(applications.map((a) => a.studentId)).size;
    const totalApplications = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const accepted = applications.filter((a) => a.status === "ACCEPTED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    return [
      {
        label: "Tổng ứng viên",
        value: uniqueStudents,
        sub: totalApplications !== uniqueStudents ? `${totalApplications} đơn` : null,
        color: "from-blue-500 to-blue-600",
      },
      { label: "Chờ xem xét", value: pending, sub: null, color: "from-yellow-500 to-orange-500" },
      { label: "Đã chấp nhận", value: accepted, sub: null, color: "from-green-500 to-emerald-500" },
      { label: "Đã từ chối", value: rejected, sub: null, color: "from-red-500 to-red-600" },
    ];
  }, [applications]);

  // --- Tab counts ---
  const tabCounts = useMemo(() => ({
    all: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    ACCEPTED: applications.filter((a) => a.status === "ACCEPTED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
    COMPLETED: applications.filter((a) => a.status === "COMPLETED").length,
  }), [applications]);

  // --- Filtered list ---
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab = activeTab === "all" || app.status === activeTab;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        app.studentName.toLowerCase().includes(searchLower) ||
        (app.jobTitle && app.jobTitle.toLowerCase().includes(searchLower)) ||
        (app.studentEmail && app.studentEmail.toLowerCase().includes(searchLower)) ||
        (app.studentUniversity && app.studentUniversity.toLowerCase().includes(searchLower));
      return matchesTab && matchesSearch;
    });
  }, [applications, activeTab, searchTerm]);

  // --- Actions ---
  const handleAccept = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.acceptApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error accepting application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.rejectApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.completeApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error completing application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs: { key: TabStatus; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xem xét" },
    { key: "ACCEPTED", label: "Đã chấp nhận" },
    { key: "REJECTED", label: "Từ chối" },
    { key: "COMPLETED", label: "Hoàn thành" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Quản lý ứng viên
          </h1>
          <p className="text-gray-600 text-lg">
            Xem và quản lý các ứng viên ứng tuyển vào vị trí của bạn
          </p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg animate-pulse"
              >
                <div className="h-10 bg-gray-200 rounded mb-2 w-16" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))
          : stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              >
                <div
                  className={`text-4xl font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                {stat.sub && (
                  <div className="text-xs text-gray-400 mt-1">({stat.sub})</div>
                )}
              </div>
            ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm ứng viên, vị trí, trường..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium">
            <Download className="w-5 h-5" />
            <span>Xuất Excel</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b-2 border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tabCounts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-40" />
                  <div className="h-4 bg-gray-100 rounded w-64" />
                  <div className="h-4 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              {searchTerm ? "Không tìm thấy ứng viên" : "Chưa có ứng viên nào"}
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "Thử tìm với từ khóa khác"
                : "Ứng viên sẽ xuất hiện khi họ ứng tuyển vào vị trí của bạn"}
            </p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const statusCfg = STATUS_CONFIG[applicant.status] || STATUS_CONFIG["PENDING"];
            const StatusIcon = statusCfg.icon;
            const isUpdating = updatingId === applicant.id;

            return (
              <div
                key={applicant.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {applicant.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                        {applicant.studentName}
                      </h3>
                      <div className="space-y-1.5 text-sm text-gray-600">
                        {applicant.studentEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-orange-500" />
                            <span>{applicant.studentEmail}</span>
                          </div>
                        )}
                        {applicant.studentPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <span>{applicant.studentPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    {applicant.studentUniversity && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="text-sm text-blue-600 mb-1 font-medium">Trường học</div>
                        <div className="text-gray-900 font-semibold">{applicant.studentUniversity}</div>
                      </div>
                    )}
                    {applicant.studentMajor && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div className="text-sm text-purple-600 mb-1 font-medium">Chuyên ngành</div>
                        <div className="text-gray-900 font-semibold">{applicant.studentMajor}</div>
                      </div>
                    )}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="text-sm text-green-600 mb-1 font-medium">Vị trí ứng tuyển</div>
                      <div className="text-gray-900 font-semibold">{applicant.jobTitle}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                      <div className="text-sm text-orange-600 mb-1 font-medium">Ngày ứng tuyển</div>
                      <div className="text-gray-900 font-semibold">
                        {new Date(applicant.appliedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:min-w-[180px]">
                    {/* Status badge */}
                    <span
                      className={`px-4 py-2 rounded-xl text-sm text-center font-medium shadow-lg flex items-center justify-center gap-2 ${statusCfg.className}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusCfg.label}
                    </span>

                    {/* Accept button — only when PENDING */}
                    {applicant.status === "PENDING" && (
                      <button
                        onClick={() => handleAccept(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✓ Chấp nhận"}
                      </button>
                    )}

                    {/* Reject button — only when PENDING */}
                    {applicant.status === "PENDING" && (
                      <button
                        onClick={() => handleReject(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✕ Từ chối"}
                      </button>
                    )}

                    {/* Complete button — only when ACCEPTED */}
                    {applicant.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleComplete(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✓ Hoàn thành"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>
                      Ứng tuyển ngày:{" "}
                      <strong>{new Date(applicant.appliedAt).toLocaleDateString("vi-VN")}</strong>
                    </span>
                  </div>
                  {applicant.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Hoàn thành:{" "}
                        <strong>{new Date(applicant.completedAt).toLocaleDateString("vi-VN")}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
