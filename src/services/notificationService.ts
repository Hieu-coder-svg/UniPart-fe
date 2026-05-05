import { ApiResponse } from "./authService";

const BASE_URL = "http://localhost:8080/notification";

export interface NotificationResponse {
  id: number;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationUpdateRequest {
  isRead: boolean;
}

export const notificationService = {
  getMyNotifications: async (): Promise<ApiResponse<NotificationResponse[]>> => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(BASE_URL, {
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
