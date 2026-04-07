import { useState } from "react";
import { mockPosts, type Post } from "../../data/mockData";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  AlertTriangle,
  TrendingUp,
  Award,
  Bookmark,
  MoreHorizontal,
  Search,
  Hash,
  Flame,
  Users,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    value: "all",
    label: "Tất cả",
    icon: "🌐",
    activeColor: "bg-blue-600 text-white shadow-md shadow-blue-200",
    idleColor: "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md",
  },
  {
    value: "Kinh nghiệm",
    label: "Kinh nghiệm",
    icon: "💼",
    activeColor: "bg-blue-600 text-white shadow-md shadow-blue-200",
    idleColor: "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md",
  },
  {
    value: "Cảnh báo",
    label: "Cảnh báo",
    icon: "⚠️",
    activeColor: "bg-red-500 text-white shadow-md shadow-red-200",
    idleColor: "bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md",
  },
  {
    value: "Mẹo",
    label: "Mẹo hay",
    icon: "💡",
    activeColor: "bg-amber-500 text-white shadow-md shadow-amber-200",
    idleColor: "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-md",
  },
  {
    value: "Hỏi đáp",
    label: "Hỏi đáp",
    icon: "❓",
    activeColor: "bg-violet-600 text-white shadow-md shadow-violet-200",
    idleColor: "bg-violet-50 text-violet-700 hover:bg-violet-100 hover:shadow-md",
  },
];

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; border: string; icon: string; dot: string }> = {
  "Kinh nghiệm": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "💼", dot: "bg-blue-500" },
  "Cảnh báo":    { bg: "bg-red-50",  text: "text-red-700",  border: "border-red-200",  icon: "⚠️", dot: "bg-red-500" },
  "Mẹo":        { bg: "bg-amber-50", text: "text-amber-700",border: "border-amber-200",icon: "💡", dot: "bg-amber-500" },
  "Hỏi đáp":    { bg: "bg-violet-50",text: "text-violet-700",border:"border-violet-200",icon: "❓",dot: "bg-violet-500" },
};

const TRENDING_TOPICS = [
  { title: "Làm việc tại Highlands", count: 234, icon: "☕" },
  { title: "Gia sư online", count: 189, icon: "📚" },
  { title: "Công việc cuối tuần", count: 156, icon: "🗓️" },
  { title: "Cảnh báo lừa đảo", count: 142, icon: "🚨" },
  { title: "Tips phỏng vấn", count: 98, icon: "🎯" },
];

