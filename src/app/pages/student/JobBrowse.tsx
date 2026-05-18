import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { jobService, JobResponse, JobFilterRequest, JobRecommendationResponse } from "../../../services/jobService";
import { userService, StudentScheduleResponse, StudentResponse } from "../../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { calculateDistance, formatDistance } from "../../../utils/location";
import { useSavedJobs } from "../../contexts/SavedJobsContext";
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
  { value: "high", label: "Trên 50.000đ", min: 50001, max: undefined },
  { value: "medium", label: "30k – 50k", min: 30000, max: 50000 },
  { value: "low", label: "Dưới 30.000đ", min: 0, max: 29999 },
];
const LOCATIONS = [
  // 12 Quận nội thành
  "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy",
  "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân",
  "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông",
  // Thị xã
  "Sơn Tây",
  // 17 Huyện ngoại thành
  "Ba Vì", "Chương Mỹ", "Đan Phượng", "Đông Anh", "Gia Lâm",
  "Hoài Đức", "Mê Linh", "Mỹ Đức", "Phú Xuyên", "Phúc Thọ",
  "Quốc Oai", "Sóc Sơn", "Thạch Thất", "Thanh Oai",
  "Thường Tín", "Ứng Hòa",
];

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function JobBrowse() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") || "");
  const [selectedLocation, setSelectedLocation] = useState<string>(() => searchParams.get("location") || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  const [filterByDistance, setFilterByDistance] = useState(false);
  const [filterBySchedule, setFilterBySchedule] = useState(true);
  const [studentSchedule, setStudentSchedule] = useState<Record<string, number[]>>({});
  const [studentInfo, setStudentInfo] = useState<StudentResponse | null>(null);

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobRecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { savedJobIds, saveJob, unsaveJob, isJobSaved } = useSavedJobs();

  useEffect(() => {
    if (user?.role === "STUDENT") {
      jobService.getStudentRecommendations()
        .then(res => {
          if (res.result) {
            const top3 = res.result
              .sort((a, b) => b.matchScore - a.matchScore)
              .slice(0, 3);
            setRecommendedJobs(top3);
          }
        })
        .catch(err => console.error("Failed to fetch recommendations:", err));
    }
  }, [user]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const categories = Object.keys(categoryIcons);

  // Đồng bộ lại khi URL params thay đổi (ví dụ navigate từ trang Home)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const loc = searchParams.get("location") || "all";
    setSearchTerm(q);
    setSelectedLocation(loc);
    if (user && user.role === "STUDENT") {
      fetchStudentSchedule();
      fetchStudentInfo();
    }
  }, [searchParams, user]);

  const fetchStudentInfo = async () => {
    try {
      const res = await userService.getStudentMyInfo();
      if (res.result) {
        setStudentInfo(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch student info", error);
    }
  };

  const fetchStudentSchedule = async () => {
    try {
      const res = await userService.getMySchedule();
      if (res.result) {
        setStudentSchedule(res.result.scheduleMatrix || {});
      }
    } catch (error) {
      console.error("Failed to fetch schedule", error);
    }
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedLocation !== "all" ||
    selectedCategory !== "all" ||
    selectedShifts.length > 0 ||
    selectedSalary !== "all" ||
    filterByDistance ||
    filterBySchedule;

  const clearAll = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedCategory("all");
    setSelectedShifts([]);
    setSelectedSalary("all");
    setFilterByDistance(false);
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
        size: 100,
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



  // Debounce việc fetch khi thay đổi filter (trừ khi nhấn nút tìm)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);



  const isConflict = (job: JobResponse) => {
    if (!filterBySchedule || !studentSchedule) return false;
    if (!job.timeSlots || job.timeSlots.length === 0) return false;

    const daysMap: Record<number, string> = {
      0: "CN", 1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7"
    };

    return job.timeSlots.some(slot => {
      const date = new Date(slot.workDate);
      const dayName = daysMap[date.getDay()];
      const busyIds = studentSchedule[dayName] || [];
      if (busyIds.length === 0) return false;

      // Convert startTime/endTime to slot IDs
      const startHour = parseInt(slot.startTime.split(":")[0]);
      const endHour = parseInt(slot.endTime.split(":")[0]);

      for (let h = startHour; h < endHour; h++) {
        const slotId = h - 5; // Assuming ID 1 is 6am, so 6am is slotId 1 (6-5)
        if (busyIds.includes(slotId)) return true;
      }
      return false;
    });
  };

  const filteredJobs = jobs.filter(job => {
    if (isConflict(job)) return false;
    if (filterByDistance) {
      if (studentInfo?.latitude == null || studentInfo?.longitude == null) return false;
      if (job.locationLatitude == null || job.locationLongitude == null) return false;
      const dist = calculateDistance(studentInfo.latitude, studentInfo.longitude, job.locationLatitude, job.locationLongitude);
      if (dist > 10) return false;
    }
    return true;
  });
  const featuredJobs = filteredJobs.filter((job) => job.urgent);
  const normalJobs = filteredJobs.filter((job) => !job.urgent);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const toggleSaveJob = async (jobId: number) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu việc làm!");
      return;
    }
    try {
      if (isJobSaved(jobId)) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
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
            <div className="flex items-center gap-2 px-4 py-2 w-48">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Khu vực..."
                value={selectedLocation === "all" ? "" : selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value || "all")}
                onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
              {selectedLocation !== "all" && (
                <button onClick={() => setSelectedLocation("all")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === "all"
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
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${active
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedSalary === "all"
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedSalary === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── KHOẢNG CÁCH ── */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Khoảng cách
                </p>
                <button
                  onClick={() => setFilterByDistance((prev) => !prev)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    filterByDistance
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  Dưới 10 km
                  {filterByDistance && (
                    <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">✓</span>
                  )}
                </button>
                {filterByDistance && studentInfo?.latitude == null && (
                  <p className="text-[10px] text-orange-500 italic mt-2 leading-tight">
                    ⚠️ Cập nhật hồ sơ để dùng bộ lọc này.
                  </p>
                )}
              </div>

              {/* ── LỊCH HỌC ── */}
              {user?.roleName === "STUDENT" && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Theo lịch học
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterBySchedule}
                        onChange={(e) => setFilterBySchedule(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-tight">
                    Chỉ hiển thị các công việc không trùng với lịch học của bạn.
                  </p>
                </div>
              )}

            </div>
          </aside>

          {/* ── JOB LISTINGS ── */}
          <main className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {filteredJobs.length > 0 ? (
                    <>
                      <span className="text-blue-600">{filteredJobs.length}</span> việc làm phù hợp
                    </>
                  ) : (
                    "Không tìm thấy kết quả"
                  )}
                </h2>
                {filterBySchedule && user?.roleName === "STUDENT" && Object.keys(studentSchedule).length > 0 && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Đã ẩn {jobs.length - filteredJobs.length} việc trùng lịch học của bạn
                  </p>
                )}
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
                      {featuredJobs.map((job) => {
                        const distance = studentInfo?.latitude != null && studentInfo?.longitude != null && job.locationLatitude != null && job.locationLongitude != null
                          ? calculateDistance(studentInfo.latitude, studentInfo.longitude, job.locationLatitude, job.locationLongitude)
                          : null;
                        return (
                          <JobCard
                            key={job.id}
                            job={job}
                            featured
                            isSaved={savedJobIds.has(job.id)}
                            onToggleSave={toggleSaveJob}
                            distance={distance}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {recommendedJobs.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4 mt-8">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-gray-800 text-base">Gợi ý cho bạn</h3>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {recommendedJobs.map((rec) => (
                        <div key={`rec-${rec.job.id}`} className="relative group">
                          <JobCard 
                            job={rec.job} 
                            isSaved={savedJobIds.has(rec.job.id)}
                            onToggleSave={toggleSaveJob}
                            distance={null}
                          />
                          <div className="absolute top-3 right-3 bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-full border border-blue-200 shadow-sm z-10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Star className="w-3 h-3 fill-blue-500 text-blue-500" /> Phù hợp {Math.round(rec.matchScore)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {normalJobs.length > 0 && (
                  <section>
                    <h3 className="font-bold text-gray-800 text-base mb-4">Tất cả việc làm</h3>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {normalJobs.map((job) => {
                        const distance = studentInfo?.latitude != null && studentInfo?.longitude != null && job.locationLatitude != null && job.locationLongitude != null
                          ? calculateDistance(studentInfo.latitude, studentInfo.longitude, job.locationLatitude, job.locationLongitude)
                          : null;
                        return (
                          <JobCard
                            key={job.id}
                            job={job}
                            isSaved={savedJobIds.has(job.id)}
                            onToggleSave={toggleSaveJob}
                            distance={distance}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {filteredJobs.length === 0 && <EmptyState onReset={clearAll} />}
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
function JobCard({ job, featured = false, isSaved, onToggleSave, distance }: { job: JobResponse; featured?: boolean; isSaved: boolean; onToggleSave: (id: number) => void; distance: number | null; }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden relative h-full cursor-pointer"
    >
      {/* ── Top color accent bar (featured only) ── */}
      {featured && (
        <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400" />
      )}

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* ── Row 1: Image + Title + Employer + Bookmark ── */}
        <div className="flex gap-4 items-start">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-gray-50 group-hover:scale-105 transition-transform duration-300">
            <ImageWithFallback
              src={job.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80"}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Employer */}
          <div className="flex-1 min-w-0">
            {featured && (
              <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 mb-1.5">
                <Zap className="w-2.5 h-2.5" /> TUYỂN GẤP
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-1 truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {job.employerName || "Nhà tuyển dụng"}
            </p>
            {distance != null ? (
              <p className="text-[10px] text-blue-600 font-bold mt-1.5 flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">
                <MapPin className="w-2.5 h-2.5" />
                Cách bạn {formatDistance(distance)}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 italic mt-1.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {job.locationLatitude != null ? "Cập nhật hồ sơ để xem khoảng cách" : "Chưa có tọa độ vị trí"}
              </p>
            )}
          </div>

          {/* Bookmark button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(job.id); }}
            className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
            aria-label={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-blue-500 text-blue-500" : ""}`} />
          </button>
        </div>

        {/* ── Row 2: Salary highlight ── */}
        <div className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl px-4 py-2.5">
          <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-emerald-700 font-bold text-base">
            {job.salary.toLocaleString()}đ
          </span>
          <span className="text-emerald-500 text-xs font-medium">/giờ</span>
        </div>

        {/* ── Row 3: Location & Shift chips ── */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate max-w-[130px]">{job.address}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-50/80 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-medium border border-blue-100">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            {job.workingShift}
          </span>
        </div>

        {/* ── Footer ── */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>5.0</span>
            <span className="text-gray-400 font-normal">(0 đánh giá)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
              {job.vacancies} vị trí
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(job.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>

      </div>
    </Link>
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