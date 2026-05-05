import { useState, useEffect } from "react";
import { Link } from "react-router";
import { JobResponse } from "../../../services/jobService";
import { useSavedJobs } from "../../contexts/SavedJobsContext";
import { jobService } from "../../../services/jobService";
import {
  BookmarkMinus,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Search,
  Filter,
  ChevronDown,
  Trash2,
  ExternalLink,
  Zap,
  Loader2
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function SavedJobs() {
  const { savedJobs: savedJobEntries, isLoading, unsaveJob } = useSavedJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "salary_desc" | "salary_asc">("newest");
  const [isRemovingId, setIsRemovingId] = useState<number | null>(null);

  // Lưu chi tiết từng job (fetch theo jobId từ context)
  const [jobDetails, setJobDetails] = useState<Map<number, JobResponse>>(new Map());
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Mỗi khi danh sách savedJobEntries thay đổi → fetch chi tiết các job chưa có
  useEffect(() => {
    const missingIds = savedJobEntries
      .map((sj) => sj.jobId)
      .filter((id) => !jobDetails.has(id));

    if (missingIds.length === 0) return;

    setFetchingDetails(true);
    Promise.all(
      missingIds.map(async (jobId) => {
        try {
          const res = await jobService.getJobDetail(jobId);
          if (res.result) return { jobId, detail: res.result };
        } catch (e) {
          console.error(`Lỗi lấy chi tiết job ${jobId}`, e);
        }
        return null;
      })
    ).then((results) => {
      setJobDetails((prev) => {
        const next = new Map(prev);
        results.forEach((r) => {
          if (r) next.set(r.jobId, r.detail);
        });
        return next;
      });
      setFetchingDetails(false);
    });
  }, [savedJobEntries]);

  const handleUnsave = async (jobId: number) => {
    setIsRemovingId(jobId);
    try {
      await unsaveJob(jobId);
      // Xóa cache chi tiết khỏi map để tiết kiệm bộ nhớ
      setJobDetails((prev) => {
        const next = new Map(prev);
        next.delete(jobId);
        return next;
      });
    } catch (error) {
      console.error("Lỗi bỏ lưu việc làm", error);
    } finally {
      setIsRemovingId(null);
    }
  };

  // Ghép savedJobEntry + jobDetail thành 1 object để render
  const mergedJobs = savedJobEntries
    .filter((sj) => jobDetails.has(sj.jobId))
    .map((sj) => ({
      ...jobDetails.get(sj.jobId)!,
      savedJobId: sj.id,
      savedAt: sj.savedAt,
    }));

  // Filter & Sort
  const filteredJobs = mergedJobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "salary_desc": return b.salary - a.salary;
      case "salary_asc": return a.salary - b.salary;
      case "newest":
      default:
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
  });

  const showLoading = isLoading || fetchingDetails;

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8">
      {/* ════ HEADER BANNER ════ */}
      <div className="bg-[#0f1f4b] py-12 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <BookmarkMinus className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Việc Làm Đã Lưu</h1>
          <p className="text-blue-200 text-sm max-w-lg mx-auto">
            Xem lại những cơ hội việc làm bạn đã lưu lại. Đừng bỏ lỡ, hãy ứng tuyển ngay khi sẵn sàng!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">

        {/* ════ TOOLBAR ════ */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col sm:flex-row items-center gap-4 border border-gray-100">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm trong danh sách đã lưu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-auto font-medium"
              >
                <option value="newest">Lưu gần đây</option>
                <option value="salary_desc">Lương cao nhất</option>
                <option value="salary_asc">Lương thấp nhất</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 whitespace-nowrap hidden md:block">
              {savedJobEntries.length} việc
            </div>
          </div>
        </div>

        {/* ════ CONTENT ════ */}
        {showLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-medium text-sm">Đang tải danh sách việc làm...</p>
          </div>
        ) : savedJobEntries.length === 0 ? (
          <EmptyState />
        ) : sortedJobs.length === 0 && searchTerm ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy kết quả phù hợp</h3>
            <p className="text-sm text-gray-500">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {sortedJobs.map((job) => (
              <div key={job.id} className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden">
                {job.urgent && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1 z-10">
                    <Zap className="w-3 h-3" /> Tuyển gấp
                  </div>
                )}

                <div className="flex gap-4 items-start mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                    <ImageWithFallback src={job.image || ""} alt={job.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 pr-12">
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="font-bold text-gray-900 text-base leading-tight hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{job.employerName}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">Mức lương</div>
                      <div className="text-sm font-bold text-gray-800 truncate">{job.salary.toLocaleString()}đ</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">Khu vực</div>
                      <div className="text-sm font-medium text-gray-800 truncate">{job.address}</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-4 text-xs text-gray-500 px-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Ca {job.workingShift}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">Lưu lúc: {new Date(job.savedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg"
                  >
                    Ứng tuyển <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleUnsave(job.id)}
                    disabled={isRemovingId === job.id}
                    className="w-11 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-100 disabled:opacity-50 group-hover:shadow-sm"
                    title="Bỏ lưu việc làm này"
                  >
                    {isRemovingId === job.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-gray-100 shadow-sm mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-50 rounded-full blur-3xl -ml-10 -mb-10 opacity-60"></div>

      <div className="relative z-10">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
          <BookmarkMinus className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Bạn chưa lưu việc làm nào</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
          Hãy lướt xem các cơ hội việc làm hấp dẫn và lưu lại những công việc phù hợp với bạn để ứng tuyển sau nhé!
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Search className="w-5 h-5" />
          Khám phá việc làm ngay
        </Link>
      </div>
    </div>
  );
}