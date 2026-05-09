import { Plus, Search, Filter, MoreVertical, Eye, Users, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";
import { CreateJobModal } from "../../components/CreateJobModal";
import { useNotifications } from "../../contexts/NotificationContext";

export default function EmployerJobs() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("all");
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { notifications } = useNotifications();
  const latestNotificationId = notifications[0]?.id;

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getMyJobPost(),
        applicationService.getEmployerApplications()
      ]);
      if (jobsRes.result) setJobs(jobsRes.result);
      if (appsRes.result) setApplications(appsRes.result);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true); // Initial load with spinner

    // Poll every 3 seconds for real-time stats updates
    const intervalId = setInterval(() => {
      fetchData(false); // Silent fetch
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (latestNotificationId) {
      fetchData(false);
    }
  }, [latestNotificationId]);

  const getJobStatus = (job: JobResponse) => {
    if (new Date(job.expiredAt) < new Date() || job.status === 'EXPIRED') return 'expired';
    if (job.status === 'APPROVED') return 'active';
    return job.status?.toLowerCase() || 'pending';
  };

  const activeJobsCount = jobs.filter(j => getJobStatus(j) === 'active').length;
  const expiredJobsCount = jobs.filter(j => getJobStatus(j) === 'expired').length;
  const totalApplicantsCount = new Set(applications.map(a => a.studentId)).size;

  const stats = [
    { label: "Tổng tin đăng", value: jobs.length.toString(), color: "blue", icon: Calendar },
    { label: "Đang hoạt động", value: activeJobsCount.toString(), color: "green", icon: Eye },
    { label: "Tổng ứng viên", value: totalApplicantsCount.toString(), color: "purple", icon: Users },
    { label: "Đã hết hạn", value: expiredJobsCount.toString(), color: "gray", icon: Calendar },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "all" || getJobStatus(job) === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchLower) || 
                          (job.employerName && job.employerName.toLowerCase().includes(searchLower));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-600 text-lg">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <Plus className="w-5 h-5" />
          <span>Đăng tin mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${
                stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                stat.color === 'green' ? 'from-green-500 to-green-600' :
                stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-gray-500 to-gray-600'
              } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tuyển dụng..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b-2 border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "all"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Tất cả ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "active"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Đang hoạt động ({activeJobsCount})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
              activeTab === "expired"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Đã hết hạn ({expiredJobsCount})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const status = getJobStatus(job);
          const applicantsCount = applications.filter(a => a.jobId === job.id).length;
          
          return (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {job.employerName?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-600 mb-3 font-medium">{job.employerName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{job.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-orange-600 font-semibold">
                          {job.salary ? `${job.salary.toLocaleString()}đ` : 'Thỏa thuận'}
                        </span>
                      </div>
                      <div>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-medium uppercase">
                          {job.workingShift || 'FULL-TIME'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:flex-col lg:items-end">
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold mb-1">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <span>—</span>
                    </div>
                    <div className="text-xs text-gray-500">Lượt xem</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold mb-1">
                      <Users className="w-5 h-5 text-green-500" />
                      <span>{applicantsCount}</span>
                    </div>
                    <div className="text-xs text-gray-500">Ứng viên</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {status === "active" ? (
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      Đang hoạt động
                    </span>
                  ) : status === "expired" ? (
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl text-sm font-medium shadow-lg">
                      Đã hết hạn
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl text-sm font-medium shadow-lg">
                      Chờ duyệt
                    </span>
                  )}
                  <button className="p-2 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 rounded-xl transition-all">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Đăng ngày: <strong>{new Date(job.createdAt).toLocaleDateString("vi-VN")}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Hết hạn: <strong>{new Date(job.expiredAt).toLocaleDateString("vi-VN")}</strong></span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          // Re-fetch jobs after creation
          jobService.getMyJobPost().then(res => {
            if (res.result) setJobs(res.result);
          });
        }} 
      />
    </div>
  );
}