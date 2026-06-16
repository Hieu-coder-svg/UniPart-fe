/**
 * Global type definitions for UniHire Frontend
 * Design: Modern Enterprise Minimalism
 */

// Authentication Types
export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
  username?: string;
  roles?: string[];
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User Types
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "EMPLOYER" | "STUDENT" | "EMPLOYEE";

// API Response Types
export interface ApiResponse<T> {
  code: number;
  message?: string;
  result?: T;
}

// Registration Types
export interface StudentRegistrationRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string; // LocalDate in Java, use string for ISO date format
  phoneNumber: string;
  gender: string;
  university?: string;
  major?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface StudentResponse {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string; // LocalDate in Java, use string for ISO date format
  phoneNumber: string;
  gender: string;
  isBlocked: boolean;
  isActived: boolean;
  roleName: string;
  avatar?: string;
  createdAt: string; // LocalDateTime in Java, use string for ISO date format
  updatedAt: string; // LocalDateTime in Java, use string for ISO date format
  university: string;
  major: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
}

export interface EmployerRegistrationRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string; // LocalDate in Java, use string for ISO date format
  phoneNumber?: string;
  gender?: string;
  companyName: string;
  companyAddress: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface EmployerResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  dateOfBirth?: string; // LocalDate in Java, use string for ISO date format
  phoneNumber?: string;
  gender?: string;
  isBlocked: boolean;
  isActived: boolean;
  avatar?: string;
  createdAt: string; // LocalDateTime in Java, use string for ISO date format
  updatedAt: string; // LocalDateTime in Java, use string for ISO date format
  companyName: string;
  companyAddress: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  rating?: number;
}

// Auth Context Types
export interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  login: (username: string, password: string) => Promise<UserResponse>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  registerStudent: (data: StudentRegistrationRequest) => Promise<any>;
  registerEmployer: (data: EmployerRegistrationRequest) => Promise<any>;
  refreshToken: () => Promise<any>;
  verifyOtp: (data: VerifyOTPRequest) => Promise<any>;
  resetOtp: (data: SendOTPRequest) => Promise<any>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<any>;
  resetPassword: (data: ResetPasswordRequest) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  clearError: () => void;
  updateUser: (partial: Partial<UserResponse>) => void;
}

// Theme Types
export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
  roles?: UserRole[];
}

// Common Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
