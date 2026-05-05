// Chat Types
import type { Job } from '../app/data/mockData';

export interface ChatRequest {
  message: string;
  userId?: string;
  context?: string;
}

export interface RecommendedItem {
  id: string;
  title: string;
  type: string;
  reason: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  jobs?: Job[];
  recommendations?: RecommendedItem[];
  timestamp?: string;
}

export interface ApiResponse<T> {
  result: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}