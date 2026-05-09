import { apiClient } from "./apiClient";

export interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "success" | string;
  message: string;
  timestamp: string;
  source: string;
  details: string;
}

export const logService = {
  getSystemLogs: async (limit: number = 500): Promise<SystemLog[]> => {
    return apiClient.get(`/admin/logs?limit=${limit}`).then(res => res.data);
  }
};
