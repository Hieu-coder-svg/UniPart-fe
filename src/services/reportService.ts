import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../types/auth";

export interface ReportRequest {
  targetType: "USER" | "JOB" | "POST" | "COMMENT" | "REVIEW";
  targetId: string;
  reason: string;
  description?: string;
  evidenceUrl?: string;
}

export interface ReportUpdateRequest {
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
  adminNote?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: string;
  reporterName: string;
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  adminNote?: string;
  resolvedBy?: string;
  evidenceUrl?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string || '/api');
const TOKEN_KEY = "access_token";

class ReportService {
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

  async createReport(request: ReportRequest): Promise<ApiResponse<ReportResponse>> {
    const response = await this.api.post<ApiResponse<ReportResponse>>("/reports", request);
    return response.data;
  }

  async getMyReports(): Promise<ApiResponse<ReportResponse[]>> {
    const response = await this.api.get<ApiResponse<ReportResponse[]>>("/reports/my");
    return response.data;
  }

  async getAllReports(status?: string): Promise<ApiResponse<ReportResponse[]>> {
    const params = status ? { status } : {};
    const response = await this.api.get<ApiResponse<ReportResponse[]>>("/reports", { params });
    return response.data;
  }

  async getReportById(id: number): Promise<ApiResponse<ReportResponse>> {
    const response = await this.api.get<ApiResponse<ReportResponse>>(`/reports/${id}`);
    return response.data;
  }

  async updateReport(id: number, request: ReportUpdateRequest): Promise<ApiResponse<ReportResponse>> {
    const response = await this.api.put<ApiResponse<ReportResponse>>(`/reports/${id}`, request);
    return response.data;
  }
}

export const reportService = new ReportService();
