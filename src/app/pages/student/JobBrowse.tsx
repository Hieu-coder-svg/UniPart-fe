import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { jobService, JobResponse, JobFilterRequest } from "../../../services/jobService";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  Bookmark,
  TrendingUp,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from "lucide-react";
import AdBanner from "../../components/AdBanner";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

/* ─────────────────────────────────────────
   CATEGORY CAROUSEL DATA
───────────────────────────────────────── */
const categoryIcons: Record<string, string> = {
  "Giáo dục": "📚",
  "Nhà hàng": "☕",
  "Bán lẻ": "🛍️",
  "Kho vận": "📦",
  "Văn phòng": "💻",
  "Marketing": "📣",
  "Giao hàng": "🛵",
  "Siêu thị": "🏪",
};

const SHIFTS = [
  "Ca Sáng",
  "Ca Chiều",
  "Ca Tối",
  "Full-time",
  "Ca Linh Hoạt",
  "Tự do",
  "Xoay ca",
  "Làm tại nhà"
];
const SALARY_OPTIONS = [
  { value: "high", label: "Trên 50.000đ", min: 50000, max: undefined },
  { value: "medium", label: "30k – 50k", min: 30000, max: 49999 },
  { value: "low", label: "Dưới 30.000đ", min: 0, max: 29999 },
];
const LOCATIONS = ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Quận Bình Thạnh"];

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function JobBrowse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  const carouselRef = useRef<HTMLDivElement>(null);
  const categories = Object.keys(categoryIcons);

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedLocation !== "all" ||
    selectedCategory !== "all" ||
    selectedShifts.length > 0 ||
    selectedSalary !== "all";

  const clearAll = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedCategory("all");
    setSelectedShifts([]);
    setSelectedSalary("all");
  };

  const toggleShift = (shift: string) => {
    // Cho phép chọn nhiều ca, sẽ gửi lên dạng "Ca Sáng, Ca Tối"
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Xây dựng JobFilterRequest
      const filter: JobFilterRequest = {
        title: searchTerm || undefined,
        address: selectedLocation !== "all" ? selectedLocation : undefined,
        // Gửi thẳng mảng string[]
        workingShift: selectedShifts.length > 0 ? selectedShifts : undefined,
      };

      if (selectedSalary !== "all") {
        const option = SALARY_OPTIONS.find(o => o.value === selectedSalary);
        if (option) {
          filter.minSalary = option.min;
          filter.maxSalary = option.max;
        }
      }

      // Nếu có selectedCategory, có thể append vào searchTerm để API tìm
      if (selectedCategory !== "all") {
        filter.title = filter.title ? `${filter.title} ${selectedCategory}` : selectedCategory;
      }

      const res = await jobService.getAllJobs(filter);
      if (res.result && res.result.content) {
        setJobs(res.result.content);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLocation, selectedCategory, selectedShifts, selectedSalary]);

  const fetchSavedJobs = async () => {
    if (!user) return;
    try {
      const res = await jobService.getSavedJobs();
      if (res.result) {
        const ids = new Set(res.result.map(sj => sj.jobId));
        setSavedJobIds(ids);
      }
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
    }
  };

  // Debounce việc fetch khi thay đổi filter (trừ khi nhấn nút tìm)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const featuredJobs = jobs.filter((job) => job.urgent);
  const normalJobs = jobs.filter((job) => !job.urgent);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const toggleSaveJob = async (jobId: number) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu việc làm!");
      return;
    }
    const isSaved = savedJobIds.has(jobId);
    try {
      if (isSaved) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Toggle save job failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      {/* ══════════════ AD BANNER ══════════════ */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="rounded-2xl overflow-hidden">
            <AdBanner position="top" />
          </div>
        </div>
      </div>

      {/* ══════════════ UNIFIED SEARCH BAR ══════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          {/* Search block */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
            {/* Keyword */}
            <div className="flex items-center gap-2 flex-1 px-4 py-3">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tên công việc, công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200" />

            {/* Location */}
            <div className="flex items-center gap-2 px-4 py-3 w-44">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 text-sm cursor-pointer appearance-none"
              >
                <option value="all">Tất cả khu vực</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Search CTA */}
            <button onClick={fetchJobs} className="m-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              Tìm
            </button>
          </div>

          {/* Category Carousel */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Ngành:</span>

            <button
              onClick={() => scrollCarousel("left")}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 text-gray-500 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={carouselRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
              style={{ scrollbarWidth: "none" }}
            >
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🌟 Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {categoryIcons[cat] ?? "💼"} {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollCarousel("right")}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* ── SIDEBAR FILTER ── */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-40">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-800 text-sm">Bộ lọc</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Xóa tất cả
                  </button>
                )}
              </div>

              {/* ── CA LÀM VIỆC ── */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Ca làm việc
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHIFTS.map((shift) => {
                    const active = selectedShifts.includes(shift);
                    return (
                      <button
                        key={shift}
                        onClick={() => toggleShift(shift)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {shift}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── MỨC LƯƠNG ── */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Mức lương / giờ
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedSalary("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSalary === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả mức lương
                  </button>
                  {SALARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setSelectedSalary(selectedSalary === opt.value ? "all" : opt.value)
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedSalary === opt.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ── JOB LISTINGS ── */}
          <main className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {jobs.length > 0 ? (
                    <>
                      <span className="text-blue-600">{jobs.length}</span> việc làm phù hợp
                    </>
                  ) : (
                    "Không tìm thấy kết quả"
                  )}
                </h2>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Filter className="w-3.5 h-3.5" />
                  Đang lọc
                </div>
              )}
            </div>

            {isLoading && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-40 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (
              <>
                {featuredJobs.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-gray-800 text-base">Việc làm nổi bật</h3>
                      <span className="ml-auto text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                        Tuyển gấp
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {featuredJobs.map((job) => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          featured 
                          isSaved={savedJobIds.has(job.id)}
                          onToggleSave={toggleSaveJob}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {normalJobs.length > 0 && (
                  <section>
                    <h3 className="font-bold text-gray-800 text-base mb-4">Tất cả việc làm</h3>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {normalJobs.map((job) => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          isSaved={savedJobIds.has(job.id)}
                          onToggleSave={toggleSaveJob}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {jobs.length === 0 && <EmptyState onReset={clearAll} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   JOB CARD
───────────────────────────────────────── */
function JobCard({ job, featured = false, isSaved, onToggleSave }: { job: JobResponse; featured?: boolean; isSaved: boolean; onToggleSave: (id: number) => void; }) {
  // Cố gắng đoán category từ title (mock)
  let category = "Văn phòng";
  Object.keys(categoryIcons).forEach(cat => {
    if (job.title.toLowerCase().includes(cat.toLowerCase())) {
      category = cat;
    }
  });

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-100">
      <div className="relative overflow-hidden h-40 flex-shrink-0">
        {job.image ? (
          <ImageWithFallback
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <span className="text-4xl">{categoryIcons[category] ?? "💼"}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3" /> TUYỂN GẤP
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(job.id); }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-sm transition-all z-10 ${
            isSaved
              ? "bg-blue-600 text-white"
              : "bg-white/80 text-gray-500 hover:bg-white hover:text-blue-600"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
        </button>

        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full">
            {categoryIcons[category] ?? "💼"} {category}
          </span>
        </div>
      </div>

      <Link to={`/jobs/${job.id}`} className="flex flex-col flex-1 p-4">
        <div className="mb-3">
          <h3 className="font-bold text-[#1f2937] text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">{job.employerName}</p>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="text-base font-extrabold text-emerald-600">{job.salary.toLocaleString()}đ</span>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.address}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{job.workingShift}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>5.0 <span className="text-gray-300">(0 đánh giá)</span></span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
            {job.vacancies} vị trí
          </span>
          <span className="text-[10px] text-gray-400">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Hmm, không tìm thấy gì cả!</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
        Bộ lọc của bạn có thể đang quá chặt. Thử mở rộng tìm kiếm để khám phá thêm nhiều cơ hội nhé!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
        >
          <Search className="w-4 h-4" />
          Xem tất cả việc làm
        </button>
      </div>
    </div>
  );
}