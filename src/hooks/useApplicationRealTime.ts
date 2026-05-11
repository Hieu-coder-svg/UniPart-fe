/**
 * useApplicationRealTime.ts
 * Listen for new application notifications via WebSocket
 * and trigger automatic refresh when a student applies.
 */

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { TOKEN_KEY } from "@/lib/constants";
import { toast } from "sonner";

interface NewApplicationNotification {
  id: number;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface UseApplicationRealTimeOptions {
  onNewApplication: () => void;
  enabled?: boolean;
}

export function useApplicationRealTime({
  onNewApplication,
  enabled = true,
}: UseApplicationRealTimeOptions) {
  const clientRef = useRef<Client | null>(null);
  const onNewApplicationRef = useRef(onNewApplication);
  onNewApplicationRef.current = onNewApplication;

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws") as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[WS] Employer: connected to notification broker");

        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification: NewApplicationNotification = JSON.parse(message.body);

            // Detect new application notifications
            const isNewApplication =
              notification.title === "Ứng tuyển công việc" ||
              notification.title?.toLowerCase().includes("ứng tuyển");

            if (isNewApplication) {
              toast.success(notification.title, {
                description: notification.content,
                duration: 5000,
              });
              onNewApplicationRef.current();
            }
          } catch (err) {
            console.error("[WS] Failed to parse notification:", err);
          }
        });
      },
      onDisconnect: () => {
        console.log("[WS] Employer: disconnected from notification broker");
      },
      onStompError: (frame) => {
        console.error("[WS] STOMP error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
      clientRef.current = null;
    };
  }, [enabled]);
}
