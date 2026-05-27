import axios, { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "access_token";

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
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

  get instance() {
    return this.api;
  }
}

export const apiClient = new ApiClient().instance;
