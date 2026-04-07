import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  MessageSquare,
  Calendar,
  Filter,
  ChevronDown,
  Heart,
  Zap,
  TrendingUp,
  Navigation,
  ArrowUpDown,
  ExternalLink,
  Search,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type TabType = "jobs" | "posts";
type SortOption = "recent" | "oldest" | "salary" | "rating";
type FilterChip = "nearby" | "high-pay" | "urgent";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const savedJobsData = [
  {
    id: "1",
    title: "Nhân viên bán hàng",
    company: "H&M",
    image: "https://images.unsplash.com/photo-1707141784065-493c0f7dc953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBjbG90aGluZyUyMHN0b3JlfGVufDF8fHx8MTc3MzY2NTU2OXww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Quận 1, TP.HCM",
    salary: "30.000đ - 40.000đ/giờ",
    hourlyRate: 35000,
    shift: "Ca chiều",
    rating: 4.5,
    reviews: 234,
    savedDaysAgo: 2,
    urgent: false,
    nearby: false,
    category: "Bán lẻ",
  },
  {
    id: "2",
    title: "Phụ bếp",
    company: "Món Huế",
    image: "https://images.unsplash.com/photo-1584531762699-81c8ccbfee40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwcmVzdGF1cmFudCUyMGtpdGNoZW58ZW58MXx8fHwxNzczNzYxMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Quận 5, TP.HCM",
    salary: "28.000đ - 32.000đ/giờ",
    hourlyRate: 30000,
    shift: "Ca tối",
    rating: 4.2,
    reviews: 89,
    savedDaysAgo: 5,
    urgent: true,
    nearby: true,
    category: "Nhà hàng",
  },
  {
    id: "3",
    title: "Gia sư Toán - Lý",
    company: "Trung tâm Gia sư Ánh Sao",
    image: "https://images.unsplash.com/photo-1758685733940-b1c11d04f553?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoJTIwdHV0b3IlMjBzdHVkZW50fGVufDF8fHx8MTc3Mzc2MTIzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Quận 10, TP.HCM",
    salary: "50.000đ - 70.000đ/giờ",
    hourlyRate: 60000,
    shift: "Linh hoạt",
    rating: 4.8,
    reviews: 156,
    savedDaysAgo: 7,
    urgent: false,
    nearby: false,
    category: "Giáo dục",
  },
];

const savedPostsData = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    avatar: "👨‍💼",
    category: "Kinh nghiệm",
    title: "Review làm việc tại Highlands Coffee - Chi nhánh Quận 1",
    preview: "Mình đã làm barista ở Highlands được 6 tháng, chia sẻ kinh nghiệm cho các bạn sinh viên...",
    likes: 245,
    comments: 34,
    savedDaysAgo: 3,
  },
  {
    id: "2",
    author: "Trần Thị B",
    avatar: "👩‍🎓",
    category: "Cảnh báo",
    title: "Cảnh báo công ty lừa đảo - Công ty TNHH ABC",
    preview: "Cảnh báo các bạn tránh xa công ty này, họ yêu cầu đặt cọc tiền và không trả lương...",
    likes: 567,
    comments: 89,
    savedDaysAgo: 4,
  },
  {
    id: "3",
    author: "Lê Minh C",
    avatar: "🧑‍💻",
    category: "Mẹo",
    title: "10 mẹo để vượt qua phỏng vấn việc làm part-time",
    preview: "Sau nhiều lần phỏng vấn, mình rút ra được một số kinh nghiệm hữu ích muốn chia sẻ...",
    likes: 432,
    comments: 56,
    savedDaysAgo: 6,
  },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Mới lưu nhất" },
  { value: "oldest", label: "Lưu lâu nhất" },
  { value: "salary", label: "Lương cao nhất" },
  { value: "rating", label: "Đánh giá cao" },
];

