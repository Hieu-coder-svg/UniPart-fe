import { apiClient } from "./apiClient";

export interface PackageRequest {
  name: string;
  packageType: "MONTHLY" | "PAY_PER_TIN";
  price: number;
  description?: string;
  durationDays?: number;
  normalTinsLimit?: number;
  maxNormalTinsPerDay?: number;
  urgentTinsLimit?: number;
  tinType?: string;
  tinQuantity?: number;
}

export interface PackageResponse {
  id: number;
  name: string;
  packageType: string;
  price: number;
  description?: string;
  durationDays?: number;
  normalTinsLimit?: number;
  maxNormalTinsPerDay?: number;
  urgentTinsLimit?: number;
  tinType?: string;
  tinQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

class PackageService {
  async getAllPackages(): Promise<PackageResponse[]> {
    const response = await apiClient.get<ApiResponse<PackageResponse[]>>("/packages");
    return response.data.result || [];
  }

  async getPackageById(id: number): Promise<PackageResponse> {
    const response = await apiClient.get<ApiResponse<PackageResponse>>(`/packages/${id}`);
    if (!response.data.result) {
      throw new Error("Package not found");
    }
    return response.data.result;
  }

  async createPackage(data: PackageRequest): Promise<PackageResponse> {
    const response = await apiClient.post<ApiResponse<PackageResponse>>("/admin/packages", data);
    if (!response.data.result) {
      throw new Error(response.data.message || "Failed to create package");
    }
    return response.data.result;
  }

  async updatePackage(id: number, data: PackageRequest): Promise<PackageResponse> {
    const response = await apiClient.put<ApiResponse<PackageResponse>>(`/admin/packages/${id}`, data);
    if (!response.data.result) {
      throw new Error(response.data.message || "Failed to update package");
    }
    return response.data.result;
  }

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/admin/packages/${id}`);
  }
}

export const packageService = new PackageService();
