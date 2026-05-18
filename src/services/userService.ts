import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../types/auth"; // Might need to check if ApiResponse is in types/auth

export interface StudentResponse {
    id: string;
    username: string;
    email: string;
    password?: string;
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    gender: string;
    isBlocked: boolean;
    isActived: boolean;
    roleName: string;
    createdAt: string;
    updatedAt: string;

    university: string;
    major: string;
    address: string;
    latitude: number;
    longitude: number;
    avatar?: string;
    
    bio?: string;
    skills?: string[];
    experience?: string;
    cvUrl?: string;
}

export interface StudentUpdateRequest {
    fullName: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    gender?: string;
    university?: string;
    major?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    avatar?: string;
}

export interface StudentScheduleRequest {
    schedules: DayScheduleRequest[];
}

export interface DayScheduleRequest {
    dayOfWeek: string;
    busyTimeSlotIds: number[];
}

export interface StudentScheduleResponse {
    userId: string;
    scheduleMatrix: Record<string, number[]>;
}

export interface EmployerResponse {
    id: string;
    username: string;
    email: string;
    fullName: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    gender?: string;
    isBlocked: boolean;
    isActived: boolean;
    companyName: string;
    companyAddress: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    rating?: number;
    avatar?: string;
}

export interface EmployerUpdateRequest {
    fullName: string;
    companyName: string;
    companyAddress: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
}

const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "access_token";

class UserService {
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
                if (error.response && error.response.data && error.response.data.message) {
                    return Promise.reject(new Error(error.response.data.message));
                }
                return Promise.reject(error);
            }
        );
    }

    async getStudentMyInfo(): Promise<ApiResponse<StudentResponse>> {
        const response = await this.api.get<ApiResponse<StudentResponse>>("/users/myStudentInfo");
        return response.data;
    }

    async getStudentById(id: number | string): Promise<ApiResponse<StudentResponse>> {
        const response = await this.api.get<ApiResponse<StudentResponse>>(`/users/student/${id}`);
        return response.data;
    }

    async getEmployerById(id: string): Promise<ApiResponse<EmployerResponse>> {
        const response = await this.api.get<ApiResponse<EmployerResponse>>(`/users/employer/${id}`);
        return response.data;
    }

    async updateProfileStudent(request: StudentUpdateRequest): Promise<ApiResponse<StudentResponse>> {
        const response = await this.api.post<ApiResponse<StudentResponse>>("/users/myStudentInfo", request);
        return response.data;
    }

    async getEmployerMyInfo(): Promise<ApiResponse<EmployerResponse>> {
        const response = await this.api.get<ApiResponse<EmployerResponse>>("/users/myEmployerInfo");
        return response.data;
    }

    async updateProfileEmployer(request: EmployerUpdateRequest): Promise<ApiResponse<EmployerResponse>> {
        const response = await this.api.post<ApiResponse<EmployerResponse>>("/users/myEmployerInfo", request);
        return response.data;
    }

    async getAllUsers(): Promise<ApiResponse<any>> {
        const response = await this.api.get<ApiResponse<any>>("/users");
        return response.data;
    }

    async blockUser(userId: string): Promise<ApiResponse<any>> {
        const response = await this.api.put<ApiResponse<any>>(`/users/${userId}/block`);
        return response.data;
    }

    async unblockUser(userId: string): Promise<ApiResponse<any>> {
        const response = await this.api.put<ApiResponse<any>>(`/users/${userId}/unblock`);
        return response.data;
    }

    async createStudentAccount(request: {
        username: string;
        email: string;
        password: string;
        fullName: string;
        university?: string;
        major?: string;
        phoneNumber?: string;
        gender?: string;
    }): Promise<ApiResponse<any>> {
        const response = await this.api.post<ApiResponse<any>>("/auth/register-student", request);
        return response.data;
    }

    async createEmployerAccount(request: {
        username: string;
        email: string;
        password: string;
        fullName: string;
        companyName?: string;
        companyAddress?: string;
        phoneNumber?: string;
        description?: string;
    }): Promise<ApiResponse<any>> {
        const response = await this.api.post<ApiResponse<any>>("/auth/register-employer", request);
        return response.data;
    }

    async createAccount(request: {
        username: string;
        email: string;
        password: string;
        fullName: string;
        roleName: string;
    }): Promise<ApiResponse<any>> {
        const role = request.roleName.toUpperCase();
        if (role === "STUDENT") {
            const response = await this.api.post<ApiResponse<any>>("/auth/register-student", request);
            return response.data;
        } else if (role === "EMPLOYER") {
            const response = await this.api.post<ApiResponse<any>>("/auth/register-employer", request);
            return response.data;
        } else {
            // ADMIN, MANAGER — dùng endpoint admin
            const response = await this.api.post<ApiResponse<any>>("/admin/create-account", request);
            return response.data;
        }
    }

    async getAdminStats(): Promise<ApiResponse<any>> {
        const response = await this.api.get<ApiResponse<any>>("/admin/stats");
        return response.data;
    }

    // Schedule APIs
    async getMySchedule(): Promise<ApiResponse<StudentScheduleResponse>> {
        const response = await this.api.get<ApiResponse<StudentScheduleResponse>>("/my-schedule");
        return response.data;
    }

    async saveSchedule(request: StudentScheduleRequest): Promise<ApiResponse<StudentScheduleResponse>> {
        const response = await this.api.post<ApiResponse<StudentScheduleResponse>>("/my-schedule", request);
        return response.data;
    }
}

export const userService = new UserService();
