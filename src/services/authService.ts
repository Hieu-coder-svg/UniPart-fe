/**
 * Authentication Service
 * Design: Modern Enterprise Minimalism
 * Handles all authentication-related API calls
 */

import axios, { AxiosInstance } from "axios";
import {
  ApiResponse,
  AuthenticationRequest,
  AuthenticationResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  IntrospectRequest,
  IntrospectResponse,
  LogoutRequest,
  RefreshRequest,
  StudentRegistrationRequest,
  StudentResponse,
  EmployerRegistrationRequest,
  EmployerResponse,
  UserResponse,
  VerifyOTPRequest,
  SendOTPRequest,
} from "../types/auth";

// Placeholder for constants, replace with your actual constants file
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Replace with your backend API base URL
const TOKEN_KEY = "access_token"; // Replace with your actual token key

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for unified error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log full error response for debugging
        if (error.response) {
          console.error('❌ [API ERROR]', {
            status: error.response.status,
            url: error.config?.url,
            requestData: error.config?.data,
            responseData: error.response.data,
          });
        }
        // Extract backend error message if available
        if (error.response && error.response.data) {
          const data = error.response.data;
          let errorMessage = data.message;
          
          // Handle Spring Boot validation errors format
          if (data.errors && Array.isArray(data.errors)) {
             const validationErrors = data.errors.map((e: any) => `${e.field}: ${e.defaultMessage}`).join(', ');
             errorMessage = `Lỗi: ${validationErrors}`;
          } else if (data.result && typeof data.result === 'object') {
             // Handle custom validation errors in result object
             const validationErrors = Object.entries(data.result).map(([field, msg]) => `${field}: ${msg}`).join(', ');
             if (validationErrors) {
               errorMessage = `Lỗi: ${validationErrors}`;
             }
          }
          
          if (errorMessage) {
            return Promise.reject(new Error(errorMessage));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(request: AuthenticationRequest): Promise<ApiResponse<AuthenticationResponse>> {
    const response = await this.api.post<ApiResponse<AuthenticationResponse>>(
      "/auth/login",
      request
    );
    return response.data;
  }

  async registerStudent(request: StudentRegistrationRequest): Promise<ApiResponse<StudentResponse>> {
    const response = await this.api.post<ApiResponse<StudentResponse>>(
      "/auth/register-student",
      request
    );
    return response.data;
  }

  async registerEmployer(request: EmployerRegistrationRequest): Promise<ApiResponse<EmployerResponse>> {
    const response = await this.api.post<ApiResponse<EmployerResponse>>(
      "/auth/register-employer",
      request
    );
    return response.data;
  }

  async logout(request: LogoutRequest): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>("/auth/logout", request);
    return response.data;
  }

  async introspect(request: IntrospectRequest): Promise<ApiResponse<IntrospectResponse>> {
    const response = await this.api.post<ApiResponse<IntrospectResponse>>(
      "/auth/introspect",
      request
    );
    return response.data;
  }

  async refreshToken(request: RefreshRequest): Promise<ApiResponse<AuthenticationResponse>> {
    const response = await this.api.post<ApiResponse<AuthenticationResponse>>(
      "/auth/refresh",
      request
    );
    return response.data;
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse<string>> {
    const response = await this.api.post<ApiResponse<string>>(
      "/auth/forgotPassword",
      request
    );
    return response.data;
  }

  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<UserResponse>> {
    const response = await this.api.post<ApiResponse<UserResponse>>(
      "/auth/changePassword",
      request
    );
    return response.data;
  }

  async verifyOtp(request: VerifyOTPRequest): Promise<ApiResponse<string>> {
    const response = await this.api.post<ApiResponse<string>>(
      "/otp/verifyOtp",
      request
    );
    return response.data;
  }

  async resetOtp(request: SendOTPRequest): Promise<ApiResponse<string>> {
    const response = await this.api.post<ApiResponse<string>>(
      "/otp/resetOtp",
      request
    );
    return response.data;
  }

  async getEmailByUsername(username: string): Promise<ApiResponse<string>> {
    const response = await this.api.get<ApiResponse<string>>(
      `/auth/get-email?username=${encodeURIComponent(username)}`
    );
    return response.data;
  }

  async getUserInfo(): Promise<ApiResponse<UserResponse>> {
    const endpoints = ["/users/me", "/auth/me", "/auth/user", "/me"];

    for (const endpoint of endpoints) {
      try {
        const response = await this.api.get<ApiResponse<UserResponse>>(endpoint);
        if (response?.data?.code === 200 || response?.data?.code === 1000) {
          return response.data;
        }
      } catch (error: any) {
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          continue;
        }
        throw error;
      }
    }

    throw new Error("Failed to fetch user profile");
  }

  async test(): Promise<ApiResponse<string>> {
    const response = await this.api.get<ApiResponse<string>>("/auth/test");
    return response.data;
  }
}

export const authService = new AuthService();
