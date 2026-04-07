import { useState, useRef } from "react";
import { Link } from "react-router";
import { mockJobs, type Job } from "../../data/mockData";
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

const SHIFTS = ["Sáng", "Chiều", "Tối", "Cuối tuần"];
const SALARY_OPTIONS = [
  { value: "high", label: "Trên 50.000đ" },
  { value: "medium", label: "30k – 50k" },
  { value: "low", label: "Dưới 30.000đ" },
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
  const [isLoading] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(mockJobs.map((job) => job.category)));

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
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" || job.location.includes(selectedLocation);
    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;
    const matchesShift =
      selectedShifts.length === 0 || selectedShifts.includes(job.shift);
    const matchesSalary =
      selectedSalary === "all" ||
      (selectedSalary === "high" && job.hourlyRate >= 50000) ||
      (selectedSalary === "medium" && job.hourlyRate >= 30000 && job.hourlyRate < 50000) ||
      (selectedSalary === "low" && job.hourlyRate < 30000);
    return matchesSearch && matchesLocation && matchesCategory && matchesShift && matchesSalary;
  });

  const featuredJobs = filteredJobs.filter((job) => job.urgent);
  const normalJobs = filteredJobs.filter((job) => !job.urgent);

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
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
            <button className="m-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
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
              {/* All */}
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

              {/* ── KHU VỰC ── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Khu vực
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLocation("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLocation === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() =>
                        setSelectedLocation(selectedLocation === loc ? "all" : loc)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedLocation === loc
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── JOB LISTINGS ── */}
          <main className="lg:col-span-3 space-y-8">
            {/* Results header */}
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
                <p className="text-xs text-gray-400 mt-0.5">
                  Cập nhật lúc {new Date().toLocaleTimeString("vi-VN")}
                </p>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Filter className="w-3.5 h-3.5" />
                  Đang lọc
                </div>
              )}
            </div>

            {/* Loading skeleton */}
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
                {/* Featured jobs */}
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
                        <JobCard key={job.id} job={job} featured />
                      ))}
                    </div>
                  </section>
                )}

                {/* Normal jobs */}
                {normalJobs.length > 0 && (
                  <section>
                    <h3 className="font-bold text-gray-800 text-base mb-4">Tất cả việc làm</h3>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {normalJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
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
   JOB CARD — Modern with hover effects
───────────────────────────────────────── */
function JobCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-gray-100">
      {/* Image top-third */}
      <div className="relative overflow-hidden h-40 flex-shrink-0">
        {job.image ? (
          <ImageWithFallback
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <span className="text-4xl">{categoryIcons[job.category] ?? "💼"}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Urgency ribbon */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3" /> TUYỂN GẤP
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-sm transition-all ${
            saved
              ? "bg-blue-600 text-white"
              : "bg-white/80 text-gray-500 hover:bg-white hover:text-blue-600"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
        </button>

        {/* Category badge on image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full">
            {categoryIcons[job.category] ?? "💼"} {job.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/jobs/${job.id}`} className="flex flex-col flex-1 p-4">
        {/* Title & Company */}
        <div className="mb-3">
          <h3 className="font-bold text-[#1f2937] text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">{job.company}</p>
        </div>

        {/* Salary — most prominent */}
        <div className="flex items-center gap-1.5 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="text-base font-extrabold text-emerald-600">{job.salaryRange}</span>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{job.shift}{job.workingHours ? ` · ${job.workingHours}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>{job.rating} <span className="text-gray-300">({job.reviewCount} đánh giá)</span></span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Part-time badge */}
          <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
            Part-time
          </span>
          <span className="text-[10px] text-gray-400">{job.postedDate}</span>
        </div>
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE — Cute SVG illustration
───────────────────────────────────────── */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* SVG Illustration — student searching */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 200 180"
        className="mb-6 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <ellipse cx="100" cy="155" rx="45" ry="8" fill="#E5E7EB" />
        <rect x="72" y="100" width="56" height="55" rx="12" fill="#DBEAFE" />
        {/* Legs */}
        <rect x="80" y="148" width="14" height="20" rx="7" fill="#93C5FD" />
        <rect x="106" y="148" width="14" height="20" rx="7" fill="#93C5FD" />
        {/* Arms */}
        <rect x="50" y="105" width="24" height="10" rx="5" fill="#BFDBFE" transform="rotate(-20 50 105)" />
        <rect x="126" y="105" width="24" height="10" rx="5" fill="#BFDBFE" transform="rotate(20 126 105)" />
        {/* Head */}
        <circle cx="100" cy="82" r="26" fill="#FDE68A" />
        {/* Eyes */}
        <ellipse cx="91" cy="80" rx="3" ry="3.5" fill="#1F2937" />
        <ellipse cx="109" cy="80" rx="3" ry="3.5" fill="#1F2937" />
        {/* Smile */}
        <path d="M91 90 Q100 97 109 90" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Graduation cap */}
        <rect x="76" y="60" width="48" height="6" rx="3" fill="#1E40AF" />
        <polygon points="100,48 120,60 80,60" fill="#1E40AF" />
        <line x1="120" y1="60" x2="124" y2="72" stroke="#1E40AF" strokeWidth="2" />
        <circle cx="125" cy="74" r="3" fill="#F59E0B" />
        {/* Magnifying glass */}
        <circle cx="148" cy="100" r="18" stroke="#60A5FA" strokeWidth="4" fill="white" />
        <circle cx="148" cy="100" r="12" fill="#EFF6FF" />
        <line x1="161" y1="113" x2="172" y2="124" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round" />
        {/* Question mark */}
        <text x="143" y="106" fontSize="14" fontWeight="bold" fill="#93C5FD">?</text>
        {/* Floating dots */}
        <circle cx="30" cy="60" r="4" fill="#BFDBFE" opacity="0.7" />
        <circle cx="170" cy="50" r="6" fill="#FDE68A" opacity="0.7" />
        <circle cx="20" cy="120" r="3" fill="#A5F3FC" opacity="0.7" />
      </svg>

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
        <Link
          to="/community"
          className="text-sm text-gray-500 hover:text-blue-600 transition-colors underline underline-offset-2"
        >
          Hỏi cộng đồng sinh viên →
        </Link>
      </div>
    </div>
  );
}