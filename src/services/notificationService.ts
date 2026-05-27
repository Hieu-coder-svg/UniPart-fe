import { ApiResponse } from "./authService";

const BASE_URL = `${import.meta.env.VITE_API_URL as string}/notification`;

export interface NotificationResponse {
  id: number;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface NotificationUpdateRequest {
  isRead: boolean;
}

export const notificationService = {
  getMyNotifications: async (page: number = 0, size: number = 10): Promise<ApiResponse<Page<NotificationResponse>>> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notifications");
    }
    return data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}/unread-count`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch unread count");
    }
    return data;
  },

  updateNotification: async (id: number, request: NotificationUpdateRequest): Promise<ApiResponse<NotificationResponse>> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update notification");
    }
    return data;
  }
};
