import { useState } from "react";
import {
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  Trash2,
  Star,
  Briefcase,
  MessageSquare,
  Calendar,
  Filter,
  SortDesc,
  ExternalLink,
  Heart,
} from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type TabType = "jobs" | "posts";

export default function SavedJobs() {
  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [sortBy, setSortBy] = useState("recent");

  const savedJobs = [
    {
      id: "1",
      title: "Nhân viên bán hàng",
      company: "H&M",
      logo: "👔",
      image: "https://images.unsplash.com/photo-1707141784065-493c0f7dc953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBjbG90aGluZyUyMHN0b3JlfGVufDF8fHx8MTc3MzY2NTU2OXww&ixlib=rb-4.1.0&q=80&w=1080",
      location: "Quận 1, TP.HCM",
      salary: "30,000đ/giờ",
      shift: "Ca chiều",
      rating: 4.5,
      reviews: 234,
      savedDate: "2024-03-11",
      savedTime: "2 ngày trước",
      urgent: false,
      category: "Bán lẻ",
    },
    {
      id: "2",
      title: "Phụ bếp",
      company: "Món Huế",
      logo: "🍜",
      image: "https://images.unsplash.com/photo-1584531762699-81c8ccbfee40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwcmVzdGF1cmFudCUyMGtpdGNoZW58ZW58MXx8fHwxNzczNzYxMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      location: "Quận 5, TP.HCM",
      salary: "28,000đ/giờ",
      shift: "Ca tối",
      rating: 4.2,
      reviews: 89,
      savedDate: "2024-03-08",
      savedTime: "5 ngày trước",
      urgent: true,
      category: "Nhà hàng",
    },
    {
      id: "3",
      title: "Gia sư Toán",
      company: "Trung tâm Gia sư Ánh Sao",
      logo: "📚",
      image: "https://images.unsplash.com/photo-1758685733940-b1c11d04f553?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoJTIwdHV0b3IlMjBzdHVkZW50fGVufDF8fHx8MTc3Mzc2MTIzMXww&ixlib=rb-4.1.0&q=80&w=1080",
      location: "Quận 10, TP.HCM",
      salary: "50,000đ/giờ",
      shift: "Linh hoạt",
      rating: 4.8,
      reviews: 156,
      savedDate: "2024-03-06",
      savedTime: "1 tuần trước",
      urgent: false,
      category: "Giáo dục",
    },
  ];

  const savedPosts = [
    {
      id: "1",
      author: "Nguyễn Văn A",
      avatar: "👨‍💼",
      category: "Kinh nghiệm",
      title: "Review làm việc tại Highlands Coffee - Chi nhánh Quận 1",
      preview:
        "Mình đã làm barista ở Highlands được 6 tháng, chia sẻ kinh nghiệm cho các bạn sinh viên...",
      likes: 245,
      comments: 34,
      savedDate: "2024-03-10",
      savedTime: "3 ngày trước",
    },
    {
      id: "2",
      author: "Trần Thị B",
      avatar: "👩‍🎓",
      category: "Cảnh báo",
      title: "Cảnh báo công ty lừa đảo - Công ty TNHH ABC",
      preview:
        "Cảnh báo các bạn tránh xa công ty này, họ yêu cầu đặt cọc tiền và không trả lương...",
      likes: 567,
      comments: 89,
      savedDate: "2024-03-09",
      savedTime: "4 ngày trước",
    },
    {
      id: "3",
      author: "Lê Minh C",
      avatar: "🧑‍💻",
      category: "Mẹo",
      title: "10 mẹo để vượt qua phỏng vấn việc làm part-time",
      preview:
        "Sau nhiều lần phỏng vấn, mình rút ra được một số kinh nghiệm hữu ích muốn chia sẻ...",
      likes: 432,
      comments: 56,
      savedDate: "2024-03-07",
      savedTime: "6 ngày trước",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bookmark className="w-8 h-8" />
                <h1 className="text-3xl md:text-4xl">Đã lưu</h1>
              </div>
              <p className="text-blue-100 text-lg">
                {activeTab === "jobs"
                  ? `${savedJobs.length} công việc đã lưu`
                  : `${savedPosts.length} bài viết đã lưu`}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "jobs"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Việc làm ({savedJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "posts"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Bài viết ({savedPosts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Lọc</span>
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm font-medium cursor-pointer hover:shadow-md transition-all"
            >
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="salary">Lương cao nhất</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {activeTab === "jobs"
              ? `Tìm thấy ${savedJobs.length} kết quả`
              : `Tìm thấy ${savedPosts.length} kết quả`}
          </div>
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <>
            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedJobs.map((job) => (
                  <SavedJobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState type="jobs" />
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <>
            {savedPosts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedPosts.map((post) => (
                  <SavedPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState type="posts" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SavedJobCard({ job }: { job: any }) {
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group">
      {/* Job Image */}
      {job.image && (
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={job.image}
            alt={job.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={() => setRemoved(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 rounded-lg transition-all shadow-sm z-10"
            title="Xóa khỏi danh sách"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card Content */}
      <div className="p-5">
        {/* Job Header */}
        <div className="mb-4">
          <Link
            to={`/jobs/${job.id}`}
            className="block hover:text-blue-600 transition-colors mb-2 group"
          >
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600">
              {job.title}
            </h3>
          </Link>
          <p className="text-gray-600 truncate">{job.company}</p>
        </div>

        {/* Job Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{job.shift}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>
              {job.rating} ({job.reviews} đánh giá)
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
            {job.category}
          </span>
          {job.urgent && (
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
              TUYỂN GẤP
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Đã lưu {job.savedTime}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/jobs/${job.id}`}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium text-sm"
            >
              Ứng tuyển ngay
            </Link>
            <Link
              to={`/jobs/${job.id}`}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Xem chi tiết"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedPostCard({ post }: { post: any }) {
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const categoryConfig: Record<string, { bg: string; text: string; icon: string }> = {
    "Kinh nghiệm": { bg: "bg-blue-50", text: "text-blue-700", icon: "💼" },
    "Cảnh báo": { bg: "bg-red-50", text: "text-red-700", icon: "⚠️" },
    Mẹo: { bg: "bg-green-50", text: "text-green-700", icon: "💡" },
    "Hỏi đáp": { bg: "bg-purple-50", text: "text-purple-700", icon: "❓" },
  };

  const config = categoryConfig[post.category] || categoryConfig["Kinh nghiệm"];

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
      <div className="p-5">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 mb-1">
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}
                >
                  <span>{config.icon}</span>
                  {post.category}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRemoved(true)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Xóa khỏi danh sách"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <Link
          to={`/community`}
          className="block hover:text-blue-600 transition-colors mb-3"
        >
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{post.preview}</p>
        </Link>

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Đã lưu {post.savedTime}</span>
            </div>
            <Link
              to={`/community`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem bài viết
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: "jobs" | "posts" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-16 text-center">
      <div className="max-w-md mx-auto">
        <Bookmark className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">
          {type === "jobs" ? "Chưa có công việc đã lưu" : "Chưa có bài viết đã lưu"}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {type === "jobs"
            ? "Lưu các công việc yêu thích để dễ dàng theo dõi và ứng tuyển sau. Nhấn vào icon bookmark ở các công việc bạn quan tâm."
            : "Lưu các bài viết hữu ích từ cộng đồng để xem lại sau. Nhấn vào icon bookmark ở các bài viết bạn thấy hay."}
        </p>
        <Link
          to={type === "jobs" ? "/jobs" : "/community"}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {type === "jobs" ? (
            <>
              <Briefcase className="w-5 h-5" />
              Khám phá việc làm
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              Ghé thăm cộng đồng
            </>
          )}
        </Link>
      </div>
    </div>
  );
}