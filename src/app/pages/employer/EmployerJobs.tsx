import { Plus, Search, Filter, MoreVertical, Eye, Users, Calendar, MapPin, Pencil, Package, Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";
import { userService } from "../../../services/userService";
import { CreateJobModal } from "../../components/CreateJobModal";
import { EditJobModal } from "../../components/EditJobModal";
import { useNotifications } from "../../contexts/NotificationContext";
import { Link, useSearchParams } from "react-router";

export default function EmployerJobs() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("all");
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [packageInfo, setPackageInfo] = useState<{ currentPackage: string; remainingPosts: number; remainingUrgentPosts: number; remainingMonthlyPosts: number; remainingMonthlyUrgentPosts: number; monthlyMaxPostsPerDay: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobResponse | null>(null);
  const { notifications } = useNotifications();
  const latestNotificationId = notifications[0]?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
  const itemsPerPage = 5;

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [jobsRes, appsRes, employerRes] = await Promise.all([
        jobService.getMyJobPost(),
        applicationService.getEmployerApplications(),
        userService.getEmployerMyInfo()
      ]);
      if (jobsRes.result) setJobs(jobsRes.result);
      if (appsRes.result) setApplications(appsRes.result);
      if (employerRes.result) {
        setPackageInfo({
          currentPackage: employerRes.result.currentPackage || "Gói Cơ bản",
          remainingPosts: employerRes.result.remainingPosts !== undefined ? employerRes.result.remainingPosts : 0,
          remainingUrgentPosts: employerRes.result.remainingUrgentPosts !== undefined ? employerRes.result.remainingUrgentPosts : 0,
          remainingMonthlyPosts: employerRes.result.remainingMonthlyPosts !== undefined ? employerRes.result.remainingMonthlyPosts : 0,
          remainingMonthlyUrgentPosts: employerRes.result.remainingMonthlyUrgentPosts !== undefined ? employerRes.result.remainingMonthlyUrgentPosts : 0,
          monthlyMaxPostsPerDay: employerRes.result.monthlyMaxPostsPerDay !== undefined ? employerRes.result.monthlyMaxPostsPerDay : null
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    if (new Date(job.expiredAt) < new Date()) return 'expired';
    return 'active';
  };

  const activeJobsCount = jobs.filter(j => getJobStatus(j) === 'active').length;
  const expiredJobsCount = jobs.filter(j => getJobStatus(j) === 'expired').length;
  const totalApplicantsCount = new Set(applications.map(a => a.studentId)).size;

  const stats = [
    { label: "Tổng tin đăng", value: jobs.length.toString(), color: "bg-blue-50 text-blue-600", icon: Calendar },
    { label: "Đang hoạt động", value: activeJobsCount.toString(), color: "bg-green-50 text-green-600", icon: Eye },
    { label: "Tổng ứng viên", value: totalApplicantsCount.toString(), color: "bg-purple-50 text-purple-600", icon: Users },
    { label: "Đã hết hạn", value: expiredJobsCount.toString(), color: "bg-gray-100 text-gray-600", icon: Calendar },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "all" || getJobStatus(job) === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchLower) || 
                          (job.employerName && job.employerName.toLowerCase().includes(searchLower));
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleTabChange = (tab: "all" | "active" | "expired") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      prev.delete("page");
      return prev;
    }, { replace: true });
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setSearchParams((prev) => {
      prev.delete("page");
      return prev;
    }, { replace: true });
  };

  const handlePageChange = (pageIdx: number) => {
    setSearchParams(
      (prev) => {
        if (pageIdx === 0) {
          prev.delete("page");
        } else {
          prev.set("page", String(pageIdx + 1));
        }
        return prev;
      },
      { replace: true }
    );
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-500 text-sm">Theo dõi và quản lý các công việc bạn đã đăng</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 shadow-sm transition-colors">
          <Plus className="w-5 h-5" />
          <span>Đăng tin mới</span>
        </button>
      </div>

      {/* Package Info Banner */}
      {packageInfo && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gói hiện tại</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  Tin thường (lẻ): {packageInfo.remainingPosts}
                </span>
                <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md border border-orange-100 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Tin gấp (lẻ): {packageInfo.remainingUrgentPosts}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-md border border-purple-100 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  Tin thường trong ngày (gói tháng): {packageInfo.remainingMonthlyPosts}
                </span>
                <span className="px-2.5 py-1 bg-pink-50 text-pink-700 text-xs font-semibold rounded-md border border-pink-100 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Tin gấp (gói tháng): {packageInfo.remainingMonthlyUrgentPosts}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/employer/dashboard/buy-posts"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm text-sm"
          >
            Nâng cấp gói
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm tin tuyển dụng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm">
            <Filter className="w-4 h-4" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-4 border-t border-gray-100 overflow-x-auto">
          <button
            onClick={() => handleTabChange("all")}
            className={`py-3 -mb-px border-b-2 transition-all font-medium whitespace-nowrap text-sm ${
              activeTab === "all"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Tất cả ({jobs.length})
          </button>
          <button
            onClick={() => handleTabChange("active")}
            className={`py-3 -mb-px border-b-2 transition-all font-medium whitespace-nowrap text-sm ${
              activeTab === "active"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Đang hoạt động ({activeJobsCount})
          </button>
          <button
            onClick={() => handleTabChange("expired")}
            className={`py-3 -mb-px border-b-2 transition-all font-medium whitespace-nowrap text-sm ${
              activeTab === "expired"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Đã hết hạn ({expiredJobsCount})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {paginatedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Không tìm thấy tin tuyển dụng nào.</p>
          </div>
        ) : (
          paginatedJobs.map((job) => {
            const status = getJobStatus(job);
            const applicantsCount = applications.filter(a => a.jobId === job.id).length;
            
            return (
            <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-orange-200 transition-colors">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-lg font-bold border border-orange-100 shrink-0">
                    {job.employerName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                      {job.urgent ? (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded flex items-center gap-1 uppercase tracking-wide">
                          🔥 Tuyển gấp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          Tin thường
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{job.employerName}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{job.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900">
                          {job.salary ? `${job.salary.toLocaleString()}đ` : 'Thỏa thuận'}
                        </span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase">
                          {job.workingShift || 'FULL-TIME'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center lg:items-end gap-4 lg:gap-6 border-t lg:border-t-0 border-gray-100 pt-4 lg:pt-0">
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{job.viewCount || 0}</div>
                      <div className="text-xs text-gray-500">Lượt xem</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{applicantsCount}</div>
                      <div className="text-xs text-gray-500">Ứng viên</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">{job.vacancies ?? 0}</div>
                      <div className="text-xs text-gray-500">Còn chỗ</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {job.isHide ? (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-md text-xs font-medium">
                        Đã đủ người
                      </span>
                    ) : status === "active" ? (
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-xs font-medium">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-medium">
                        Đã hết hạn
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setEditingJob(job);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-md transition-colors ml-auto sm:ml-0"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>              <div className="mt-4 pt-3 border-t border-gray-50 flex gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đăng ngày: <span className="font-medium text-gray-700">{new Date(job.createdAt).toLocaleDateString("vi-VN")}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hết hạn: <span className="font-medium text-gray-700">{new Date(job.expiredAt).toLocaleDateString("vi-VN")}</span></span>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">
            Trang <span className="text-gray-900 font-semibold">{currentPage + 1}</span> trên <span className="text-gray-900 font-semibold">{totalPages}</span> (Tổng số {filteredJobs.length} tin)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {getPageNumbers().map((pageVal, idx) => {
              if (pageVal === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 select-none text-sm font-bold"
                  >
                    ...
                  </span>
                );
              }
              
              const pageIdx = pageVal as number;
              const active = pageIdx === currentPage;
              return (
                <button
                  key={pageIdx}
                  onClick={() => handlePageChange(pageIdx)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                    active
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-500/20 border-transparent"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600"
                  }`}
                >
                  {pageIdx + 1}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          fetchData();
        }} 
      />
      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onSuccess={() => {
          fetchData();
        }}
        job={editingJob}
      />
    </div>
  );
}