import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Briefcase,
  Calendar,
  Loader2,
  Clock,
  Search,
} from "lucide-react";
import { jobService, JobResponse } from "../../../services/jobService";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";

export default function EmployerAnalytics() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days");
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Database Data ---
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getMyJobPost().catch((e) => {
          console.error("Error fetching jobs for analytics:", e);
          return { result: [] as JobResponse[] };
        }),
        applicationService.getEmployerApplications().catch((e) => {
          console.error("Error fetching applications for analytics:", e);
          return { result: [] as ApplicationResponse[] };
        }),
      ]);

      if (jobsRes.result) setJobs(jobsRes.result);
      if (appsRes.result) setApplications(appsRes.result);
    } catch (err) {
      console.error("Unexpected error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // --- Date Range Constants ---
  const rangeMs = useMemo(() => {
    switch (timeRange) {
      case "7days":
        return 7 * 24 * 60 * 60 * 1000;
      case "30days":
        return 30 * 24 * 60 * 60 * 1000;
      case "90days":
        return 90 * 24 * 60 * 60 * 1000;
    }
  }, [timeRange]);

  const stats = useMemo(() => {
    const now = Date.now();
    const currentStart = now - rangeMs;
    const prevStart = now - 2 * rangeMs;

    // Helper: Filter jobs created within a range
    const getJobsInPeriod = (start: number, end: number) => {
      return jobs.filter((j) => {
        const createdTime = new Date(j.createdAt).getTime();
        return createdTime >= start && createdTime <= end;
      });
    };

    // Helper: Filter applications submitted within a range
    const getAppsInPeriod = (start: number, end: number) => {
      return applications.filter((a) => {
        const appliedTime = new Date(a.appliedAt).getTime();
        return appliedTime >= start && appliedTime <= end;
      });
    };

    // 1. ACTIVE JOBS (Current active jobs vs active jobs at previous period start)
    const activeJobsCurrent = jobs.filter(
      (j) => !j.isHide && new Date(j.expiredAt).getTime() > now
    ).length;
    
    const activeJobsPrev = jobs.filter((j) => {
      const createdTime = new Date(j.createdAt).getTime();
      const expiredTime = new Date(j.expiredAt).getTime();
      return (
        !j.isHide &&
        createdTime <= currentStart &&
        expiredTime > currentStart
      );
    }).length;

    const activeJobsChange = activeJobsCurrent - activeJobsPrev;
    const activeJobsChangePct =
      activeJobsPrev > 0 ? (activeJobsChange / activeJobsPrev) * 100 : activeJobsChange * 100;

    // 2. TOTAL VIEWS
    // Distribute views proportionally to active duration
    const getViewsInPeriod = (start: number, end: number) => {
      return jobs.reduce((sum, j) => {
        const createdTime = new Date(j.createdAt).getTime();
        const totalDuration = Math.max(
          1 * 24 * 60 * 60 * 1000,
          now - createdTime
        );
        const dailyViews = (j.viewCount || 0) / (totalDuration / (24 * 60 * 60 * 1000));
        
        // Active overlap inside the period [start, end]
        const overlapStart = Math.max(start, createdTime);
        const overlapEnd = Math.min(end, now);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);
        const overlapDays = overlapDuration / (24 * 60 * 60 * 1000);
        
        return sum + Math.round(dailyViews * overlapDays);
      }, 0);
    };

    const viewsCurrent = getViewsInPeriod(currentStart, now);
    const viewsPrev = getViewsInPeriod(prevStart, currentStart);
    const viewsChange = viewsCurrent - viewsPrev;
    const viewsChangePct =
      viewsPrev > 0 ? (viewsChange / viewsPrev) * 100 : viewsChange * 100;

    // 3. TOTAL APPLICANTS
    const appsCurrent = getAppsInPeriod(currentStart, now).length;
    const appsPrev = getAppsInPeriod(prevStart, currentStart).length;
    const appsChange = appsCurrent - appsPrev;
    const appsChangePct =
      appsPrev > 0 ? (appsChange / appsPrev) * 100 : appsChange * 100;

    // 4. CONVERSION RATE
    const convRateCurrent = viewsCurrent > 0 ? (appsCurrent / viewsCurrent) * 100 : 0;
    const convRatePrev = viewsPrev > 0 ? (appsPrev / viewsPrev) * 100 : 0;
    const convRateChange = convRateCurrent - convRatePrev;

    return [
      {
        label: "Tổng lượt xem",
        value: viewsCurrent.toLocaleString(),
        change: `${viewsChangePct >= 0 ? "+" : ""}${viewsChangePct.toFixed(1)}%`,
        trend: viewsChangePct >= 0 ? "up" : "down",
        icon: Eye,
        color: "blue",
      },
      {
        label: "Tổng ứng viên",
        value: appsCurrent.toLocaleString(),
        change: `${appsChangePct >= 0 ? "+" : ""}${appsChangePct.toFixed(1)}%`,
        trend: appsChangePct >= 0 ? "up" : "down",
        icon: Users,
        color: "green",
      },
      {
        label: "Tin đang hoạt động",
        value: activeJobsCurrent.toString(),
        change: `${activeJobsChangePct >= 0 ? "+" : ""}${activeJobsChangePct.toFixed(1)}%`,
        trend: activeJobsChangePct >= 0 ? "up" : "down",
        icon: Briefcase,
        color: "purple",
      },
      {
        label: "Tỷ lệ chuyển đổi",
        value: `${convRateCurrent.toFixed(2)}%`,
        change: `${convRateChange >= 0 ? "+" : ""}${convRateChange.toFixed(2)}%`,
        trend: convRateChange >= 0 ? "up" : "down",
        icon: TrendingUp,
        color: "orange",
      },
    ];
  }, [jobs, applications, rangeMs]);

  // --- Top Performing Jobs ---
  const topPerformingJobs = useMemo(() => {
    return jobs
      .map((job) => {
        const jobApps = applications.filter((a) => a.jobId === job.id);
        const conversionRate =
          (job.viewCount || 0) > 0 ? (jobApps.length / job.viewCount!) * 100 : 0;
        return {
          id: job.id,
          title: job.title,
          views: job.viewCount || 0,
          applicants: jobApps.length,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [jobs, applications]);

  // --- Dynamic Chronological Chart Generator ---
  const chartData = useMemo(() => {
    const now = Date.now();
    const points: { day: string; views: number; applicants: number }[] = [];
    
    // Config intervals
    let numIntervals = 7;
    let intervalDays = 1;
    
    if (timeRange === "30days") {
      numIntervals = 6;
      intervalDays = 5;
    } else if (timeRange === "90days") {
      numIntervals = 6;
      intervalDays = 15;
    }

    for (let i = numIntervals - 1; i >= 0; i--) {
      const intervalEnd = now - i * intervalDays * 24 * 60 * 60 * 1000;
      const intervalStart = intervalEnd - intervalDays * 24 * 60 * 60 * 1000;

      // Group actual applications in this interval
      const intervalApps = applications.filter((a) => {
        const appliedTime = new Date(a.appliedAt).getTime();
        return appliedTime >= intervalStart && appliedTime < intervalEnd;
      }).length;

      // Group views proportionally for this interval
      const intervalViews = jobs.reduce((sum, j) => {
        const createdTime = new Date(j.createdAt).getTime();
        const totalDuration = Math.max(
          1 * 24 * 60 * 60 * 1000,
          now - createdTime
        );
        const dailyViews = (j.viewCount || 0) / (totalDuration / (24 * 60 * 60 * 1000));
        
        const overlapStart = Math.max(intervalStart, createdTime);
        const overlapEnd = Math.min(intervalEnd, now);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);
        const overlapDays = overlapDuration / (24 * 60 * 60 * 1000);

        return sum + Math.round(dailyViews * overlapDays);
      }, 0);

      // Label formatting
      let label = "";
      if (timeRange === "7days") {
        const date = new Date(intervalEnd);
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        const startDate = new Date(intervalStart);
        const endDate = new Date(intervalEnd);
        label = `${startDate.getDate()}/${startDate.getMonth() + 1}-${endDate.getDate()}/${endDate.getMonth() + 1}`;
      }

      points.push({
        day: label,
        views: intervalViews,
        applicants: intervalApps,
      });
    }

    return points;
  }, [jobs, applications, timeRange]);

  const maxViews = useMemo(() => {
    const vals = chartData.map((d) => d.views);
    return Math.max(10, ...vals);
  }, [chartData]);

  const maxApplicants = useMemo(() => {
    const vals = chartData.map((d) => d.applicants);
    return Math.max(5, ...vals);
  }, [chartData]);

  // --- Peak Application Hours / Time Analysis ---
  const timeAnalysis = useMemo(() => {
    const slots = {
      morning: 0,   // 8:00 - 12:00
      afternoon: 0, // 12:00 - 16:00
      evening: 0,   // 16:00 - 20:00
      night: 0,     // 20:00 - 24:00
      others: 0,    // 0:00 - 8:00
    };

    applications.forEach((a) => {
      const hour = new Date(a.appliedAt).getHours();
      if (hour >= 8 && hour < 12) {
        slots.morning++;
      } else if (hour >= 12 && hour < 16) {
        slots.afternoon++;
      } else if (hour >= 16 && hour < 20) {
        slots.evening++;
      } else if (hour >= 20 && hour < 24) {
        slots.night++;
      } else {
        slots.others++;
      }
    });

    const total = Math.max(1, applications.length);
    const morningPct = Math.round((slots.morning / total) * 100);
    const afternoonPct = Math.round((slots.afternoon / total) * 100);
    const eveningPct = Math.round((slots.evening / total) * 100);
    const nightPct = Math.round((slots.night / total) * 100);

    return [
      { slotName: "8:00 - 12:00", pct: morningPct },
      { slotName: "12:00 - 16:00", pct: afternoonPct },
      { slotName: "16:00 - 20:00", pct: eveningPct },
      { slotName: "20:00 - 24:00", pct: nightPct },
    ];
  }, [applications]);



  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex flex-col justify-center items-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-gray-500 font-medium text-lg">Đang tải dữ liệu phân tích từ database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Thống kê & Phân tích
          </h1>
          <p className="text-gray-600 text-lg">Theo dõi hiệu quả tuyển dụng thực tế của bạn</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium bg-white cursor-pointer hover:border-gray-300"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const isUp = stat.trend === "up";
          const TrendIcon = isUp ? TrendingUp : TrendingDown;
          const StatIcon = stat.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-xl hover:border-orange-200 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 ${
                    stat.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : stat.color === "green"
                      ? "bg-green-50 text-green-600"
                      : stat.color === "purple"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  <StatIcon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${
                    isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-orange-500" />
            Lượt xem theo thời gian
          </h3>
          <div className="space-y-4">
            {chartData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-semibold">{data.day}</span>
                  <span className="font-bold text-gray-800">{data.views.toLocaleString()} lượt xem</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-red-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(data.views / maxViews) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicants Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Ứng viên theo thời gian
          </h3>
          <div className="space-y-4">
            {chartData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-semibold">{data.day}</span>
                  <span className="font-bold text-gray-800">{data.applicants} ứng viên</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(data.applicants / maxApplicants) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md overflow-hidden">
        <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-500" />
          Tin tuyển dụng hiệu quả nhất
        </h3>
        {topPerformingJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-xl">
            Bạn chưa đăng tuyển tin nào hoặc chưa có tương tác lượt xem.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-5 text-sm font-semibold text-gray-500">Vị trí</th>
                  <th className="text-right py-3.5 px-5 text-sm font-semibold text-gray-500">Lượt xem</th>
                  <th className="text-right py-3.5 px-5 text-sm font-semibold text-gray-500">Ứng viên</th>
                  <th className="text-right py-3.5 px-5 text-sm font-semibold text-gray-500">Tỷ lệ chuyển đổi</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingJobs.map((job, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-gray-800">{job.title}</span>
                      </div>
                    </td>
                    <td className="text-right py-4 px-5 font-bold text-gray-700">{job.views.toLocaleString()}</td>
                    <td className="text-right py-4 px-5 font-bold text-gray-700">{job.applicants}</td>
                    <td className="text-right py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 shadow-sm">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {job.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Peak application time */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
        <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Thời gian ứng tuyển nhiều nhất
        </h3>
        <div className="space-y-4">
          {timeAnalysis.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold min-w-[100px]">{item.slotName}</span>
              <div className="flex-1 flex items-center gap-3 ml-4">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-800 w-12 text-right">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}