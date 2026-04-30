/**
 * useAuth Hook
 * Design: Modern Enterprise Minimalism
 * Provides easy access to authentication context
 */

import { useAuth as useAuthContext } from "@/app/contexts/AuthContext";

export function useAuth() {
  return useAuthContext();
}