const TOP_CONTRIBUTORS = [
  { name: "Nguyễn Văn A", avatar: "👨‍💼", posts: 45, reputation: 1250, badge: "🥇" },
  { name: "Trần Thị B",   avatar: "👩‍🎓", posts: 38, reputation: 980,  badge: "🥈" },
  { name: "Lê Minh C",    avatar: "🧑‍💻", posts: 32, reputation: 870,  badge: "🥉" },
];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts =
    mockPosts
      .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
      .filter((p) =>
        searchQuery === "" ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">

      {/* ═══════════════════════════════════════════════
          HERO — compact gradient with dot overlay
      ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 shadow-sm">
        {/* Subtle gradient accent bar at very top */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {/* Top row: title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                  Cộng đồng UniPart
                </h1>
                <p className="text-sm text-gray-400">
                  Nơi sinh viên chia sẻ kinh nghiệm & cảnh báo thật
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search inline */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-52 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Post CTA */}
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 animate-none">
                <Plus className="w-4 h-4" />
                Đăng bài mới
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border border-transparent ${
                    isActive ? cat.activeColor : cat.idleColor
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-5">

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Chủ đề nổi bật</h3>
              </div>

              <div className="space-y-1">
                {TRENDING_TOPICS.map((topic, idx) => (
                  <button
                    key={idx}
                    className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 text-left"
                  >
                    {/* Rank number styled */}
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100 text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-base leading-none">{topic.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                      {topic.title}
                    </span>
                    {/* Count pill */}
                    <span className="flex-shrink-0 text-[10px] font-bold bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 px-2 py-0.5 rounded-full transition-colors">
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>

              <button className="mt-4 w-full text-center text-xs text-blue-600 hover:text-blue-800 font-semibold py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Xem thêm →
              </button>
            </div>

            {/* Top Active Members */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Top thành viên năng động</h3>
              </div>

              <div className="space-y-2">
                {TOP_CONTRIBUTORS.map((user, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    {/* Avatar with ring */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg ring-2 ring-white shadow-sm">
                        {user.avatar}
                      </div>
                      {/* Medal badge */}
                      <span className="absolute -top-1 -right-1 text-sm leading-none">{user.badge}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.posts} bài · {user.reputation.toLocaleString()} điểm
                      </p>
                    </div>

                    {/* Sparkle for top 1 */}
                    {idx === 0 && (
                      <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick tags cloud */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-gray-800 text-sm">Tag phổ biến</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["#highlands", "#giasu", "#parttime", "#luado", "#tuyengap", "#kinhnghiem", "#remote"].map((tag) => (
                  <button
                    key={tag}
                    className="text-xs text-gray-500 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN FEED ── */}
          <main className="lg:col-span-2 space-y-5">
            {/* Create Post prompt */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-xl ring-2 ring-blue-100 flex-shrink-0">
                  👤
                </div>
                <button className="flex-1 text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 text-sm transition-colors border border-gray-200 hover:border-blue-200">
                  Bạn đang nghĩ gì? Chia sẻ với cộng đồng...
                </button>
                <button className="lg:hidden flex-shrink-0 p-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-all shadow-md">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result count */}
            {filteredPosts.length > 0 && (
              <p className="text-xs text-gray-400 px-1">
                <span className="font-semibold text-gray-600">{filteredPosts.length}</span> bài viết
                {selectedCategory !== "all" ? ` trong "${selectedCategory}"` : ""}
              </p>
            )}

            {/* Posts */}
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Empty state */}
            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Hãy là người đầu tiên chia sẻ trong danh mục này!
                </p>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200">
                  <Plus className="w-4 h-4" /> Đăng bài ngay
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POST CARD — Modern social media style
───────────────────────────────────────────────────────────── */
function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const config = CATEGORY_CONFIG[post.category] ?? CATEGORY_CONFIG["Kinh nghiệm"];

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-0.5">

      {/* ── Post Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Avatar with brand ring */}
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-2xl ring-2 ring-blue-100 shadow-sm flex-shrink-0">
              {post.avatar}
            </div>

            <div>
              {/* Name + time on same line, badge below */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm">{post.author}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>
              {/* Category badge next to name — minimal */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 border ${config.bg} ${config.text} ${config.border}`}
              >
                <span className="leading-none">{config.icon}</span>
                {post.category}
              </span>
            </div>
          </div>

          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ── Post Content ── */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Warning Banner */}
        {post.category === "Cảnh báo" && (
          <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800 mb-0.5">Thông tin cảnh báo từ cộng đồng</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Hãy cẩn thận và xác minh thông tin trước khi quyết định.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Engagement Summary ── */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white border border-white">❤</div>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[9px] text-white border border-white">👍</div>
            </div>
            <span className="ml-0.5">{likeCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{post.comments} bình luận</span>
            <span>·</span>
            <span>12 chia sẻ</span>
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/60 flex items-center justify-around">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            liked
              ? "text-red-600 bg-red-50"
              : "text-gray-500 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              liked ? "fill-red-500 text-red-500 scale-110" : "group-hover:scale-110"
            }`}
          />
          <span>{liked ? "Đã thích" : "Thích"}</span>
        </button>

        {/* Comment */}
        <button className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Bình luận</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            shared
              ? "text-green-600 bg-green-50"
              : "text-gray-500 hover:text-green-600 hover:bg-green-50"
          }`}
        >
          <Share2
            className={`w-4 h-4 transition-all ${
              shared ? "fill-green-500 text-green-500" : "group-hover:scale-110"
            }`}
          />
          <span className="hidden sm:inline">{shared ? "Đã chia sẻ!" : "Chia sẻ"}</span>
        </button>

        {/* Save */}
        <button
          onClick={() => setSaved(!saved)}
          className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            saved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 transition-all ${
              saved ? "fill-blue-500 text-blue-500 scale-110" : "group-hover:scale-110"
            }`}
          />
          <span className="hidden md:inline">{saved ? "Đã lưu" : "Lưu"}</span>
        </button>
      </div>
    </article>
  );
}