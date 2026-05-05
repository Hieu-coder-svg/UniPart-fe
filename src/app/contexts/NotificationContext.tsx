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
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const pollingRef = useRef<number | null>(null);

  const sortNotifications = (list: NotificationResponse[]) =>
    [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Fetch all notifications from REST API
  const refetch = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.result) {
        setNotifications(sortNotifications(res.result));
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Mark a single notification as read (optimistic + API)
  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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
      return false;
    }
  }, []);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if not authenticated
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
      return;
    }

    // Initial fetch via REST
    refetch();

    // Set up STOMP client
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

        // Subscribe to personal notification queue
        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification: NotificationResponse = JSON.parse(message.body);
            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === notification.id);
              if (exists) {
                return sortNotifications(
                  prev.map((n) => (n.id === notification.id ? notification : n))
                );
              }
              return sortNotifications([notification, ...prev]);
            });
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

    // Poll as a fallback when WebSocket delivery is not immediate
    pollingRef.current = window.setInterval(() => {
      refetch().catch((err) => console.error("[WS] Notification polling failed:", err));
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
  }, [isAuthenticated, refetch]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isConnected, markAsRead, refetch }}
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
