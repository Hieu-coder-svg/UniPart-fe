import {
  Users,
  Briefcase,
  Server,
  Activity,
  TrendingUp,
  Database,
  Cpu,
  HardDrive,
} from "lucide-react";
import { useState, useEffect } from "react";
import { userService } from "../../../services/userService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getAdminStats();
        if (response.result) {
          setStats(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const systemStats = {
    totalUsers: stats?.totalUsers || 0,
    totalJobs: stats?.totalJobs || 0,
    serverUptime: "99.9%",
    activeConnections: stats?.activeUsers || 0,
    storageUsed: "234GB / 500GB",
    cpuUsage: "45%",
    memoryUsage: "68%",
    requestsToday: stats?.totalRequests || 0,
  };

  const activityData = [
    { time: "00:00", users: 120, requests: 5200, id: "activity-0" },
    { time: "04:00", users: 80, requests: 3100, id: "activity-4" },
    { time: "08:00", users: 350, requests: 12500, id: "activity-8" },
    { time: "12:00", users: 420, requests: 18200, id: "activity-12" },
    { time: "16:00", users: 380, requests: 15800, id: "activity-16" },
    { time: "20:00", users: 290, requests: 11200, id: "activity-20" },
  ];

  const storageData = [
    { name: "Hình ảnh", size: 120, color: "#3b82f6", id: "storage-images" },
    { name: "Database", size: 85, color: "#8b5cf6", id: "storage-db" },
    { name: "Logs", size: 15, color: "#f59e0b", id: "storage-logs" },
    { name: "Backup", size: 14, color: "#10b981", id: "storage-backup" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Tổng quan Hệ thống</h1>
        <p className="text-gray-600">Dashboard quản trị cấp cao UniPart</p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Tổng người dùng</div>
                <div className="text-3xl">{systemStats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              Đang hoạt động: <span className="font-semibold">{systemStats.activeConnections}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Tổng việc làm</div>
                <div className="text-3xl">{systemStats.totalJobs.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">Requests hôm nay: {systemStats.requestsToday.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Server className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Uptime</div>
                <div className="text-3xl">{systemStats.serverUptime}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">CPU: {systemStats.cpuUsage}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-90">Bộ nhớ</div>
                <div className="text-xl">{systemStats.memoryUsage}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">{systemStats.storageUsed}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-red-600" />
                Hoạt động hệ thống
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activityData} key="admin-activity-area-chart">
                <defs>
                  <linearGradient id="adminActivityGradientUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#adminActivityGradientUnique)"
                  name="Người dùng"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Requests Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Requests API
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData} key="admin-requests-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Requests"
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Storage Usage */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-red-600" />
                Sử dụng bộ nhớ
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={storageData} key="admin-storage-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="size" fill="#ec4899" name="Dung lượng (GB)" radius={[8, 8, 0, 0]}>
                  {storageData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* System Resources */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-red-600" />
                Tài nguyên hệ thống
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-semibold">{systemStats.cpuUsage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                    style={{ width: systemStats.cpuUsage }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="text-sm font-semibold">{systemStats.memoryUsage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                    style={{ width: systemStats.memoryUsage }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Disk Usage</span>
                  <span className="text-sm font-semibold">46.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full w-[46.8%]"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Network</span>
                  <span className="text-sm font-semibold">32%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full w-[32%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}