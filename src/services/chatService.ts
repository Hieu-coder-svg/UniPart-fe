import { apiClient } from "./apiClient";
import { ChatRequest, ApiResponse, AIResponse } from "../types/chat";

export const chatService = {
  async sendMessage(chatRequest: ChatRequest): Promise<ApiResponse<AIResponse>> {
    const response = await apiClient.post<ApiResponse<AIResponse>>("/chat", chatRequest);
    return response.data;
  },
};