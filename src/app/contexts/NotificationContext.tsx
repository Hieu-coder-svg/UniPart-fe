/**
 * NotificationContext
 * Manages real-time notifications via WebSocket (STOMP over SockJS).
 * Connects automatically when user is authenticated, disconnects on logout.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { notificationService, NotificationResponse } from "../../services/notificationService";
import { useAuth } from "./AuthContext";
import { TOKEN_KEY } from "@/lib/constants";

interface NotificationContextType {
  notifications: NotificationResponse[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<boolean>;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  totalElements: number;
  refetch: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPage, setCurrentPageState] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const stompClientRef = useRef<Client | null>(null);
  const pollingRef = useRef<number | null>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.result !== undefined) {
        setUnreadCount(res.result);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Fetch notifications for current page from REST API
  const refetch = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications(currentPage, 10);
      if (res.result) {
        setNotifications(res.result.content || []);
        setTotalPages(res.result.totalPages || 1);
        setTotalElements(res.result.totalElements || 0);
      }
      await fetchUnreadCount();
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [currentPage, fetchUnreadCount]);

  const setCurrentPage = useCallback((page: number | ((prev: number) => number)) => {
    setCurrentPageState(page);
  }, []);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      const res = await notificationService.updateNotification(id, { isRead: true });
      if (res.result) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, ...res.result, isRead: true } : n
          )
        );
      }
      return true;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      await fetchUnreadCount();
      return false;
    }
  }, [fetchUnreadCount]);

  // Keep a ref of refetch to allow websocket or pollers to access latest closures
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  // Connect WebSocket when authenticated (once)
  useEffect(() => {
    if (!isAuthenticated) {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setNotifications([]);
      setIsConnected(false);
      setUnreadCount(0);
      setCurrentPageState(0);
      return;
    }

    // Initial fetch
    refetchRef.current();

    const token = localStorage.getItem(TOKEN_KEY);
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws") as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        console.log("[WS] Connected to notification broker");

        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification: NotificationResponse = JSON.parse(message.body);
            console.log("[WS] Received notification:", notification);
            // Refresh current page + unread count
            refetchRef.current();
          } catch (err) {
            console.error("[WS] Failed to parse notification:", err);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log("[WS] Disconnected from notification broker");
      },
      onStompError: (frame) => {
        console.error("[WS] STOMP error:", frame);
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Lightweight polling to ensure robust sync
    pollingRef.current = window.setInterval(() => {
      refetchRef.current().catch((err) => console.error("[WS] Polling failed:", err));
    }, 5000);

    return () => {
      if (client.active) {
        client.deactivate();
      }
      stompClientRef.current = null;
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        refetch,
        fetchUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