const categoryConfig: Record<string, { bg: string; text: string; icon: string }> = {
  "Kinh nghiệm": { bg: "bg-blue-50", text: "text-blue-700", icon: "💼" },
  "Cảnh báo": { bg: "bg-red-50", text: "text-red-700", icon: "⚠️" },
  "Mẹo": { bg: "bg-green-50", text: "text-green-700", icon: "💡" },
  "Hỏi đáp": { bg: "bg-purple-50", text: "text-purple-700", icon: "❓" },
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SavedJobs() {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
  const [removedJobs, setRemovedJobs] = useState<string[]>([]);
  const [removedPosts, setRemovedPosts] = useState<string[]>([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleFilter = (chip: FilterChip) => {
    setActiveFilters((prev) =>
      prev.includes(chip) ? prev.filter((f) => f !== chip) : [...prev, chip]
    );
  };

  // Filter + sort jobs
  let visibleJobs = savedJobsData.filter((j) => !removedJobs.includes(j.id));
  if (activeFilters.includes("nearby")) visibleJobs = visibleJobs.filter((j) => j.nearby);
  if (activeFilters.includes("high-pay")) visibleJobs = visibleJobs.filter((j) => j.hourlyRate >= 50000);
  if (activeFilters.includes("urgent")) visibleJobs = visibleJobs.filter((j) => j.urgent);
  visibleJobs = [...visibleJobs].sort((a, b) => {
    if (sortBy === "recent") return a.savedDaysAgo - b.savedDaysAgo;
    if (sortBy === "oldest") return b.savedDaysAgo - a.savedDaysAgo;
    if (sortBy === "salary") return b.hourlyRate - a.hourlyRate;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const visiblePosts = savedPostsData.filter((p) => !removedPosts.includes(p.id));
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">

      {/* ══════════════════════════════════════
          HEADER — Minimalist gradient
      ══════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          {/* Title row */}
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Accent icon */}
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Bookmark className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Đã lưu</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {activeTab === "jobs"
                    ? `${visibleJobs.length} công việc đã lưu`
                    : `${visiblePosts.length} bài viết đã lưu`}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-100">
            {[
              { key: "jobs" as TabType, label: "Việc làm", icon: Briefcase, count: visibleJobs.length },
              { key: "posts" as TabType, label: "Bài viết", icon: MessageSquare, count: visiblePosts.length },
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === key
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {count}
                </span>
                {/* Active underline */}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STICKY TOOLBAR — Filter chips + Sort
      ══════════════════════════════════════ */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {[
              { key: "nearby" as FilterChip, label: "Gần tôi", icon: Navigation },
              { key: "high-pay" as FilterChip, label: "Lương cao", icon: TrendingUp },
              { key: "urgent" as FilterChip, label: "Việc gấp", icon: Zap },
            ].map(({ key, label, icon: Icon }) => {
              const active = activeFilters.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="flex-shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors px-2"
              >
                Xóa lọc
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          {activeTab === "jobs" && (
            <div className="relative flex-shrink-0" ref={sortRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                {currentSortLabel}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        sortBy === opt.value
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <>
            {visibleJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleJobs.map((job) => (
                  <SavedJobCard
                    key={job.id}
                    job={job}
                    onUnsave={() => setRemovedJobs((prev) => [...prev, job.id])}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                type="jobs"
                hasFilters={activeFilters.length > 0}
                onClearFilters={() => setActiveFilters([])}
              />
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <>
            {visiblePosts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visiblePosts.map((post) => (
                  <SavedPostCard
                    key={post.id}
                    post={post}
                    onUnsave={() => setRemovedPosts((prev) => [...prev, post.id])}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="posts" hasFilters={false} onClearFilters={() => {}} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SAVED JOB CARD
───────────────────────────────────────────────────────────── */
function SavedJobCard({
  job,
  onUnsave,
}: {
  job: (typeof savedJobsData)[0];
  onUnsave: () => void;
}) {
  const [unsaved, setUnsaved] = useState(false);

  if (unsaved) return null;

  const handleUnsave = (e: React.MouseEvent) => {
    e.preventDefault();
    setUnsaved(true);
    setTimeout(onUnsave, 300);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col border border-gray-100 ${
        unsaved ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44 flex-shrink-0">
        {job.image ? (
          <ImageWithFallback
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-blue-300" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Urgent badge */}
        {job.urgent && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" /> TUYỂN GẤP
          </div>
        )}

        {/* ❤️ Unsave button — glassmorphism */}
        <button
          onClick={handleUnsave}
          title="Bỏ lưu"
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-red-500/80 hover:border-red-300 transition-all duration-200 group/unsave"
        >
          <Heart className="w-4 h-4 fill-white group-hover/unsave:fill-white" />
        </button>

        {/* Category pill */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full">
            {job.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/jobs/${job.id}`} className="flex flex-col flex-1 p-4">
        {/* Title & Company */}
        <div className="mb-2">
          <h3 className="font-bold text-[#1f2937] text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-0.5">
            {job.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{job.company}</p>
        </div>

        {/* Salary — hero info */}
        <div className="flex items-center gap-1.5 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="text-base font-extrabold text-emerald-600">{job.salary}</span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{job.shift}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>
              {job.rating}{" "}
              <span className="text-gray-300">({job.reviews} đánh giá)</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Đã lưu {job.savedDaysAgo} ngày trước</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to={`/jobs/${job.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SAVED POST CARD
───────────────────────────────────────────────────────────── */
function SavedPostCard({
  post,
  onUnsave,
}: {
  post: (typeof savedPostsData)[0];
  onUnsave: () => void;
}) {
  const [unsaved, setUnsaved] = useState(false);

  if (unsaved) return null;

  const config = categoryConfig[post.category] ?? categoryConfig["Kinh nghiệm"];

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden ${
        unsaved ? "opacity-0 scale-95" : "opacity-100"
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${config.bg} ${config.text}`}
              >
                {config.icon} {post.category}
              </span>
            </div>
          </div>
          {/* Unsave */}
          <button
            onClick={() => { setUnsaved(true); setTimeout(onUnsave, 300); }}
            className="p-1.5 text-pink-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
            title="Bỏ lưu"
          >
            <Heart className="w-4 h-4 fill-pink-300 group-hover:fill-red-400" />
          </button>
        </div>

        {/* Content */}
        <Link to="/community" className="block group/title mb-3">
          <h3 className="font-bold text-[#1f2937] text-sm leading-snug mb-1 group-hover/title:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{post.preview}</p>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300" /> {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Đã lưu {post.savedDaysAgo} ngày trước</span>
          </div>
          <Link
            to="/community"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Xem bài <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState({
  type,
  hasFilters,
  onClearFilters,
}: {
  type: TabType;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* SVG Illustration */}
      <svg width="180" height="160" viewBox="0 0 180 160" fill="none" className="mb-6">
        {/* Shadow */}
        <ellipse cx="90" cy="148" rx="50" ry="7" fill="#E5E7EB" />
        {/* Body */}
        <rect x="55" y="90" width="70" height="58" rx="14" fill="#DBEAFE" />
        {/* Legs */}
        <rect x="66" y="138" width="16" height="18" rx="8" fill="#93C5FD" />
        <rect x="98" y="138" width="16" height="18" rx="8" fill="#93C5FD" />
        {/* Arms reaching up */}
        <rect x="28" y="95" width="30" height="10" rx="5" fill="#BFDBFE" transform="rotate(-35 28 95)" />
        <rect x="122" y="95" width="30" height="10" rx="5" fill="#BFDBFE" transform="rotate(35 122 95)" />
        {/* Head */}
        <circle cx="90" cy="72" r="28" fill="#FDE68A" />
        {/* Sad eyes */}
        <ellipse cx="80" cy="70" rx="3" ry="3.5" fill="#374151" />
        <ellipse cx="100" cy="70" rx="3" ry="3.5" fill="#374151" />
        {/* Sad mouth */}
        <path d="M80 84 Q90 79 100 84" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Graduation cap */}
        <rect x="64" y="50" width="52" height="6" rx="3" fill="#1E40AF" />
        <polygon points="90,38 112,50 68,50" fill="#1E40AF" />
        <line x1="112" y1="50" x2="116" y2="62" stroke="#1E40AF" strokeWidth="2" />
        <circle cx="117" cy="64" r="3" fill="#F59E0B" />
        {/* Bookmark outline */}
        <path d="M148 20 L148 50 L138 44 L128 50 L128 20 Z" stroke="#93C5FD" strokeWidth="2.5" fill="#EFF6FF" strokeLinejoin="round" />
        {/* Question marks */}
        <text x="30" y="50" fontSize="18" fill="#C7D2FE" fontWeight="bold">?</text>
        <text x="150" y="80" fontSize="14" fill="#BFDBFE" fontWeight="bold">?</text>
      </svg>

      {hasFilters ? (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Không có kết quả phù hợp</h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
            Bộ lọc của bạn không khớp với bất kỳ việc làm nào đã lưu. Hãy thử xóa bộ lọc nhé!
          </p>
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
          >
            <Filter className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {type === "jobs" ? "Chưa lưu việc làm nào" : "Chưa lưu bài viết nào"}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
            {type === "jobs"
              ? "Nhấn vào icon ❤️ ở các thẻ việc làm để lưu lại và xem sau nhé!"
              : "Lưu các bài viết hay để đọc lại khi cần. Nhấn icon bookmark ở bài viết bạn thích!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={type === "jobs" ? "/jobs" : "/community"}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:shadow-xl shadow-blue-200"
            >
              <Search className="w-4 h-4" />
              {type === "jobs" ? "Khám phá việc làm ngay" : "Ghé thăm cộng đồng"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}