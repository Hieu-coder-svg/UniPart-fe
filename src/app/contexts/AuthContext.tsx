import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "employer";
  avatar?: string;
  university?: string;
  major?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: "student" | "employer") => Promise<boolean>;
  register: (name: string, email: string, password: string, role: "student" | "employer", details?: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("unipart_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: "student" | "employer"): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock login - in real app, call API
    if (email && password.length >= 6) {
      const mockUser: User = {
        id: "1",
        name: "Nguyễn Minh Tuấn",
        email: email,
        avatar: "https://images.unsplash.com/photo-1600178572204-6ac8886aae63",
        university: "Đại học Khoa học Tự nhiên TP.HCM",
        major: "Công nghệ Thông tin",
        role: role,
      };
      setUser(mockUser);
      localStorage.setItem("unipart_user", JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "employer",
    details?: any
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock registration - in real app, call API
    if (name && email && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        ...details,
      };
      setUser(newUser);
      localStorage.setItem("unipart_user", JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unipart_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}