/**
 * Application Constants
 * Design: Modern Enterprise Minimalism
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL as string;
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user";

// Roles
export const ROLES = {
  ADMIN: "ADMIN",
  EMPLOYER: "EMPLOYER",
  STUDENT: "STUDENT",
} as const;

// Role-based Route Mapping
export const ROLE_ROUTES = {
  ADMIN: "/admin/dashboard",
  EMPLOYER: "/employer/dashboard",
  STUDENT: "/student/dashboard",
} as const;

// Navigation Items
export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
  { id: "users", label: "Users", path: "/admin/users", icon: "Users" },
  { id: "employers", label: "Employers", path: "/admin/employers", icon: "Building" },
  { id: "students", label: "Students", path: "/admin/students", icon: "Users" },
  { id: "settings", label: "Settings", path: "/admin/settings", icon: "Settings" },
];

export const EMPLOYER_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/employer/dashboard", icon: "LayoutDashboard" },
  { id: "jobs", label: "Jobs", path: "/employer/jobs", icon: "Briefcase" },
  { id: "applications", label: "Applications", path: "/employer/applications", icon: "FileText" },
  { id: "profile", label: "Profile", path: "/employer/profile", icon: "User" },
];

export const STUDENT_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/student/dashboard", icon: "LayoutDashboard" },
  { id: "opportunities", label: "Opportunities", path: "/student/opportunities", icon: "Search" },
  { id: "applications", label: "Applications", path: "/student/applications", icon: "FileText" },
  { id: "profile", label: "Profile", path: "/student/profile", icon: "User" },
];

// Colors (Modern Enterprise Minimalism)
export const COLORS = {
  primary: "#2563EB", // Indigo
  secondary: "#64748B", // Slate
  accent: "#10B981", // Emerald
  background: "#FFFFFF",
  backgroundAlt: "#F8FAFC",
  text: "#1E293B",
  textSecondary: "#64748B",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  success: "#10B981",
} as const;

// Spacing (in pixels)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

// Transitions
export const TRANSITIONS = {
  quick: "100ms ease-out",
  standard: "200ms ease-in-out",
  slow: "300ms ease-in-out",
} as const;

// Messages
export const MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  LOGIN_ERROR: "Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  PASSWORD_CHANGE_SUCCESS: "Đổi mật khẩu thành công",
  PASSWORD_CHANGE_ERROR: "Đổi mật khẩu thất bại",
  NETWORK_ERROR: "Lỗi kết nối. Vui lòng thử lại",
  UNAUTHORIZED: "Bạn không có quyền truy cập",
  SESSION_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại",
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
