import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminService, AdminStats, AdminChartData } from "../../services/adminService";

const REPORT_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWING: "#3b82f6",
  RESOLVED: "#10b981",
  REJECTED: "#ef4444",
};

const REPORT_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  REVIEWING: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  REJECTED: "Đã từ chối",
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
}) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${gradient}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-10 h-10 opacity-80" />
        <div className="text-right">
          <div className="text-sm opacity-90">{label}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
      </div>
      {sub && <div className="text-sm opacity-90">{sub}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chart, setChart] = useState<AdminChartData | null>(null);
  const [period, setPeriod] = useState<"week" | "10weeks" | "month" | "year">("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chartRes] = await Promise.all([
        adminService.getStats(),
        adminService.getChartData(period),
      ]);
      if (statsRes.result) setStats(statsRes.result);
      if (chartRes.result) setChart(chartRes.result);
    } catch (e: any) {
      setError(e?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="ml-3 text-gray-500">Đang tải dữ liệu dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const reportPieData =
    chart?.reportStatus.map((r) => ({
      name: REPORT_LABELS[r.status] || r.status,
      value: r.count,
      color: REPORT_COLORS[r.status] || "#888",
    })) || [];

  const revenueChartData =
    chart?.monthlyRevenue.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue) || 0,
    })) || [];

  const userChartData =
    chart?.monthlyUsers.map((u) => ({
      month: u.month,
      users: u.newUsers,
    })) || [];

  const userTypeData = [
    { name: "Sinh viên", value: stats.totalStudents, color: "#3b82f6" },
    { name: "Nhà tuyển dụng", value: stats.totalEmployers, color: "#8b5cf6" },
  ];

  const totalReportCount = reportPieData.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Tổng quan hệ thống</h1>
          <p className="text-gray-500">Dashboard quản trị UniHire</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value={stats.totalUsers.toLocaleString()}
            sub={
              <div className="flex gap-4 mt-1">
                <span>
                  Sinh viên: <strong>{stats.totalStudents.toLocaleString()}</strong>
                </span>
                <span>
                  NTD: <strong>{stats.totalEmployers.toLocaleString()}</strong>
                </span>
              </div>
            }
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Briefcase}
            label="Tin tuyển dụng"
            value={stats.totalJobs.toLocaleString()}
            sub={`${stats.activeJobs.toLocaleString()} đang hoạt động`}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={DollarSign}
            label="Doanh thu tháng"
            value={`${formatRevenue(stats.monthlyRevenue)}đ`}
            sub={`Tổng: ${formatRevenue(stats.totalRevenue)}đ`}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={AlertTriangle}
            label="Báo cáo vi phạm"
            value={stats.totalReports.toLocaleString()}
            sub={
              <span>
                {stats.pendingReports > 0 ? (
                  <span className="text-amber-200">
                    {stats.pendingReports} chờ xử lý
                  </span>
                ) : (
                  <span className="text-green-200">Tất cả đã xử lý</span>
                )}
              </span>
            }
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Additional row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Đang hoạt động</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{stats.totalJobs.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Tin tuyển dụng</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Users className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Đơn ứng tuyển</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Activity className="w-6 h-6 text-teal-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Bài viết</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-amber-600">{stats.pendingReports}</div>
            <div className="text-xs text-gray-500">Chờ xử lý</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">{stats.resolvedReports}</div>
            <div className="text-xs text-gray-500">Đã giải quyết</div>
          </div>
        </div>

        {/* Charts Filter */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Biểu đồ thống kê</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "week" | "10weeks" | "month" | "year")}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium shadow-sm outline-none focus:border-blue-500 transition-colors cursor-pointer hover:bg-gray-50"
          >
            <option value="week">7 ngày qua</option>
            <option value="10weeks">10 tuần qua</option>
            <option value="month">6 tháng qua</option>
            <option value="year">5 năm qua</option>
          </select>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Doanh thu ({period === 'week' ? '7 ngày' : period === '10weeks' ? '10 tuần' : period === 'year' ? '5 năm' : '6 tháng'})
              </h3>
              <span className="text-xs text-gray-400">VNĐ</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#adminRevenueGradient)"
                  name="Doanh thu"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Người dùng mới ({period === 'week' ? '7 ngày' : period === '10weeks' ? '10 tuần' : period === 'year' ? '5 năm' : '6 tháng'})
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), "Người dùng mới"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="users" fill="#3b82f6" name="Người dùng mới" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Type Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <PieChart className="w-5 h-5 text-green-600" />
                Phân loại người dùng
              </h3>
              <span className="text-xs text-gray-400">Tổng: {stats.totalUsers.toLocaleString()}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, payload }) =>
                    `${name}: ${payload.value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`ut-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), "Số lượng"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Report Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Activity className="w-5 h-5 text-orange-600" />
                Trạng thái báo cáo
              </h3>
              <span className="text-xs text-gray-400">Tổng: {totalReportCount.toLocaleString()}</span>
            </div>
            {totalReportCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                <CheckCircle className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-sm font-medium text-green-600">Không có báo cáo nào</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={reportPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportPieData.map((entry, index) => (
                      <Cell key={`rep-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), "Số báo cáo"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
