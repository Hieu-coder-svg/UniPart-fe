import { apiClient } from "./apiClient";
import { ApiResponse } from "../types/auth";

const BASE_URL = "/reviews";

export interface ReviewRequest {
  jobId: number;
  studentId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  jobId: number;
  studentId: string;
  employerId: string;
  studentName?: string;
  studentAvatar?: string;
  employerName?: string;
  employerAvatar?: string;
  reviewType: "STUDENT_TO_EMPLOYER" | "EMPLOYER_TO_STUDENT";
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StudentReviewRequest {
  jobId: number;
  rating: number;
  comment: string;
}

export const reviewService = {
  /**
   * Student submits a review for an employer (POST /reviews/student)
   */
  studentReviewEmployer: async (request: StudentReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>(`${BASE_URL}/student`, request);
    return response.data;
  },

  /**
   * Employer submits a review for a student (POST /reviews/employer)
   */
  employerReviewStudent: async (request: ReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>(`${BASE_URL}/employer`, request);
    return response.data;
  },

  /**
   * Get all reviews for a specific student
   */
  getReviewsByStudentId: async (studentId: string): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(`${BASE_URL}/student/${studentId}`);
    return response.data;
  },

  /**
   * Get all reviews received by an employer
   */
  getReviewsByEmployerId: async (employerId: string): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(`${BASE_URL}/employer/${employerId}`);
    return response.data;
  },

  /**
   * Get all reviews written by a student
   */
  getReviewsWrittenByStudent: async (studentId: string): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(`${BASE_URL}/written-by-student/${studentId}`);
    return response.data;
  },

  /**
   * Get all reviews written by an employer
   */
  getReviewsWrittenByEmployer: async (employerId: string): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(`${BASE_URL}/written-by-employer/${employerId}`);
    return response.data;
  },
};
