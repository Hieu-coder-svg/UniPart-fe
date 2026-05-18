import { useParams, Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { postService } from "../../../services/postService";
import { Post } from "../../../types/post";
import { PostCard } from "./Community";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCommunityWebSocket } from "../../../hooks/useCommunityWebSocket";

export default function CommunityPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-use helper functions
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

  useEffect(() => {
    if (id) {
      fetchPost(Number(id));
    }
  }, [id]);

  const fetchPost = async (postId: number) => {
    setIsLoading(true);
    try {
      const response = await postService.getPostById(postId);
      if (response.result) {
        setPost(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch post", error);
      toast.error("Không tìm thấy bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeUpdate = useCallback((msg: any) => {
    if (post && post.id === msg.postId) {
      setPost((prev) => prev ? { ...prev, likesCount: msg.likesCount, isLiked: msg.liked } : null);
    }
  }, [post]);

  const { sendLike } = useCommunityWebSocket({
    onNewPost: () => {}, // Not needed for detail page
    onLikeUpdate: handleLikeUpdate,
  });

  const handleLikePost = async (postId: number, isLiked: boolean) => {
    if (!post) return;
    
    // Optimistic update
    setPost((prev) => prev ? {
      ...prev,
      isLiked: !isLiked,
      likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    } : null);

    // Send via WebSocket for real-time broadcast
    sendLike(postId);

    try {
      const response = await postService.likePost(postId);
      if (response.result) {
        setPost((prev) => prev ? {
          ...prev,
          isLiked: response.result!.liked,
          likesCount: response.result!.likesCount,
        } : null);
      }
    } catch (error: any) {
      // Revert optimistic update
      setPost((prev) => prev ? {
        ...prev,
        isLiked: isLiked,
        likesCount: isLiked ? prev.likesCount + 1 : prev.likesCount - 1,
      } : null);
      toast.error(error.message || "Không thể thích bài viết");
    }
  };

  const handleSharePost = async (postId: number) => {
    try {
      const response = await postService.sharePost(postId);
      if (response.result) {
        setPost((prev) => prev ? { ...prev, sharesCount: response.result!.sharesCount } : null);
        toast.success("Đã chia sẻ bài viết!");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể chia sẻ bài viết");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bài viết không tồn tại</h2>
        <Link to="/community" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Về trang Cộng đồng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-20 md:pb-8 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Cộng đồng
        </Link>

        <PostCard
          post={post}
          onLike={handleLikePost}
          onShare={handleSharePost}
          formatDate={formatDate}
          getCategoryName={getCategoryName}
          getAvatar={getAvatar}
        />
      </div>
    </div>
  );
}
