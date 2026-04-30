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

    async updateProfileStudent(request: StudentUpdateRequest): Promise<ApiResponse<StudentResponse>> {
        const response = await this.api.post<ApiResponse<StudentResponse>>("/users/myStudentInfo", request);
        return response.data;
    }
}

export const userService = new UserService();
