import { ApiResponse } from "./authService";
import { apiClient } from "./apiClient";

const BASE_URL = "/application";

export interface ApplyJobRequest {
  jobId: number;
}

export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentUniversity?: string;
  studentMajor?: string;
  status: string;
  appliedAt: string;
  completedAt: string | null;
}

export const applicationService = {
  applyJob: async (request: ApplyJobRequest): Promise<ApiResponse<ApplicationResponse>> => {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>(BASE_URL, request);
    return response.data;
  },

  deleteApplyJob: async (applicationId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`${BASE_URL}?applicationId=${applicationId}`);
    return response.data;
  },

  getEmployerApplications: async (): Promise<ApiResponse<ApplicationResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(`${BASE_URL}/employer`);
    return response.data;
  },

  getStudentApplications: async (): Promise<ApiResponse<ApplicationResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(BASE_URL);
    return response.data;
  },

  acceptApplication: async (id: number): Promise<ApiResponse<ApplicationResponse>> => {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(`${BASE_URL}/employer/${id}/accept`);
    return response.data;
  },

  rejectApplication: async (id: number): Promise<ApiResponse<ApplicationResponse>> => {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(`${BASE_URL}/employer/${id}/reject`);
    return response.data;
  },
};
