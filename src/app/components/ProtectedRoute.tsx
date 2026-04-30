/**
 * Protected Route Component
 * Design: Modern Enterprise Minimalism
 * Restricts access based on authentication and role
 */

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { Redirect } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  return <>{children}</>;
}
