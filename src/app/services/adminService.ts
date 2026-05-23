import { apiClient } from "../../services/apiClient";
import { ApiResponse } from "../types/auth";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalRequests: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface MonthlyUser {
  month: string;
  newUsers: number;
}

export interface ReportStatusCount {
  status: string;
  count: number;
}

export interface AdminChartData {
  monthlyRevenue: MonthlyRevenue[];
  monthlyUsers: MonthlyUser[];
  reportStatus: ReportStatusCount[];
}

class AdminService {
  async getStats(): Promise<ApiResponse<AdminStats>> {
    const response = await apiClient.get<ApiResponse<AdminStats>>("/admin/stats");
    return response.data;
  }

  async getChartData(period: string = "month"): Promise<ApiResponse<AdminChartData>> {
    const response = await apiClient.get<ApiResponse<AdminChartData>>(`/admin/stats/chart?period=${period}`);
    return response.data;
  }
}

export const adminService = new AdminService();
