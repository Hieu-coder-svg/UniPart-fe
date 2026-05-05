import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { Link } from "react-router";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";

export default function EmployerDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          jobService.getMyJobPost(),
          applicationService.getEmployerApplications()
        ]);
        if (jobsRes.result) setJobs(jobsRes.result);
        if (appsRes.result) setApplications(appsRes.result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeJobsCount = jobs.filter(j => j.status === 'APPROVED' && new Date(j.expiredAt) > new Date()).length;
  const totalApplicantsCount = new Set(applications.map(a => a.studentId)).size;
  const expiringJobsCount = jobs.filter(j => j.status === 'APPROVED' && new Date(j.expiredAt) < new Date(Date.now() + 7 * 86400000) && new Date(j.expiredAt) > new Date()).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const stats = [
    {
      label: "Tin đang hoạt động",
      value: activeJobsCount.toString(),
      change: "Thực tế",
      trend: "up",
      icon: Briefcase,
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Tổng ứng viên",
      value: totalApplicantsCount.toString(),
      change: "Thực tế",
      trend: "up",
      icon: Users,
      color: "green",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      label: "Tin sắp hết hạn",
      value: expiringJobsCount.toString(),
      change: "Thực tế",
      trend: "down",
      icon: Clock,
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
    },
    {
      label: "Thông báo chưa đọc",
      value: unreadNotificationsCount.toString(),
      change: "Thực tế",
      trend: "up",
      icon: MessageSquare,
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600",
    },
  ];

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(job => ({
      id: job.id,
      title: job.title,
      status: new Date(job.expiredAt) < new Date() ? "expired" : new Date(job.expiredAt) < new Date(Date.now() + 7 * 86400000) ? "expiring" : "active",
      applicants: applications.filter(a => a.jobId === job.id).length,
      postedDate: job.createdAt,
      urgent: job.urgent,
    }));

  const recentApplicants = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 3)
    .map(app => ({
      id: app.id,
      name: app.studentName,
      job: app.jobTitle,
      appliedDate: app.appliedAt,
      status: app.status.toLowerCase(),
      avatar: app.studentName.charAt(0).toUpperCase()
    }));

  const quickActions = [
    {
      title: "Đăng tin mới",
      description: "Tạo tin tuyển dụng mới",
      icon: Briefcase,
      color: "orange",
      gradient: "from-orange-500 to-red-500",
      link: "/employer/dashboard/jobs",
    },
    {
      title: "Mua tin tuyển dụng",
      description: "Mua thêm slot đăng tin",
      icon: ShoppingCart,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      link: "/employer/dashboard/buy-posts",
    },
    {
      title: "Xem thống kê",
      description: "Phân tích hiệu quả",
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      link: "/employer/dashboard/analytics",
    },
    {
      title: "Tin tuyển gấp",
      description: "Đẩy tin lên top",
      icon: Zap,
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500",
      link: "/employer/dashboard/buy-posts",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl mb-2">
            Chào mừng trở lại, {user?.fullName || user?.username || "Nhà tuyển dụng"}! 👋
          </h1>
          <p className="text-orange-100 text-lg">
            Hôm nay bạn có {activeJobsCount} tin đang hoạt động và {new Set(applications.filter(a => a.status === 'PENDING').map(a => a.studentId)).size} ứng viên chờ duyệt
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl mb-6 text-gray-900">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tin tuyển dụng gần đây</h2>
              <Link
                to="/employer/dashboard/jobs"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {job.title}
                      </h3>
                      {job.urgent && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Gấp
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{job.applicants} ứng viên</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(job.postedDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>
                  {job.status === "active" ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Hoạt động
                    </span>
                  ) : job.status === "expiring" ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Sắp hết hạn
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Đã hết hạn
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applicants - 1/3 width */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Ứng viên mới</h2>
              <Link
                to="/employer/dashboard/applicants"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {applicant.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{applicant.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{applicant.job}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(applicant.appliedDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {applicant.status === "pending" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Hoạt động gần đây</h2>
        <div className="space-y-4">
          {notifications.length > 0 ? notifications.slice(0, 4).map((notif) => {
            let IconComp = MessageSquare;
            let color = "blue";
            if (notif.title.toLowerCase().includes("ứng viên") || notif.title.toLowerCase().includes("ứng tuyển")) {
              IconComp = Users;
              color = "green";
            } else if (notif.title.toLowerCase().includes("hệ thống")) {
              IconComp = AlertCircle;
              color = "orange";
            }
            return (
              <div key={notif.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComp className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{notif.title}</h4>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(notif.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            );
          }) : (
            <p className="text-gray-500 text-sm">Chưa có hoạt động nào gần đây.</p>
          )}
        </div>
      </div>
    </div>
  );
}