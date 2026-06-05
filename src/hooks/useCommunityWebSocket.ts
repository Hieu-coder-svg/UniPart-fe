/**
 * useCommunityWebSocket.ts
 * Real-time updates for community posts via WebSocket
 */

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { TOKEN_KEY } from "@/lib/constants";

interface UseCommunityWebSocketOptions {
  onNewPost?: (post: any) => void;
  onLikeUpdate?: (data: { postId: number; likesCount: number; isLiked: boolean }) => void;
  enabled?: boolean;
}

export function useCommunityWebSocket({
  onNewPost,
  onLikeUpdate,
  enabled = true,
}: UseCommunityWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onNewPostRef = useRef(onNewPost);
  const onLikeUpdateRef = useRef(onLikeUpdate);

  onNewPostRef.current = onNewPost;
  onLikeUpdateRef.current = onLikeUpdate;

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${(import.meta.env.VITE_API_URL as string || '/api')}/ws`) as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[WS] Community: connected");

        if (onNewPostRef.current) {
          client.subscribe("/topic/community/posts", (message) => {
            try {
              const post = JSON.parse(message.body);
              onNewPostRef.current?.(post);
            } catch (err) {
              console.error("[WS] Failed to parse new post:", err);
            }
          });
        }

        if (onLikeUpdateRef.current) {
          client.subscribe("/topic/community/likes", (message) => {
            try {
              const data = JSON.parse(message.body);
              onLikeUpdateRef.current?.(data);
            } catch (err) {
              console.error("[WS] Failed to parse like update:", err);
            }
          });
        }
      },
      onDisconnect: () => {
        console.log("[WS] Community: disconnected");
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

  const sendLike = (postId: number) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: "/app/community/like",
        body: JSON.stringify({ postId }),
      });
    }
  };

  return { sendLike };
}
