import { ApiResponse } from "./auth";

export interface Category {
  id: number;
  categoryName: string;
  description?: string;
}

export interface Post {
  id: number;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  categoryId: number;
  categoryIds?: number[];
  categoryName?: string;
  categoryNames?: string[];
  relatedJobId?: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  parentCommentId?: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostCreationRequest {
  categoryIds: number[];
  content: string;
  relatedJobId?: number;
  imageUrl?: string;
}


export interface CommentRequest {
  postId: number;
  content: string;
  imageUrl?: string;
  parentCommentId?: number;
}

export interface PostLikeResponse {
  postId: number;
  liked: boolean;
  likesCount: number;
}

export interface PostFilterRequest {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  userId?: string;
}


export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PaginatedPostsResponse {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PostCategory = "Kinh nghiệm" | "Cảnh báo" | "Mẹo" | "Hỏi đáp";

export const CATEGORY_MAP: Record<number, PostCategory> = {
  1: "Kinh nghiệm",
  2: "Cảnh báo",
  3: "Mẹo",
  4: "Hỏi đáp",
};

export const CATEGORY_ID_MAP: Record<PostCategory, number> = {
  "Kinh nghiệm": 1,
  "Cảnh báo": 2,
  "Mẹo": 3,
  "Hỏi đáp": 4,
};
