import { useState } from "react";
import { mockPosts, type Post } from "../data/mockData";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPosts =
    selectedCategory === "all"
      ? mockPosts
      : mockPosts.filter((post) => post.category === selectedCategory);

  const categories = [
    { value: "all", label: "Tất cả", icon: "📱" },
    { value: "Kinh nghiệm", label: "Kinh nghiệm", icon: "💼" },
    { value: "Cảnh báo", label: "Cảnh báo", icon: "⚠️" },
    { value: "Mẹo", label: "Mẹo", icon: "💡" },
    { value: "Hỏi đáp", label: "Hỏi đáp", icon: "❓" },
  ];

  const trendingTopics = [
    { title: "Làm việc tại Highlands", count: 234 },
    { title: "Gia sư online", count: 189 },
    { title: "Công việc cuối tuần", count: 156 },
    { title: "Cảnh báo lừa đảo", count: 142 },
    { title: "Tips phỏng vấn", count: 98 },
  ];

  const topContributors = [
    { name: "Nguyễn Văn A", avatar: "👨‍💼", posts: 45, reputation: 1250 },
    { name: "Trần Thị B", avatar: "👩‍🎓", posts: 38, reputation: 980 },
    { name: "Lê Minh C", avatar: "🧑‍💻", posts: 32, reputation: 870 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl mb-2">Cộng đồng UniPart</h1>
              <p className="text-blue-100 text-lg">
                Nơi chia sẻ kinh nghiệm và kết nối sinh viên
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-semibold">
              <Plus className="w-5 h-5" />
              Đăng bài mới
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 mt-6">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedCategory === category.value
                    ? "bg-white text-blue-600 shadow-lg scale-105"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Stats */}
          <aside className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Chủ đề nổi bật</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {topic.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Người đóng góp nhiều</h3>
              </div>
              <div className="space-y-3">
                {topContributors.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      {idx < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.posts} bài • {user.reputation} điểm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-2 space-y-4">
            {/* Create Post Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <button className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                  Bạn đang nghĩ gì?
                </button>
                <button className="lg:hidden p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Chưa có bài viết nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Hãy là người đầu tiên chia sẻ trong danh mục này!
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Đăng bài ngay
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  const categoryConfig = {
    "Kinh nghiệm": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "💼",
    },
    "Cảnh báo": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "⚠️",
    },
    Mẹo: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "💡",
    },
    "Hỏi đáp": {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: "❓",
    },
  };

  const config = categoryConfig[post.category];

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Post Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl ring-2 ring-white">
              {post.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {post.author}
                </span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium border ${config.bg} ${config.text} ${config.border}`}
                >
                  <span>{config.icon}</span>
                  {post.category}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Warning Banner for Alert Posts */}
        {post.category === "Cảnh báo" && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">
                  Thông tin cảnh báo từ cộng đồng
                </p>
                <p className="text-xs text-red-700">
                  Hãy cẩn thận và xác minh thông tin trước khi quyết định.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                ❤️
              </div>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                👍
              </div>
            </div>
            <span className="ml-1">{likeCount}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{post.comments} bình luận</span>
            <span>12 chia sẻ</span>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-around">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
            liked
              ? "text-red-600 bg-red-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span className="text-sm">{liked ? "Đã thích" : "Thích"}</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all font-medium">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Bình luận</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all font-medium">
          <Share2 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Chia sẻ</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
            saved
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
          <span className="text-sm hidden md:inline">
            {saved ? "Đã lưu" : "Lưu"}
          </span>
        </button>
      </div>
    </article>
  );
}