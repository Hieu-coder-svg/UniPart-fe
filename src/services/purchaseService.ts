import { apiClient } from "./apiClient";
import { PackageResponse } from "./packageService";

export interface PaymentUrlResponse {
  paymentUrl: string;
}

export interface PurchasePackageResponse {
  id: number;
  employerId: string;
  packageId: number;
  packageName: string;
  packageType: string;
  pricePaid: number;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
  transactionRef: string;
  purchasedAt: string;
  startDate?: string;
  endDate?: string;
  tinsPurchased?: number;
  paymentDeadline?: string;
  isExpired?: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

class PurchaseService {
  async getAllPackages(): Promise<PackageResponse[]> {
    const response = await apiClient.get<ApiResponse<PackageResponse[]>>("/packages");
    return response.data.result || [];
  }

  async createPaymentUrl(packageId: number): Promise<PaymentUrlResponse> {
    const response = await apiClient.post<ApiResponse<PaymentUrlResponse>>(
      `/employer/packages/${packageId}/payment/create`
    );
    if (!response.data.result) {
      throw new Error(response.data.message || "Không thể tạo thanh toán");
    }
    return response.data.result;
  }

  async getMyPurchases(): Promise<PurchasePackageResponse[]> {
    const response = await apiClient.get<ApiResponse<PurchasePackageResponse[]>>("/employer/purchases");
    return response.data.result || [];
  }
}

export const purchaseService = new PurchaseService();
