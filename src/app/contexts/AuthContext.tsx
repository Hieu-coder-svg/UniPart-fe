/**
 * Authentication Context
 * Design: Modern Enterprise Minimalism
 * Manages user authentication state and operations
 */

import React, { createContext, useCallback, useEffect, useState } from "react";
import { AuthContextType, AuthenticationRequest, RegisterRequest, StudentRegistrationRequest, EmployerRegistrationRequest, UserResponse, VerifyOTPRequest, SendOTPRequest, ForgotPasswordRequest } from "@/types";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/lib/constants";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isSuccessCode = (code: number) => code === 200 || code === 1000;

  const parseJwtPayload = (token: string) => {
    try {
      const [, payload] = token.split(".");
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(
        decoded
          .split("")
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join("")
      ));
    } catch {
      return null;
    }
  };

  const getRoleFromJwt = (payload: any): UserResponse["role"] => {
    if (!payload) {
      return "STUDENT";
    }

    const rawRoles = payload.roles || payload.authorities || payload.scope || payload.scopes;
    if (Array.isArray(rawRoles)) {
      const found = rawRoles.find((role: string) => /ADMIN|EMPLOYER|EMPLOYEE|STUDENT/i.test(role));
      if (found) {
        return found.replace(/^ROLE_/, "").toUpperCase() as UserResponse["role"];
      }
    }

    if (typeof rawRoles === "string") {
      const found = rawRoles.match(/ADMIN|EMPLOYER|EMPLOYEE|STUDENT/i);
      if (found) {
        return found[0].replace(/^ROLE_/, "").toUpperCase() as UserResponse["role"];
      }
    }

    return "STUDENT";
  };

  const createFallbackUser = (username: string, token: string): UserResponse => {
    const payload = parseJwtPayload(token);
    const fallbackId = payload?.sub || payload?.username || username || "unknown";
    const fallbackUsername = payload?.sub || payload?.username || username;
    const fallbackFullName = payload?.fullName || payload?.name || fallbackUsername;
    const fallbackEmail = payload?.email || "";
    const fallbackRole = getRoleFromJwt(payload);

    const now = new Date().toISOString();

    return {
      id: fallbackId,
      username: fallbackUsername,
      email: fallbackEmail,
      fullName: fallbackFullName,
      role: fallbackRole,
      createdAt: now,
      updatedAt: now,
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserResponse;
          setUser(parsedUser);

          // Fetch fresh user profile from DB to sync the latest avatar and fullName
          try {
            if (parsedUser.role === "STUDENT") {
              const res = await userService.getStudentMyInfo();
              if (res.result) {
                const freshUser = {
                  ...parsedUser,
                  avatar: res.result.avatar,
                  fullName: res.result.fullName,
                };
                setUser(freshUser);
                localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
              }
            } else if (parsedUser.role === "EMPLOYER") {
              const res = await userService.getEmployerMyInfo();
              if (res.result) {
                const freshUser = {
                  ...parsedUser,
                  avatar: res.result.avatar,
                  fullName: res.result.fullName,
                };
                setUser(freshUser);
                localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
              }
            }
          } catch (apiError) {
            console.error("Failed to fetch fresh user info during init:", apiError);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const credentials: AuthenticationRequest = { username, password };
      const response = await authService.login(credentials);
      if (!isSuccessCode(response.code) || !response.result) {
        throw new Error(response.message || "Login failed");
      }

      const authResult = response.result;
      localStorage.setItem(TOKEN_KEY, authResult.token);
      if (authResult.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, authResult.refreshToken);
      }

      const profile = createFallbackUser(username, authResult.token);

      // Fetch the actual student or employer info immediately after login to populate avatar & fullName
      try {
        if (profile.role === "STUDENT") {
          const res = await userService.getStudentMyInfo();
          if (res.result) {
            profile.avatar = res.result.avatar;
            profile.fullName = res.result.fullName;
          }
        } else if (profile.role === "EMPLOYER") {
          const res = await userService.getEmployerMyInfo();
          if (res.result) {
            profile.avatar = res.result.avatar;
            profile.fullName = res.result.fullName;
          }
        }
      } catch (apiError) {
        console.error("Failed to fetch fresh user info after login:", apiError);
      }

      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (error: any) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.register(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerStudent = useCallback(async (data: StudentRegistrationRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.registerStudent(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "Student registration failed");
      }
      localStorage.setItem("registeredEmail", data.email);
      return response;
    } catch (error: any) {
      setError(error.message || "Student registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerEmployer = useCallback(async (data: EmployerRegistrationRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.registerEmployer(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "Employer registration failed");
      }
      localStorage.setItem("registeredEmail", data.email);
      return response;
    } catch (error: any) {
      setError(error.message || "Employer registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await authService.logout({ token });
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const response = await authService.refreshToken({
      refreshToken: refreshTokenValue,
    });

    if (!isSuccessCode(response.code) || !response.result) {
      await logout();
      throw new Error(response.message || "Token refresh failed");
    }

    localStorage.setItem(TOKEN_KEY, response.result.token);
    if (response.result.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.result.refreshToken);
    }

    return response;
  }, [logout]);

  const verifyOtp = useCallback(async (data: VerifyOTPRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.verifyOtp(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "OTP verification failed");
      }
      return response;
    } catch (error: any) {
      setError(error.message || "OTP verification failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetOtp = useCallback(async (data: SendOTPRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.resetOtp(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "Failed to resend OTP");
      }
      return response;
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword(data);
      if (!isSuccessCode(response.code)) {
        throw new Error(response.message || "Failed to request password reset");
      }
      return response;
    } catch (error: any) {
      setError(error.message || "Failed to request password reset");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    const response = await authService.changePassword({
      currentPassword: oldPassword,
      newPassword: newPassword,
    } as any);

    if (!isSuccessCode(response.code)) {
      throw new Error(response.message || "Change password failed");
    }

    return response;
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const updateUser = useCallback((partial: Partial<UserResponse>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    registerStudent,
    registerEmployer,
    logout,
    refreshToken,
    verifyOtp,
    resetOtp,
    forgotPassword,
    changePassword,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
