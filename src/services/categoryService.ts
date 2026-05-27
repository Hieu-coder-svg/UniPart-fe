import axios, { AxiosInstance } from "axios";
import { Category } from "../types/post";

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

const API_BASE_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "access_token";

class CategoryService {
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

  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  }

  async createCategory(categoryName: string, description?: string): Promise<ApiResponse<Category>> {
    const response = await this.api.post<ApiResponse<Category>>("/categories", {
      categoryName,
      description,
    });
    return response.data;
  }

  async updateCategory(id: number, categoryName: string, description?: string): Promise<ApiResponse<Category>> {
    const response = await this.api.put<ApiResponse<Category>>(`/categories/${id}`, {
      categoryName,
      description,
    });
    return response.data;
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  }
}

export const categoryService = new CategoryService();
