import axios, { AxiosInstance } from "axios";
import { ApiResponse, Comment, CommentRequest } from "../types/post";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "access_token";

class CommentService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.message) {
          return Promise.reject(new Error(error.response.data.message));
        }
        return Promise.reject(error);
      }
    );
  }

  async getCommentsByPost(postId: number): Promise<ApiResponse<Comment[]>> {
    const response = await this.api.get<ApiResponse<Comment[]>>(`/comments/post/${postId}`);
    return response.data;
  }

  async createComment(request: CommentRequest): Promise<ApiResponse<Comment>> {
    const response = await this.api.post<ApiResponse<Comment>>("/comments", request);
    return response.data;
  }

  async updateComment(id: number, content: string): Promise<ApiResponse<Comment>> {
    const response = await this.api.put<ApiResponse<Comment>>(`/comments/${id}`, { content });
    return response.data;
  }

  async deleteComment(id: number): Promise<ApiResponse<string>> {
    const response = await this.api.delete<ApiResponse<string>>(`/comments/${id}`);
    return response.data;
  }
}

export const commentService = new CommentService();
