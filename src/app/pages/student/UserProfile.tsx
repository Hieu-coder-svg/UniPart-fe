import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Loader2,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Grid3X3,
  UserCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { postService } from "../../../services/postService";
import { userService, StudentResponse } from "../../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { Post } from "../../../types/post";
import { PostCard, PostDetailModal } from "./Community";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const CATEGORY_ID_MAP: Record<string, string> = {
  1: "Kinh nghiệm",
  2: "Cảnh báo",
  3: "Mẹo",
  4: "Hỏi đáp",
};

function formatDate(dateString: string) {
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
}

function getCategoryName(categoryId: number) {
  return CATEGORY_ID_MAP[String(categoryId)] || "Không phân loại";
}

function getAvatar(avatar?: string) {
  return avatar || "👤";
}

function formatJoinDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({
  value,
  label,
  icon,
  color,
}: {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 gap-1 flex-1 min-w-[90px]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${color}`}>
        {icon}
      </div>
      <span className="text-xl font-extrabold text-gray-900 leading-tight">{value}</span>
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<StudentResponse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [tab, setTab] = useState<"posts" | "about">("posts");
  // Fallback info from posts when profile API unavailable
  const [postAuthorName, setPostAuthorName] = useState<string | null>(null);
  const [postAuthorAvatar, setPostAuthorAvatar] = useState<string | undefined>(undefined);
  const [selectedPostForComment, setSelectedPostForComment] = useState<Post | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await userService.getStudentById(userId!);
      if (res.result) {
        setProfile(res.result);
      }
    } catch {
      // API might not allow viewing other users — silent fail, use post data as fallback
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchUserPosts = async () => {
    setIsLoadingPosts(true);
    try {
      // Use GET /posts/user/{userId} — the correct backend endpoint
      const res = await postService.getPostsByUser(userId!, 0, 100);
      if (res.result?.content) {
        const content = res.result.content;
        setPosts(content);
        setTotalPosts(res.result.totalElements || content.length);
        const likes = content.reduce((sum, p) => sum + (p.likesCount || 0), 0);
        setTotalLikes(likes);
        if (content.length > 0) {
          setPostAuthorName(content[0].authorName);
          setPostAuthorAvatar(content[0].authorAvatar);
        }
      }
    } catch {
      toast.error("Không thể tải bài viết");
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLikePost = useCallback(async (postId: number, isLiked: boolean) => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để thích bài viết!");
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !isLiked, likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1 }
          : post
      )
    );
    try {
      const response = await postService.likePost(postId);
      if (response.result) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isLiked: response.result!.liked, likesCount: response.result!.likesCount }
              : post
          )
        );
      }
    } catch (error: any) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: isLiked, likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1 }
            : post
        )
      );
      toast.error(error.message || "Không thể thích bài viết");
    }
  }, [currentUser]);

  const handleSharePost = useCallback(async (postId: number) => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để chia sẻ!");
      return;
    }
    try {
      const response = await postService.sharePost(postId);
      if (response.result) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, sharesCount: response.result!.sharesCount } : post
          )
        );
        toast.success("Đã chia sẻ bài viết!");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể chia sẻ bài viết");
    }
  }, [currentUser]);

  const isOwnProfile = currentUser?.id === userId || currentUser?.userId === userId;

  // Display name: prefer profile API result, fallback to post author name
  const displayName = profile?.fullName || postAuthorName || "Người dùng";
  const displayAvatar = profile?.avatar || postAuthorAvatar;

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans pb-16">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            {isLoadingProfile && !postAuthorName ? (
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className="font-bold text-gray-900 text-sm truncate">
                {displayName}
              </span>
            )}
            <p className="text-[11px] text-gray-400">{totalPosts} bài viết</p>
          </div>
          <Link
            to="/community"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Cộng đồng
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {isOwnProfile && (
              <Link
                to="/profile"
                className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors"
              >
                Chỉnh sửa hồ sơ
              </Link>
            )}
          </div>

          {/* Avatar + Info */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-8 mb-4 relative z-10">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-4xl flex-shrink-0">
                {isLoadingProfile && !displayAvatar ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
            </div>

            {isLoadingProfile && !postAuthorName ? (
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">
                  {displayName}
                </h1>
                {profile?.bio && (
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{profile.bio}</p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-2">
                  {profile?.university && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      {profile.university}
                    </span>
                  )}
                  {profile?.major && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-violet-500" />
                      {profile.major}
                    </span>
                  )}
                  {profile?.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                      {profile.address}
                    </span>
                  )}
                  {profile?.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Tham gia {formatJoinDate(profile.createdAt)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="px-5 pb-5">
            <div className="flex gap-3">
              <StatCard
                value={totalPosts}
                label="Bài viết"
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                value={totalLikes}
                label="Lượt thích"
                icon={<Heart className="w-4 h-4 text-red-500" />}
                color="bg-red-50"
              />
              <StatCard
                value={posts.reduce((s, p) => s + (p.commentsCount || 0), 0)}
                label="Bình luận"
                icon={<MessageCircle className="w-4 h-4 text-green-600" />}
                color="bg-green-50"
              />
              <StatCard
                value={posts.reduce((s, p) => s + (p.sharesCount || 0), 0)}
                label="Chia sẻ"
                icon={<Share2 className="w-4 h-4 text-violet-600" />}
                color="bg-violet-50"
              />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab("posts")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                tab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Bài viết ({totalPosts})
            </button>
            <button
              onClick={() => setTab("about")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                tab === "about"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <UserCircle2 className="w-4 h-4" />
              Giới thiệu
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {tab === "posts" && (
          <div className="space-y-4">
            {isLoadingPosts && (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-gray-500 text-sm">Đang tải bài viết...</p>
              </div>
            )}

            {!isLoadingPosts && posts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500 text-sm">
                  {isOwnProfile
                    ? "Bạn chưa đăng bài viết nào. Hãy chia sẻ kinh nghiệm!"
                    : "Người dùng này chưa đăng bài viết nào."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/community"
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200"
                  >
                    Đến trang cộng đồng
                  </Link>
                )}
              </div>
            )}

            {!isLoadingPosts &&
              posts.map((post) => (
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
          </div>
        )}

        {tab === "about" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            {isLoadingProfile ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                ))}
              </div>
            ) : profile ? (
              <>
                <Section label="Họ và tên" value={profile.fullName} />
                <Section label="Trường đại học" value={profile.university} />
                <Section label="Ngành học" value={profile.major} />
                <Section label="Địa chỉ" value={profile.address} />
                <Section label="Giới tính" value={profile.gender} />
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kỹ năng</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kinh nghiệm</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{profile.experience}</p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Giới thiệu bản thân</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Không tìm thấy thông tin.</p>
            )}
          </div>
        )}
      </div>

      {/* Post Detail Modal for Comments */}
      {selectedPostForComment && (
        <PostDetailModal
          post={selectedPostForComment}
          onClose={() => setSelectedPostForComment(null)}
          onLike={handleLikePost}
          onShare={handleSharePost}
          formatDate={formatDate}
          getCategoryName={getCategoryName}
          getAvatar={getAvatar}
        />
      )}
    </div>
  );
}

function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}
