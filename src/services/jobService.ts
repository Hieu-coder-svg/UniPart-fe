import axios, { AxiosInstance } from "axios";
import { ApiResponse, PaginatedResponse } from "../types/auth";

export interface JobTimeSlotResponse {
    workDate: string; // LocalDate
    startTime: string; // LocalTime
    endTime: string; // LocalTime
}

export interface JobResponse {
    id: number;
    employerId: string;
    employerName: string;
    title: string;
    image: string;
    description: string;
    workingShift: string;
    vacancies: number;
    urgent: boolean;
    address: string;
    locationLatitude: number;
    locationLongitude: number;
    salary: number; // Using number for BigDecimal
    isHide: boolean;
    createdAt: string;
    expiredAt: string;
    timeSlots: JobTimeSlotResponse[];
    status: string;
    applicationId?: number;
    appliedAt?: string;
}

export interface JobFilterRequest {
    employerId?: string;
    title?: string;
    workingShift?: string[];
    urgent?: boolean;
    address?: string;
    minSalary?: number;
    maxSalary?: number;
    createdAfter?: string; // LocalDateTime
    expiresBefore?: string; // LocalDateTime
    isHide?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
}

export interface JobTimeSlotRequest {
    workDate: string;
    startTime: string;
    endTime: string;
}

export interface JobCreationRequest {
    title: string;
    image?: string;
    description?: string;
    workingShift?: string;
    vacancies: number;
    urgent?: boolean;
    address?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    salary: number;
    expiredAt?: string; // LocalDateTime format 'YYYY-MM-DDTHH:mm:ss'
    timeSlots?: JobTimeSlotRequest[];
}

// Thêm interface cho Page (Spring Data JPA) do BE trả về kiểu Page<JobResponse>
export interface Page<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface SavedJobRequest {
    jobId: number;
}

export interface SavedJobResponse {
    id: number;
    studentId: string;
    jobId: number;
    savedAt: string; // LocalDateTime
}

const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "access_token";

class JobService {
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

    async getAllJobs(request: JobFilterRequest): Promise<ApiResponse<Page<JobResponse>>> {
        // Axios GET method có thể bị loại bỏ body trên một số server, đổi sang POST /job/search
        const response = await this.api.post<ApiResponse<Page<JobResponse>>>('/job/search', request);
        return response.data;
    }

    async createJob(request: JobCreationRequest): Promise<ApiResponse<JobResponse>> {
        const response = await this.api.post<ApiResponse<JobResponse>>('/job', request);
        return response.data;
    }

    async getJobDetail(id: number): Promise<ApiResponse<JobResponse>> {
        const response = await this.api.get<ApiResponse<JobResponse>>(`/job/${id}`);
        return response.data;
    }

    async getStudentJobHistory(studentId: string): Promise<ApiResponse<JobResponse[]>> {
        const response = await this.api.get<ApiResponse<JobResponse[]>>(`/job/history/${studentId}`);
        return response.data;
    }

    async getMyJobPost(): Promise<ApiResponse<JobResponse[]>> {
        const response = await this.api.get<ApiResponse<JobResponse[]>>("/job/myPost");
        return response.data;
    }

    // Saved Jobs APIs
    async saveJob(jobId: number): Promise<ApiResponse<SavedJobResponse>> {
        const request: SavedJobRequest = { jobId };
        const response = await this.api.post<ApiResponse<SavedJobResponse>>("/saved-jobs", request);
        return response.data;
    }

    async unsaveJob(jobId: number): Promise<ApiResponse<string>> {
        const response = await this.api.delete<ApiResponse<string>>(`/saved-jobs/${jobId}`);
        return response.data;
    }

    async getSavedJobs(): Promise<ApiResponse<SavedJobResponse[]>> {
        const response = await this.api.get<ApiResponse<SavedJobResponse[]>>("/saved-jobs");
        return response.data;
    }

    async isJobSaved(jobId: number): Promise<ApiResponse<boolean>> {
        const response = await this.api.get<ApiResponse<boolean>>(`/saved-jobs/check/${jobId}`);
        return response.data;
    }
}

export const jobService = new JobService();
