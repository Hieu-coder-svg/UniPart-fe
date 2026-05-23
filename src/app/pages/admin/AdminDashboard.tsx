import { useState, useEffect } from "react";
import { Link } from "react-router";
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
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle,
  Clock,
  ShieldCheck,
  Package,
  ArrowRight,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminService, AdminStats, AdminChartData } from "../../services/adminService";

const CHART_COLORS = {
  purple: "#8b5cf6",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  red: "#ef4444",
  teal: "#14b8a6",
  pink: "#ec4899",
  indigo: "#6366f1",
};

const REPORT_STATUS_COLOR: Record<string, string> = {
  PENDING: "#f59e0b",
  REVIEWING: "#3b82f6",
  RESOLVED: "#10b981",
  REJECTED: "#ef4444",
};

const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  REVIEWING: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  REJECTED: "Từ chối",
};

function formatK(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  sub?: string;
  color: string;
  bgColor: string;
  linkTo?: string;
}

function StatCard({ title, value, icon: Icon, trend, sub, color, bgColor, linkTo }: StatCardProps) {
  const content = (
    <div className={`rounded-2xl p-5 text-white shadow-lg ${bgColor} hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 ? "bg-white/20 text-white" : "bg-white/10 text-red-200"
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-sm text-white/80 mb-1">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {sub && <div className="text-xs text-white/70">{sub}</div>}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  return content;
}

interface MiniCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  linkTo?: string;
}

function MiniCard({ label, value, icon: Icon, color, linkTo }: MiniCardProps) {
  const content = (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-base font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );

  if (linkTo) return <Link to={linkTo}>{content}</Link>;
  return content;
}

export default function AdminDashboard() {
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
      setError(e?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <span className="text-gray-500 font-medium">Đang tải dữ liệu dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg mb-2">Lỗi tải dữ liệu</p>
          <p className="text-red-500 text-sm mb-5">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const revenueChartData = chart?.monthlyRevenue.map(r => ({
    month: r.month,
    "Doanh thu": Number(r.revenue) || 0,
  })) || [];

  const userChartData = chart?.monthlyUsers.map(u => ({
    month: u.month,
    "Người dùng mới": u.newUsers,
  })) || [];

  const reportPieData = chart?.reportStatus
    .filter(r => r.count > 0)
    .map(r => ({
      name: REPORT_STATUS_LABEL[r.status] || r.status,
      value: r.count,
      color: REPORT_STATUS_COLOR[r.status] || "#888",
    })) || [];

  const userTypeData = [
    { name: "Sinh viên", value: stats.totalStudents, color: CHART_COLORS.blue },
    { name: "Nhà tuyển dụng", value: stats.totalEmployers, color: CHART_COLORS.purple },
  ];

  const totalReportCount = reportPieData.reduce((s, r) => s + r.value, 0);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Quản trị</h1>
          <p className="text-gray-500">Chào mừng bạn quay trở lại, Quản trị viên</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={8}
          sub={`${stats.activeUsers.toLocaleString()} đang hoạt động`}
          color="bg-blue-500"
          bgColor="bg-gradient-to-br from-blue-500 to-blue-700"
          linkTo="/admin/users"
        />
        <StatCard
          title="Tin tuyển dụng"
          value={stats.totalJobs.toLocaleString()}
          icon={Briefcase}
          sub={`${stats.activeJobs.toLocaleString()} đang hoạt động`}
          color="bg-green-500"
          bgColor="bg-gradient-to-br from-green-500 to-green-700"
          linkTo="/admin/packages"
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${formatCurrency(stats.monthlyRevenue)}đ`}
          icon={DollarSign}
          trend={12}
          sub={`Tổng: ${formatCurrency(stats.totalRevenue)}đ`}
          color="bg-purple-500"
          bgColor="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        <StatCard
          title="Báo cáo vi phạm"
          value={stats.totalReports}
          icon={AlertTriangle}
          sub={
            stats.pendingReports > 0
              ? `${stats.pendingReports} chờ xử lý — cần xem xét`
              : "Không có báo cáo mới"
          }
          color="bg-orange-500"
          bgColor={`bg-gradient-to-br ${stats.pendingReports > 0 ? "from-orange-500 to-red-600" : "from-orange-400 to-orange-600"}`}
          linkTo="/admin/report"
        />
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MiniCard label="Sinh viên" value={stats.totalStudents.toLocaleString()} icon={Users} color="bg-blue-500" linkTo="/admin/users" />
        <MiniCard label="Nhà tuyển dụng" value={stats.totalEmployers.toLocaleString()} icon={ShieldCheck} color="bg-purple-500" linkTo="/admin/users" />
        <MiniCard label="Đơn ứng tuyển" value={stats.totalRequests.toLocaleString()} icon={FileText} color="bg-indigo-500" />
        <MiniCard label="Bài viết" value={stats.totalPosts.toLocaleString()} icon={Activity} color="bg-teal-500" />
        <MiniCard label="Chờ xử lý" value={stats.pendingReports} icon={Clock} color="bg-amber-500" linkTo="/admin/report" />
        <MiniCard label="Đã giải quyết" value={stats.resolvedReports} icon={CheckCircle} color="bg-green-500" linkTo="/admin/report" />
      </div>

      {/* Charts Filter */}
      <div className="flex items-center justify-between mb-4 mt-8">
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

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Doanh thu {period === 'week' ? '7 ngày qua' : period === '10weeks' ? '10 tuần qua' : period === 'year' ? '5 năm qua' : '6 tháng qua'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Biến động doanh thu theo thời gian</p>
            </div>
            <div className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
              Tháng này: {formatCurrency(stats.monthlyRevenue)}đ
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="dashRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatK} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="Doanh thu"
                stroke={CHART_COLORS.purple}
                fillOpacity={1}
                fill="url(#dashRevenueGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Người dùng mới {period === 'week' ? '7 ngày qua' : period === '10weeks' ? '10 tuần qua' : period === 'year' ? '5 năm qua' : '6 tháng qua'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Số tài khoản đăng ký mới</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={userChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), "Người dùng mới"]}
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="Người dùng mới" fill={CHART_COLORS.blue} radius={[8, 8, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Type Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <PieChart className="w-5 h-5 text-green-600" />
            Phân bố người dùng
          </h3>
          <p className="text-xs text-gray-400 mb-4">Tỷ lệ sinh viên / nhà tuyển dụng</p>
          <ResponsiveContainer width="100%" height={220}>
            <RePieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {userTypeData.map((entry, i) => (
                  <Cell key={`uc-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString(), "Số lượng"]} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {userTypeData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Status Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-orange-600" />
            Trạng thái báo cáo
          </h3>
          <p className="text-xs text-gray-400 mb-4">Tổng: {totalReportCount} báo cáo</p>
          {totalReportCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-400">
              <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
              <p className="text-sm font-medium text-green-600">Tất cả đã xử lý</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie
                    data={reportPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {reportPieData.map((entry, i) => (
                      <Cell key={`rc-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Báo cáo"]} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {reportPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-purple-600" />
            Thao tác nhanh
          </h3>
          <p className="text-xs text-gray-400 mb-4">Truy cập nhanh các chức năng quản lý</p>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Quản lý người dùng</div>
                  <div className="text-xs text-gray-500">{stats.totalUsers.toLocaleString()} tài khoản</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/accounts"
              className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Quản lý tài khoản</div>
                  <div className="text-xs text-gray-500">Tạo, chỉnh sửa, khóa/mở</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/report"
              className="flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Báo cáo vi phạm</div>
                  <div className="text-xs text-gray-500">
                    {stats.pendingReports > 0 ? `${stats.pendingReports} cần xử lý` : "Không có báo cáo mới"}
                  </div>
                </div>
              </div>
              {stats.pendingReports > 0 && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {stats.pendingReports}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/packages"
              className="flex items-center justify-between p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Gói dịch vụ</div>
                  <div className="text-xs text-gray-500">Quản lý gói VIP cho NTD</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* System Summary Bar */}
      <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tóm tắt hệ thống</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Người dùng</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.activeJobs.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Tin đang tuyển</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Đơn ứng tuyển</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-600">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Bài viết</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">{stats.totalStudents.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Sinh viên</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-pink-600">{stats.totalEmployers.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Nhà tuyển dụng</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{stats.pendingReports}</div>
            <div className="text-xs text-gray-400">Chờ xử lý</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="text-xs text-gray-400">Doanh thu tháng</div>
          </div>
        </div>
      </div>
    </div>
  );
}
