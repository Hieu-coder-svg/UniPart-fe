import axios, { AxiosInstance } from "axios";
import {
  ApiResponse,
  Post,
  PostCreationRequest,
  PostLikeResponse,
  PostFilterRequest,
  Page,
  Category,
} from "../types/post";

const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "access_token";

class PostService {
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

  async getAllPosts(request?: PostFilterRequest): Promise<ApiResponse<Page<Post>>> {
    const response = await this.api.post<ApiResponse<Page<Post>>>("/posts/filter", request || {});
    return response.data;
  }

  async getPostById(id: number): Promise<ApiResponse<Post>> {
    const response = await this.api.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  }

  async getPostsByCategory(categoryId: number, page = 0, size = 10): Promise<ApiResponse<Page<Post>>> {
    const response = await this.api.post<ApiResponse<Page<Post>>>("/posts/filter", {
      categoryId,
      page,
      size,
    });
    return response.data;
  }

  async searchPosts(keyword: string, page = 0, size = 10): Promise<ApiResponse<Page<Post>>> {
    const response = await this.api.post<ApiResponse<Page<Post>>>("/posts/filter", {
      keyword,
      page,
      size,
    });
    return response.data;
  }

  async createPost(request: PostCreationRequest): Promise<ApiResponse<Post>> {
    const response = await this.api.post<ApiResponse<Post>>("/posts", request);
    return response.data;
  }

  async updatePost(id: number, content: string, categoryId?: number): Promise<ApiResponse<Post>> {
    const response = await this.api.put<ApiResponse<Post>>(`/posts/${id}`, {
      content,
      categoryId,
    });
    return response.data;
  }

  async deletePost(id: number): Promise<ApiResponse<string>> {
    const response = await this.api.delete<ApiResponse<string>>(`/posts/${id}`);
    return response.data;
  }

  async hidePost(id: number): Promise<ApiResponse<string>> {
    const response = await this.api.put<ApiResponse<string>>(`/admin/posts/${id}/hide`);
    return response.data;
  }

  async unhidePost(id: number): Promise<ApiResponse<string>> {
    const response = await this.api.put<ApiResponse<string>>(`/admin/posts/${id}/unhide`);
    return response.data;
  }

  async likePost(id: number): Promise<ApiResponse<PostLikeResponse>> {
    const response = await this.api.post<ApiResponse<PostLikeResponse>>(`/posts/${id}/like`);
    return response.data;
  }

  async sharePost(id: number): Promise<ApiResponse<{ sharesCount: number }>> {
    const response = await this.api.post<ApiResponse<{ sharesCount: number }>>(`/posts/${id}/share`);
    return response.data;
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  }

  async getTrendingTopics(): Promise<ApiResponse<{ title: string; count: number }[]>> {
    const response = await this.api.get<ApiResponse<{ title: string; count: number }[]>>("/posts/trending");
    return response.data;
  }
}

export const postService = new PostService();
