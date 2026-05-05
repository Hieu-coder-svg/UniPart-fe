/**
 * SavedJobsContext
 * Quản lý global state danh sách việc làm đã lưu.
 * - Chỉ fetch sau khi auth đã load xong và user đã đăng nhập
 * - Cập nhật real-time khi save / unsave từ bất kỳ component nào
 * - Xóa khi user logout
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { jobService, SavedJobResponse } from "../../services/jobService";
import { useAuth } from "./AuthContext";

interface SavedJobsContextType {
  /** Danh sách raw SavedJobResponse từ backend */
  savedJobs: SavedJobResponse[];
  /** Set jobId đã lưu (để check nhanh O(1)) */
  savedJobIds: Set<number>;
  isLoading: boolean;
  /** Lưu một job — cập nhật state ngay, gọi API song song */
  saveJob: (jobId: number) => Promise<void>;
  /** Bỏ lưu theo jobId (không phải savedJob.id) */
  unsaveJob: (jobId: number) => Promise<void>;
  /** Kiểm tra 1 job đã được lưu chưa */
  isJobSaved: (jobId: number) => boolean;
  /** Refresh toàn bộ list từ server */
  refresh: () => Promise<void>;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJobResponse[]>([]);
  // true cho đến khi auth load xong + fetch hoàn tất lần đầu
  const [isLoading, setIsLoading] = useState(true);

  /** Set jobId để check O(1) */
  const savedJobIds = new Set(savedJobs.map((sj) => sj.jobId));

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await jobService.getSavedJobs();
      if (res.result) {
        setSavedJobs(res.result);
      }
    } catch (err) {
      console.error("[SavedJobsContext] Lỗi lấy saved jobs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Chỉ fetch khi:
   *  1. AuthContext đã load xong (authLoading === false)
   *  2. Có user (đã đăng nhập)
   * Trong thời gian authLoading === true → isLoading vẫn là true → hiện spinner
   */
  useEffect(() => {
    if (authLoading) return; // Chờ auth load xong

    if (user) {
      fetchAll(); // fetchAll tự set isLoading = false khi xong
    } else {
      // Không có user (chưa đăng nhập / đã logout)
      setSavedJobs([]);
      setIsLoading(false);
    }
  }, [authLoading, user, fetchAll]);

  const saveJob = useCallback(async (jobId: number) => {
    // Optimistic update: thêm ngay vào local state
    const tempEntry: SavedJobResponse = {
      id: -1, // placeholder, sẽ được thay khi fetch lại
      studentId: "",
      jobId,
      savedAt: new Date().toISOString(),
    };
    setSavedJobs((prev) => {
      if (prev.some((sj) => sj.jobId === jobId)) return prev; // đã lưu rồi
      return [...prev, tempEntry];
    });

    try {
      const res = await jobService.saveJob(jobId);
      if (res.result) {
        // Thay placeholder bằng dữ liệu thật từ server
        setSavedJobs((prev) =>
          prev.map((sj) => (sj.jobId === jobId && sj.id === -1 ? res.result! : sj))
        );
      }
    } catch (err) {
      // Rollback nếu lỗi
      setSavedJobs((prev) => prev.filter((sj) => !(sj.jobId === jobId && sj.id === -1)));
      throw err;
    }
  }, []);

  const unsaveJob = useCallback(async (jobId: number) => {
    // Optimistic update: xóa ngay
    const removed = savedJobs.find((sj) => sj.jobId === jobId);
    setSavedJobs((prev) => prev.filter((sj) => sj.jobId !== jobId));

    try {
      await jobService.unsaveJob(jobId);
    } catch (err) {
      // Rollback nếu lỗi
      if (removed) {
        setSavedJobs((prev) => [...prev, removed]);
      }
      throw err;
    }
  }, [savedJobs]);

  const isJobSaved = useCallback(
    (jobId: number) => savedJobIds.has(jobId),
    [savedJobIds]
  );

  return (
    <SavedJobsContext.Provider
      value={{
        savedJobs,
        savedJobIds,
        isLoading,
        saveJob,
        unsaveJob,
        isJobSaved,
        refresh: fetchAll,
      }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs(): SavedJobsContextType {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error("useSavedJobs must be used within <SavedJobsProvider>");
  return ctx;
}
