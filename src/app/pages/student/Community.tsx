import { useState, useEffect, useCallback, useMemo } from "react";
import { Link as RouterLink, useSearchParams, Navigate } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  AlertTriangle,
  TrendingUp,
  Award,
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
  ExternalLink,
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
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export const getCategoryColorConfig = (index: number | string) => {
  const configs = [
    { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "💼", dot: "bg-blue-500", activeColor: "bg-blue-600 text-white shadow-md shadow-blue-200", idleColor: "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-md" },
    { bg: "bg-red-50",  text: "text-red-700",  border: "border-red-200",  icon: "⚠️", dot: "bg-red-500", activeColor: "bg-red-500 text-white shadow-md shadow-red-200", idleColor: "bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-md" },
    { bg: "bg-amber-50", text: "text-amber-700",border: "border-amber-200",icon: "💡", dot: "bg-amber-500", activeColor: "bg-amber-500 text-white shadow-md shadow-amber-200", idleColor: "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-md" },
    { bg: "bg-violet-50",text: "text-violet-700",border:"border-violet-200",icon: "❓",dot: "bg-violet-500", activeColor: "bg-violet-600 text-white shadow-md shadow-violet-200", idleColor: "bg-violet-50 text-violet-700 hover:bg-violet-100 hover:shadow-md" },
    { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "🌱", dot: "bg-green-500", activeColor: "bg-green-600 text-white shadow-md shadow-green-200", idleColor: "bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md" },
    { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", icon: "✨", dot: "bg-pink-500", activeColor: "bg-pink-600 text-white shadow-md shadow-pink-200", idleColor: "bg-pink-50 text-pink-700 hover:bg-pink-100 hover:shadow-md" },
  ];
  let numIndex = 0;
  if (typeof index === 'string') {
    let hash = 0;
    for (let i = 0; i < index.length; i++) {
      hash = index.charCodeAt(i) + ((hash << 5) - hash);
    }
    numIndex = Math.abs(hash);
  } else {
    numIndex = index;
  }
  return configs[numIndex % configs.length];
};

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "trending">("newest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategories, setNewPostCategories] = useState<number[]>([]);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // All posts (full page) used to compute sidebar stats
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  // Post detail modal state
  const [selectedPostForComment, setSelectedPostForComment] = useState<Post | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Note: Employers can view but not post or comment. 
  // We handle UI restrictions below based on user.role === "EMPLOYER"
  
  useEffect(() => {
    const postIdStr = searchParams.get("postId");
    if (postIdStr) {
      const pId = parseInt(postIdStr, 10);
      if (!isNaN(pId)) {
        postService.getPostById(pId)
          .then(res => {
            if (res?.result) {
              // Populate category names similar to socket broadcast
              const postData = {
                ...res.result,
                categoryNames: res.result.categoryNames || [res.result.categoryName || "Không phân loại"]
              };
              setSelectedPostForComment(postData);
            }
          })
          .catch(err => console.error("Error loading shared post:", err));
      }
    }
  }, [searchParams.get("postId")]);

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
        authorAvatar: msg.authorAvatar,
        content: msg.contentPreview,
        categoryId: 0,
        categoryName: msg.categoryName,
        categoryNames: msg.categoryNames || [msg.categoryName],
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
      const [categoriesRes, postsRes, allPostsRes] = await Promise.all([
        postService.getCategories(),
        postService.getAllPosts({ page: 0, size: 1000 }),
        postService.getAllPosts({ page: 0, size: 1000 }),
      ]);

      if (categoriesRes.result) {
        setCategories(categoriesRes.result);
      }

      if (postsRes.result?.content) {
        setPosts(postsRes.result.content);
      }

      if (allPostsRes.result?.content) {
        setAllPosts(allPostsRes.result.content);
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
        size: 1000,
      };

      if (selectedCategory !== "all") {
        request.categoryId = selectedCategory;
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
    
    const contentText = newPostContent.trim();
    if (contentText.length < 20) {
      toast.error("Nội dung bài viết quá ngắn. Vui lòng nhập ít nhất 20 ký tự để chia sẻ chi tiết hơn nhé!");
      return;
    }
    
    if (/^(.)\1{10,}$/.test(contentText.replace(/\s/g, ''))) {
      toast.error("Nội dung có vẻ là spam (chứa nhiều ký tự lặp lại vô nghĩa). Vui lòng nhập nội dung có ý nghĩa hơn.");
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryIds = newPostCategories.length > 0
        ? newPostCategories
        : categories.length > 0 ? [categories[0].id] : [1];
      const request: PostCreationRequest = {
        categoryIds,
        content: newPostContent.trim(),
        imageUrl: newPostImage || undefined,
      };

      // REST API will persist and backend broadcasts via WebSocket
      const response = await postService.createPost(request);
      
      if (response.result) {
        // Ensure author info is displayed immediately
        const postWithUserInfo = {
          ...response.result,
          authorName: response.result.authorName || user?.fullName || user?.name || "Người dùng",
          authorAvatar: response.result.authorAvatar || user?.avatar,
        };
        setPosts((prev) => [postWithUserInfo, ...prev]);
      }

      toast.success("Đăng bài thành công!");
      setNewPostContent("");
      setNewPostCategories([]);
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
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.categoryName : "Không phân loại";
  };

  const getAvatar = (avatar?: string) => {
    return avatar || "👤";
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (sortBy === "trending") {
      result.sort((a, b) => {
        const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) * 2;
        const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) * 2;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      // Default to newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [posts, sortBy]);

  // ── Computed sidebar data from real posts ──
  const trendingTopics = useMemo(() => {
    // Group by categoryName and count, use as "trending topics"
    const counts: Record<string, number> = {};
    allPosts.forEach((p) => {
      const cat = p.categoryName || getCategoryName(p.categoryId);
      if (cat && cat !== "Không phân loại") {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    const ICONS: Record<string, string> = {
      "Kinh nghiệm": "💼", "Cảnh báo": "🚨", "Mẹo": "💡", "Hỏi đáp": "❓",
    };
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count, icon: ICONS[title] || "📌" }));
  }, [allPosts]);

  const topMembers = useMemo(() => {
    const map: Record<string, { name: string; avatar?: string; userId: string; postCount: number; likeCount: number }> = {};
    allPosts.forEach((p) => {
      if (!p.userId) return;
      if (!map[p.userId]) {
        map[p.userId] = { name: p.authorName, avatar: p.authorAvatar, userId: p.userId, postCount: 0, likeCount: 0 };
      }
      map[p.userId].postCount += 1;
      map[p.userId].likeCount += p.likesCount || 0;
    });
    const BADGES = ["🥇", "🥈", "🥉"];
    return Object.values(map)
      .sort((a, b) => b.postCount - a.postCount || b.likeCount - a.likeCount)
      .slice(0, 3)
      .map((m, i) => ({ ...m, badge: BADGES[i] }));
  }, [allPosts]);

  const popularTags = useMemo(() => {
    // Use real category names as tags
    const cats = Array.from(new Set(allPosts.map((p) => p.categoryName || getCategoryName(p.categoryId)).filter(Boolean)));
    return cats.map((c) => `#${c.toLowerCase().replace(/\s+/g, "")}`);
  }, [allPosts]);


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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-xl ring-2 ring-blue-100 flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{user?.fullName || user?.name || "Bạn"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((cat, index) => {
                      const config = getCategoryColorConfig(index);
                      const isSelected = newPostCategories.includes(cat.id) || (!newPostCategories.length && index === 0);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (newPostCategories.includes(cat.id)) {
                              setNewPostCategories(newPostCategories.filter(id => id !== cat.id));
                            } else {
                              setNewPostCategories([...newPostCategories, cat.id]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            isSelected
                              ? config.activeColor
                              : config.idleColor
                          }`}
                        >
                          {config.icon} {cat.categoryName}
                        </button>
                      );
                    })}
                  </div>
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
          POST DETAIL MODAL (Facebook-style)
      ═══════════════════════════════════════════════ */}
      {selectedPostForComment && (
        <PostDetailModal
          post={selectedPostForComment}
          onClose={() => {
            setSelectedPostForComment(null);
            if (searchParams.has("postId")) {
              searchParams.delete("postId");
              setSearchParams(searchParams);
            }
          }}
          onLike={handleLikePost}
          onShare={handleSharePost}
          onCommentAdd={(postId) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
              )
            );
          }}
          formatDate={formatDate}
          getCategoryName={getCategoryName}
          getAvatar={getAvatar}
        />
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

              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "trending")}
                  className="bg-transparent text-sm text-gray-700 font-medium outline-none cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="trending">Thịnh hành</option>
                </select>
              </div>

              {user?.role !== "EMPLOYER" && (
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
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border border-transparent ${
                selectedCategory === "all" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <span className="text-base leading-none">🌐</span>
              Tất cả
            </button>
            {categories.map((cat, index) => {
              const isActive = selectedCategory === cat.id;
              const config = getCategoryColorConfig(index);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border border-transparent ${
                    isActive ? config.activeColor : config.idleColor
                  }`}
                >
                  <span className="text-base leading-none">{config.icon}</span>
                  {cat.categoryName}
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
                {trendingTopics.length > 0 ? trendingTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(topic.title)}
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
                )) : (
                  <p className="text-xs text-gray-400 text-center py-3">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">Top thành viên năng động</h3>
              </div>

              <div className="space-y-2">
                {topMembers.length > 0 ? topMembers.map((member, idx) => (
                  <RouterLink
                    key={member.userId}
                    to={`/community/user/${member.userId}`}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg ring-2 ring-white shadow-sm overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <span className="absolute -top-1 -right-1 text-sm leading-none">{member.badge}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {member.name}
                        </p>
                        {idx === 0 && (
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Top 1</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-medium text-blue-600">{member.likeCount * 5 + member.postCount * 10} điểm uy tín</span> · {member.postCount} bài viết
                      </p>
                    </div>

                    {idx === 0 && (
                      <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </RouterLink>
                )) : (
                  <p className="text-xs text-gray-400 text-center py-3">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-gray-800 text-sm">Tag phổ biến</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.length > 0 ? popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedCategory(tag.replace("#", "").replace(/ề/g, "ề").replace(/ọ/g, "ọ"))}
                    className="text-xs text-gray-500 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors font-medium"
                  >
                    {tag}
                  </button>
                )) : (
                  <p className="text-xs text-gray-400">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </aside>


          {/* ── MAIN FEED ── */}
          <main className="lg:col-span-2 space-y-5">
            {/* Create Post prompt - hidden for Employer */}
            {user?.role !== "EMPLOYER" && (
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-xl ring-2 ring-blue-100 flex-shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      "👤"
                    )}
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
            )}

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
                key={post.id}
                post={post}
                onLike={handleLikePost}
                onShare={handleSharePost}
                formatDate={formatDate}
                getCategoryName={getCategoryName}
                getAvatar={getAvatar}
                onOpenComments={(p) => setSelectedPostForComment(p)}
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
  onOpenComments?: (post: Post) => void;
}

export function PostCard({ post, onLike, onShare, formatDate, getCategoryName, getAvatar, onOpenComments }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [shared, setShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();

  // Sync like state when post prop changes (e.g., after refetch)
  useEffect(() => {
    setLiked(post.isLiked ?? post.isLikedByMe ?? false);
    setLikeCount(post.likesCount);
  }, [post.isLiked, post.isLikedByMe, post.likesCount]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportEvidence, setReportEvidence] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const categoryName = getCategoryName(post.categoryId);
  const config = getCategoryColorConfig(categoryName);

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
    const postUrl = `${window.location.origin}/community?postId=${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Đã copy link!");
  };

  const handleFacebookShare = () => {
    const postUrl = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`, "_blank");
  };

  const handleReportSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để báo cáo!");
      return;
    }
    if (!reportCategory) {
      toast.error("Vui lòng chọn lý do báo cáo!");
      return;
    }
    if (reportCategory === "Khác" && !reportReason.trim()) {
      toast.error("Vui lòng nhập chi tiết lý do báo cáo!");
      return;
    }
    const isEvidenceRequired = reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí");
    if (isEvidenceRequired && !reportEvidence) {
      toast.error("Vui lòng tải lên ảnh minh chứng (tin nhắn, ảnh chụp màn hình) cho lý do này!");
      return;
    }
    setIsSubmittingReport(true);
    try {
      const finalReason = reportCategory === "Khác" ? `Khác: ${reportReason.trim()}` : (reportReason.trim() ? `${reportCategory} - ${reportReason.trim()}` : reportCategory);
      const request: ReportRequest = {
        targetType: "POST",
        targetId: post.id.toString(),
        reason: finalReason,
        evidenceUrl: reportEvidence || undefined,
      };
      await reportService.createReport(request);
      toast.success("Cảm ơn bạn! Chúng tôi đã tiếp nhận báo cáo và sẽ xử lý trong vòng 24-48 giờ.");
      setShowReportModal(false);
      setReportCategory("");
      setReportReason("");
      setReportEvidence(null);
    } catch (error: any) {
      toast.error(error.message || "Báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-0.5">
      {/* ── Post Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-2xl ring-2 ring-blue-100 shadow-sm flex-shrink-0 overflow-hidden">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <RouterLink
                  to={`/community/user/${post.userId}`}
                  className="font-bold text-gray-900 text-sm hover:text-blue-600 hover:underline transition-colors"
                >
                  {post.authorName}
                </RouterLink>
                <span className="ml-1 bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-100">
                  <Award className="w-3 h-3" /> Sinh viên
                </span>
                <span className="text-gray-300 text-xs ml-1">·</span>
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(post.categoryNames || [categoryName]).map((cat, idx) => {
                  const catConfig = getCategoryColorConfig(cat);
                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
                    >
                      <span className="leading-none">{catConfig.icon}</span>
                      {cat}
                    </span>
                  );
                })}
              </div>
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
            <button onClick={() => onOpenComments?.(post)} className="hover:text-blue-600 transition-colors">
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
            className={`w-4 h-4 transition-all duration-300 ${
              liked ? "fill-red-500 text-red-500 scale-110 animate-[pulse_0.5s_ease-in-out]" : "group-hover:scale-110"
            }`}
          />
          <span>{liked ? "Đã thích" : "Thích"}</span>
        </button>

        {user?.role !== "EMPLOYER" && (
          <button
            onClick={() => onOpenComments?.(post)}
            className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Bình luận</span>
          </button>
        )}

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
      </div>
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
              <button onClick={() => {
                setShowReportModal(false);
                setReportCategory("");
                setReportReason("");
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng chọn lý do bạn muốn báo cáo bài viết này. Quản trị viên sẽ xem xét và xử lý.
            </p>

            <div className="mb-4 space-y-2">
              {[
                "Nội dung phản cảm / độc hại",
                "Ngôn từ kích động / quấy rối",
                "Spam / Quảng cáo rác",
                "Khác"
              ].map((category) => (
                <label key={category} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="radio"
                    name={`reportCategory-${post.id}`}
                    value={category}
                    checked={reportCategory === category}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">{category}</span>
                </label>
              ))}
            </div>

            {reportCategory === "Khác" && (
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Nhập chi tiết lý do báo cáo..."
                className="w-full border border-gray-300 rounded-lg p-3 h-24 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
              />
            )}
            
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
                Tải ảnh minh chứng {(reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí")) && <span className="text-red-500">*</span>}
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

            <div className="mt-4 mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">
                <span className="font-semibold">Lưu ý:</span> Hành vi cố tình báo cáo sai sự thật nhiều lần có thể dẫn đến việc tài khoản của bạn bị hạn chế.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportCategory("");
                  setReportReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={isSubmittingReport || !reportCategory || (reportCategory === "Khác" && !reportReason.trim()) || ((reportCategory.toLowerCase().includes("lừa đảo") || reportCategory.toLowerCase().includes("đóng phí")) && !reportEvidence)}
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
  onCommentAdd?: () => void;
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
  onCommentAdd,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const maxDepth = 2; // Limit nesting depth
  const { user } = useAuth();

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
        if (onCommentAdd) onCommentAdd();
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
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
        {comment.authorAvatar ? (
          <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
        ) : (
          <span>👤</span>
        )}
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
        {user?.role !== "EMPLOYER" && (
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-blue-500 hover:text-blue-600 mt-2 font-medium"
          >
            {showReplyInput ? "Hủy" : "Trả lời"}
          </button>
        )}

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
                onCommentAdd={onCommentAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POST DETAIL MODAL (Facebook-style)
───────────────────────────────────────────────────────────── */
interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onLike: (postId: number, isLiked: boolean) => void;
  onShare: (postId: number) => void;
  onCommentAdd?: (postId: number) => void;
  formatDate: (date: string) => string;
  getCategoryName: (categoryId: number) => string;
  getAvatar: (avatar?: string) => string;
}

export function PostDetailModal({ post, onClose, onLike, onShare, onCommentAdd, formatDate, getCategoryName, getAvatar }: PostDetailModalProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked ?? post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "all">("all");

  // Disable body scroll when modal opens
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

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

  const handleLike = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết!");
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike(post.id, liked);
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
        // Add user info to comment if not provided by backend
        const newCommentWithUser = {
          ...response.result,
          authorName: response.result.authorName || user.fullName || "Người dùng",
          authorAvatar: response.result.authorAvatar || user.avatar,
        };
        setComments((prev) => [newCommentWithUser, ...prev]);
        setNewComment("");
        setCommentImage(null);
        if (onCommentAdd) onCommentAdd(post.id);
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

  const categoryName = getCategoryName(post.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Bài viết</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Author & Content */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <RouterLink
                to={`/community/user/${post.userId}`}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-xl flex-shrink-0 overflow-hidden ring-2 ring-blue-100 shadow-sm"
              >
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </RouterLink>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <RouterLink
                    to={`/community/user/${post.userId}`}
                    className="font-bold text-gray-900 text-base hover:text-blue-600 hover:underline"
                  >
                    {post.authorName}
                  </RouterLink>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(post.categoryNames || [categoryName]).map((cat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 border border-blue-100"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mt-4">
              <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="mt-4 w-full rounded-xl object-cover max-h-[400px]"
                />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
              <span>{likeCount} lượt thích</span>
              <span>{comments.length} bình luận</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-around py-2 border-b border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                liked ? "text-red-500 bg-red-50" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
              <span className="text-sm font-medium">{liked ? "Đã thích" : "Thích"}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Bình luận</span>
            </button>

            <button
              onClick={() => onShare(post.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Chia sẻ</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="p-4 bg-gray-50/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Bình luận ({comments.length})
              </h3>
              
              <div className="relative group">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "newest" | "all")}
                  className="appearance-none bg-transparent text-sm font-semibold text-gray-600 group-hover:text-gray-900 cursor-pointer pr-4 focus:outline-none transition-colors"
                >
                  <option value="all">Tất cả bình luận</option>
                  <option value="newest">Mới nhất</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                  <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            {user?.role !== "EMPLOYER" && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
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
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
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
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments
                  .filter((c) => !c.parentCommentId)
                  .sort((a, b) => {
                    const timeA = new Date(a.createdAt).getTime();
                    const timeB = new Date(b.createdAt).getTime();
                    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
                  })
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      comments={comments}
                      setComments={setComments}
                      formatDate={formatDate}
                      getAvatar={getAvatar}
                      depth={0}
                      isSubmitting={isSubmittingComment}
                      setIsSubmitting={setIsSubmittingComment}
                      onCommentAdd={() => onCommentAdd?.(post.id)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
