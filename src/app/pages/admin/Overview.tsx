import {
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { mockSystemStats } from "../../data/mockData";
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

export default function AdminOverview() {
  const stats = mockSystemStats;

  const revenueData = [
    { month: "T1", revenue: 18500000 },
    { month: "T2", revenue: 21200000 },
    { month: "T3", revenue: 24800000 },
    { month: "T4", revenue: 26300000 },
    { month: "T5", revenue: 27100000 },
    { month: "T6", revenue: 28450000 },
  ];

  const userGrowthData = [
    { month: "T1", users: 8500 },
    { month: "T2", users: 9200 },
    { month: "T3", users: 10100 },
    { month: "T4", users: 10800 },
    { month: "T5", users: 11600 },
    { month: "T6", users: 12458 },
  ];

  const userTypeData = [
    { name: "Sinh viên", value: stats.totalStudents, color: "#3b82f6" },
    { name: "Nhà tuyển dụng", value: stats.totalEmployers, color: "#8b5cf6" },
  ];

  const reportStatusData = [
    { name: "Chờ xử lý", value: stats.pendingReports, color: "#f59e0b" },
    { name: "Đang xử lý", value: 16, color: "#3b82f6" },
    { name: "Đã giải quyết", value: stats.resolvedReports, color: "#10b981" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Dashboard quản trị UniPart</p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Tổng người dùng</div>
                <div className="text-3xl">{stats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex-1">
                <div className="opacity-80">Sinh viên</div>
                <div className="font-semibold">{stats.totalStudents.toLocaleString()}</div>
              </div>
              <div className="flex-1">
                <div className="opacity-80">NTD</div>
                <div className="font-semibold">{stats.totalEmployers.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Việc làm</div>
                <div className="text-3xl">{stats.totalJobs.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              Đang hoạt động: <span className="font-semibold">{stats.activeJobs.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Doanh thu tháng</div>
                <div className="text-3xl">{(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              Tổng: <span className="font-semibold">{(stats.totalRevenue / 1000000).toFixed(1)}M</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Báo cáo</div>
                <div className="text-3xl">{stats.totalReports}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              Chờ xử lý: <span className="font-semibold">{stats.pendingReports}</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Doanh thu 6 tháng
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData} id="admin-revenue-chart">
                <defs>
                  <linearGradient id="adminRevenueGradientUnique2024" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#adminRevenueGradientUnique2024)"
                  name="Doanh thu (đ)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-red-600" />
                Tăng trưởng người dùng
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userGrowthData} id="admin-user-growth-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="users" fill="#ef4444" name="Người dùng" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Type Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-red-600" />
                Phân loại người dùng
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart id="admin-usertype-pie">
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  id="usertype-pie-data"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`usertype-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Report Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-red-600" />
                Trạng thái báo cáo
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart id="admin-report-status-pie">
                <Pie
                  data={reportStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  id="report-status-pie-data"
                >
                  {reportStatusData.map((entry, index) => (
                    <Cell key={`report-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

