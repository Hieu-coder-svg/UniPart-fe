import { apiClient } from "./apiClient";

export interface BackupRecord {
  id: string;
  type: "full" | "incremental";
  status: "completed" | "failed" | "running";
  date: string;
  duration: string;
  fileName?: string;
}

export interface ScheduleConfig {
  id?: number;
  fullEnabled: boolean;
  fullTime: string;
  fullFrequency: string;
  incrementalEnabled: boolean;
  incrementalEvery: string;
}

export const backupService = {
  getHistory: async (): Promise<BackupRecord[]> => {
    return apiClient.get("/admin/backup/history").then(res => {
      // Backend returns date as ISO string e.g. "2026-05-06T12:00:00"
      // We format it here if needed, or just let UI handle it. 
      // We will map date to local format.
      const data = res.data.map((item: any) => {
        const d = new Date(item.date);
        return {
          ...item,
          date: `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`
        }
      });
      return data;
    });
  },

  createBackup: async (type: "full" | "incremental" = "full"): Promise<BackupRecord> => {
    return apiClient.post(`/admin/backup/create?type=${type}`).then(res => {
      const item = res.data;
      const d = new Date(item.date);
      return {
        ...item,
        date: `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`
      }
    });
  },

  restoreBackup: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/admin/backup/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(res => res.data);
  },

  downloadBackup: async (id: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/admin/backup/download/${id}`, {
      responseType: 'blob'
    });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  getSchedule: async (): Promise<ScheduleConfig> => {
    return apiClient.get("/admin/backup/schedule").then(res => res.data);
  },

  updateSchedule: async (schedule: ScheduleConfig): Promise<void> => {
    return apiClient.put("/admin/backup/schedule", schedule).then(res => res.data);
  }
};
