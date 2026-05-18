import { useState, useEffect, useCallback, useMemo } from "react";
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
  X,
  Loader2,
  Send,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  Link,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { reportService, ReportRequest } from "../../../services/reportService";
import { postService } from "../../../services/postService";
import { commentService } from "../../../services/commentService";
import { uploadImageToCloudinary } from "../../../services/uploadService";
import { useAuth } from "../../contexts/AuthContext";
import { useCommunityWebSocket } from "../../../hooks/useCommunityWebSocket";
import {
  Post,
  Category,
  Comment,
  PostCategory,
  PostCreationRequest,
} from "../../../types/post";

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

const CATEGORY_ID_MAP: Record<PostCategory, number> = {
  "Kinh nghiệm": 1,
  "Cảnh báo": 2,
  "Mẹo": 3,
  "Hỏi đáp": 4,
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>("Kinh nghiệm");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle real-time new post from WebSocket
  const handleNewPostBroadcast = useCallback((msg: any) => {
    console.log("[CommunityWS] Received NEW_POST:", msg);

    // Prevent duplicate: don't add if post already exists in list
    setPosts((prev) => {
      if (prev.some((p) => p.id === msg.postId)) {
        console.log("[CommunityWS] Duplicate post, skipping:", msg.postId);
        return prev;
      }
      const newPost: Post = {
        id: msg.postId,
        userId: msg.authorId,
        authorName: msg.authorName,
        authorAvatar: undefined,
        content: msg.contentPreview,
        categoryId: 0,
        categoryName: msg.categoryName,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        createdAt: msg.createdAt,
        updatedAt: msg.createdAt,
      };
      console.log("[CommunityWS] Adding new post to list:", newPost.id);
      return [newPost, ...prev];
    });

    toast.success(`📝 ${msg.authorName} vừa đăng bài mới!`, {
      description: msg.contentPreview,
      duration: 4000,
    });
  }, []);

  // Handle real-time like update from WebSocket
  const handleLikeUpdate = useCallback((msg: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === msg.postId
          ? { ...post, likesCount: msg.likesCount, isLiked: msg.liked }
          : post
      )
    );
  }, []);

  // Setup WebSocket
  const { sendLike } = useCommunityWebSocket({
    onNewPost: handleNewPostBroadcast,
    onLikeUpdate: handleLikeUpdate,
  });

  // Fetch categories and posts
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch posts when category changes
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      const [categoriesRes, postsRes] = await Promise.all([
        postService.getCategories(),
        postService.getAllPosts(),
      ]);

      if (categoriesRes.result) {
        setCategories(categoriesRes.result);
      }

      if (postsRes.result?.content) {
        setPosts(postsRes.result.content);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const request: any = {
        page: 0,
        size: 20,
      };

      if (selectedCategory !== "all") {
        const categoryId = CATEGORY_ID_MAP[selectedCategory as PostCategory];
        if (categoryId) {
          request.categoryId = categoryId;
        }
      }

      if (searchQuery.trim()) {
        request.keyword = searchQuery.trim();
      }

      const response = await postService.getAllPosts(request);

      if (response.result?.content) {
        setPosts(response.result.content);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Không thể tải bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng bài!");
      return;
    }
    if (!newPostContent.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryId = CATEGORY_ID_MAP[newPostCategory];
      const request: PostCreationRequest = {
        categoryId,
        content: newPostContent.trim(),
        imageUrl: newPostImage || undefined,
      };

      // REST API will persist and backend broadcasts via WebSocket
      const response = await postService.createPost(request);
      
      if (response.result) {
        setPosts((prev) => [response.result!, ...prev]);
      }

      toast.success("Đăng bài thành công!");
      setNewPostContent("");
      setNewPostCategory("Kinh nghiệm");
      setNewPostImage(null);
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể đăng bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setNewPostImage(url);
    } catch {
      toast.error("Không thể tải ảnh lên");
    }
  };

  const handleLikePost = async (postId: number, isLiked: boolean) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết!");
      return;
    }
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );

    // Send via WebSocket for real-time broadcast
    sendLike(postId);

    // Also call REST API to persist
    try {
      const response = await postService.likePost(postId);
      if (response.result) {
        // Update with server truth
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: response.result!.liked,
                  likesCount: response.result!.likesCount,
                }
              : post
          )
        );
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: isLiked, likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1 }
            : post
        )
      );
      toast.error(error.message || "Không thể thích bài viết");
    }
  };

  const handleSharePost = async (postId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để chia sẻ!");
      return;
    }
    try {
      const response = await postService.sharePost(postId);

      if (response.result) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, sharesCount: response.result!.sharesCount }
              : post
          )
        );
        toast.success("Đã chia sẻ bài viết!");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể chia sẻ bài viết");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getCategoryName = (categoryId: number) => {
    const categoryNames: Record<number, string> = {
      1: "Kinh nghiệm",
      2: "Cảnh báo",
      3: "Mẹo",
      4: "Hỏi đáp",
    };
    return categoryNames[categoryId] || "Không phân loại";
  };

  const getAvatar = (avatar?: string) => {
    return avatar || "👤";
  };

  const filteredPosts = posts;

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">
      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Tạo bài viết mới</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-xl ring-2 ring-blue-100 flex-shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">Bạn</p>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as PostCategory)}
                    className="mt-1 text-xs bg-gray-100 border-0 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-blue-300"
                  >
                    {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng..."
                className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />

              {newPostImage && (
                <div className="relative mt-3">
                  <img
                    src={newPostImage}
                    alt="Post"
                    className="w-full max-h-64 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageSelect}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Thêm hình ảnh</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newPostContent.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          HERO — compact gradient with dot overlay
      ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
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

              <button
                onClick={() => {
                  if (!user) {
                    toast.error("Vui lòng đăng nhập để đăng bài!");
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
              >
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
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Chủ đề nổi bật</h3>
              </div>

              <div className="space-y-1">
                {[
                  { title: "Làm việc tại Highlands", count: 234, icon: "☕" },
                  { title: "Gia sư online", count: 189, icon: "📚" },
                  { title: "Công việc cuối tuần", count: 156, icon: "🗓️" },
                  { title: "Cảnh báo lừa đảo", count: 142, icon: "🚨" },
                  { title: "Tips phỏng vấn", count: 98, icon: "🎯" },
                ].map((topic, idx) => (
                  <button
                    key={idx}
                    className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 text-left"
                  >
                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100 text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-base leading-none">{topic.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors truncate">
                      {topic.title}
                    </span>
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

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Top thành viên năng động</h3>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Nguyễn Văn A", avatar: "👨‍💼", posts: 45, reputation: 1250, badge: "🥇" },
                  { name: "Trần Thị B",   avatar: "👩‍🎓", posts: 38, reputation: 980,  badge: "🥈" },
                  { name: "Lê Minh C",    avatar: "🧑‍💻", posts: 32, reputation: 870,  badge: "🥉" },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg ring-2 ring-white shadow-sm">
                        {user.avatar}
                      </div>
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

                    {idx === 0 && (
                      <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

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
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("Vui lòng đăng nhập để đăng bài!");
                      return;
                    }
                    setIsCreateModalOpen(true);
                  }}
                  className="flex-1 text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 text-sm transition-colors border border-gray-200 hover:border-blue-200"
                >
                  Bạn đang nghĩ gì? Chia sẻ với cộng đồng...
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("Vui lòng đăng nhập để đăng bài!");
                      return;
                    }
                    setIsCreateModalOpen(true);
                  }}
                  className="lg:hidden flex-shrink-0 p-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result count */}
            {!isLoading && (
              <p className="text-xs text-gray-400 px-1">
                <span className="font-semibold text-gray-600">{filteredPosts.length}</span> bài viết
                {selectedCategory !== "all" ? ` trong "${selectedCategory}"` : ""}
              </p>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-gray-500 text-sm">Đang tải bài viết...</p>
              </div>
            )}

            {/* Posts */}
            {!isLoading && filteredPosts.map((post) => (
              <PostCard
                post={post}
                onLike={handleLikePost}
                onShare={handleSharePost}
                formatDate={formatDate}
                getCategoryName={getCategoryName}
                getAvatar={getAvatar}
                key={post.id}
              />
            ))}

            {/* Empty state */}
            {!isLoading && filteredPosts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Hãy là người đầu tiên chia sẻ trong danh mục này!
                </p>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("Vui lòng đăng nhập để đăng bài!");
                      return;
                    }
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200"
                >
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
   POST CARD
───────────────────────────────────────────────────────────── */
export interface PostCardProps {
  post: Post;
  onLike: (postId: number, isLiked: boolean) => void;
  onShare: (postId: number) => void;
  formatDate: (date: string) => string;
  getCategoryName: (categoryId: number) => string;
  getAvatar: (avatar?: string) => string;
}

export function PostCard({ post, onLike, onShare, formatDate, getCategoryName, getAvatar }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  // Sync like state when post prop changes (e.g., after refetch)
  useEffect(() => {
    setLiked(post.isLiked ?? post.isLikedByMe ?? false);
    setLikeCount(post.likesCount);
  }, [post.isLiked, post.isLikedByMe, post.likesCount]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportEvidence, setReportEvidence] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const categoryName = getCategoryName(post.categoryId);
  const config = CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG["Kinh nghiệm"];

  const handleLike = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết!");
      return;
    }
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
    onLike(post.id, liked);
  };

  const handleShare = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để chia sẻ!");
      return;
    }
    setShowShareModal(true);
  };

  const handleConfirmShare = async () => {
    setShowShareModal(false);
    setShared(true);
    onShare(post.id);
    toast.success("Đã chia sẻ bài viết!");
    setTimeout(() => setShared(false), 2000);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Đã copy link!");
  };

  const handleFacebookShare = () => {
    const postUrl = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`, "_blank");
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await commentService.getCommentsByPost(post.id);
      if (response.result) {
        setComments(response.result);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleReportSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để báo cáo!");
      return;
    }
    if (!reportReason.trim()) {
      toast.error("Vui lòng nhập lý do báo cáo!");
      return;
    }
    setIsSubmittingReport(true);
    try {
      const request: ReportRequest = {
        targetType: "POST",
        targetId: post.id.toString(),
        reason: reportReason.trim(),
        evidenceUrl: reportEvidence || undefined,
      };
      await reportService.createReport(request);
      toast.success("Báo cáo thành công! Quản trị viên sẽ xem xét.");
      setShowReportModal(false);
      setReportReason("");
      setReportEvidence(null);
    } catch (error: any) {
      toast.error(error.message || "Báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim() && !commentImage) return;

    setIsSubmittingComment(true);
    try {
      const response = await commentService.createComment({
        postId: post.id,
        content: newComment.trim(),
        imageUrl: commentImage || undefined,
      });

      if (response.result) {
        setComments((prev) => [response.result!, ...prev]);
        setNewComment("");
        setCommentImage(null);
        toast.success("Đã thêm bình luận");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm bình luận");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setCommentImage(url);
    } catch {
      toast.error("Không thể tải ảnh lên");
    }
  };

  return (
    <>
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-0.5">
      {/* ── Post Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-2xl ring-2 ring-blue-100 shadow-sm flex-shrink-0">
              {getAvatar(post.authorAvatar)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm">{post.authorName}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 border ${config.bg} ${config.text} ${config.border}`}
              >
                <span className="leading-none">{config.icon}</span>
                {categoryName}
              </span>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Vui lòng đăng nhập để báo cáo!");
                        return;
                      }
                      setShowDropdown(false);
                      setShowReportModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Flag className="w-4 h-4" /> Báo cáo bài viết
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Post Content ── */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="mt-3 w-full rounded-xl object-cover max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(post.imageUrl, "_blank")}
            />
          )}
        </div>

        {/* Warning Banner */}
        {categoryName === "Cảnh báo" && (
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
            <button onClick={handleToggleComments} className="hover:text-blue-600 transition-colors">
              {post.commentsCount} bình luận
            </button>
            <span>·</span>
            <span>{post.sharesCount} chia sẻ</span>
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/60 flex items-center justify-around">
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

        <button
          onClick={handleToggleComments}
          className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            showComments ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <MessageCircle className={`w-4 h-4 group-hover:scale-110 transition-transform ${showComments ? "fill-blue-500" : ""}`} />
          <span>Bình luận</span>
        </button>

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

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/30">
          {/* Comment Input */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg flex-shrink-0">
              👤
            </div>
            <div className="flex-1">
              {commentImage && (
                <div className="relative mb-2 inline-block">
                  <img
                    src={commentImage}
                    alt="Comment"
                    className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setCommentImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  placeholder="Viết bình luận..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
                <label className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCommentImageSelect}
                    className="hidden"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                </label>
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || (!newComment.trim() && !commentImage)}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-500" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {/* Only render parent comments (no parentCommentId) */}
              {comments
                .filter((c) => !c.parentCommentId)
                .map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    comments={comments}
                    setComments={setComments}
                    formatDate={formatDate}
                    getAvatar={getAvatar}
                    isSubmitting={isSubmittingComment}
                    setIsSubmitting={setIsSubmittingComment}
                  />
                ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-4">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          )}
        </div>
      )}
    </article>

    {/* ── Share Modal ── */}
    {showShareModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Chia sẻ bài viết</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmShare}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Chia sẻ lên UniPart</p>
                  <p className="text-xs text-gray-500">Đăng lên cộng đồng</p>
                </div>
              </button>

              <button
                onClick={handleFacebookShare}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-[#1877f2] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">f</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Facebook</p>
                  <p className="text-xs text-gray-500">Chia sẻ lên Facebook</p>
                </div>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Copy Link</p>
                  <p className="text-xs text-gray-500">Sao chép liên kết bài viết</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Report Modal ── */}
    {showReportModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Báo cáo bài viết</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng cho biết lý do bạn muốn báo cáo bài viết này. Quản trị viên sẽ xem xét và xử lý.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Nhập lý do báo cáo..."
              className="w-full border border-gray-300 rounded-lg p-3 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
            />
            
            {reportEvidence && (
              <div className="relative mb-4">
                <img src={reportEvidence} alt="Bằng chứng" className="max-h-40 rounded-lg object-contain border border-gray-200" />
                <button 
                  onClick={() => setReportEvidence(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-200">
                <Upload className="w-4 h-4" />
                Tải ảnh minh chứng
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadImageToCloudinary(file);
                      setReportEvidence(url);
                    } catch (error) {
                      toast.error("Lỗi tải ảnh lên. Vui lòng thử lại.");
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={isSubmittingReport || !reportReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMMENT ITEM (Hierarchical)
───────────────────────────────────────────────────────────── */
interface CommentItemProps {
  comment: Comment;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  formatDate: (date: string) => string;
  getAvatar: (avatar?: string) => string;
  depth?: number;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

function CommentItem({
  comment,
  comments,
  setComments,
  formatDate,
  getAvatar,
  depth = 0,
  isSubmitting,
  setIsSubmitting,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const maxDepth = 2; // Limit nesting depth

  // Get replies for this comment
  const replies = useMemo(
    () => comments.filter((c) => c.parentCommentId === comment.id),
    [comments, comment.id]
  );

  const handleSubmitReply = async () => {
    if (!replyContent.trim() && !replyImage) return;

    setIsSubmittingReply(true);
    try {
      const response = await commentService.createComment({
        postId: comment.postId,
        content: replyContent.trim(),
        imageUrl: replyImage || undefined,
        parentCommentId: comment.id,
      });

      if (response.result) {
        setComments((prev) => [...prev, response.result!]);
        setReplyContent("");
        setReplyImage(null);
        setShowReplyInput(false);
        toast.success("Đã trả lời bình luận");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể trả lời bình luận");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setReplyImage(url);
    } catch {
      toast.error("Không thể tải ảnh lên");
    }
  };

  return (
    <div className={`flex items-start gap-3 ${depth > 0 ? "ml-8 pl-4 border-l-2 border-gray-100" : ""}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg flex-shrink-0">
        {getAvatar(comment.authorAvatar)}
      </div>
      <div className="flex-1 bg-white rounded-xl px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>
        {comment.content && <p className="text-sm text-gray-700">{comment.content}</p>}
        {comment.imageUrl && (
          <img
            src={comment.imageUrl}
            alt="Comment"
            className="mt-2 max-w-[250px] max-h-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(comment.imageUrl, "_blank")}
          />
        )}

        {/* Reply button */}
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-xs text-blue-500 hover:text-blue-600 mt-2 font-medium"
        >
          {showReplyInput ? "Hủy" : "Trả lời"}
        </button>

        {/* Reply input */}
        {showReplyInput && (
          <div className="flex items-center gap-2 mt-2">
            {replyImage && (
              <div className="relative">
                <img
                  src={replyImage}
                  alt="Reply"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <button
                  onClick={() => setReplyImage(null)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
              placeholder={`Trả lời ${comment.authorName}...`}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <label className="p-1.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleReplyImageSelect}
                className="hidden"
              />
              <ImageIcon className="w-3 h-3 text-gray-500" />
            </label>
            <button
              onClick={handleSubmitReply}
              disabled={isSubmittingReply || (!replyContent.trim() && !replyImage)}
              className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmittingReply ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
        )}

        {/* Render replies */}
        {replies.length > 0 && depth < maxDepth && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                comments={comments}
                setComments={setComments}
                formatDate={formatDate}
                getAvatar={getAvatar}
                depth={depth + 1}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
