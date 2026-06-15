import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import EmployerLayout from "./components/EmployerLayout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/student/Home";
import JobBrowse from "./pages/student/JobBrowse";
import JobDetail from "./pages/student/JobDetail";
import Community from "./pages/student/Community";
import CommunityPostDetail from "./pages/student/CommunityPostDetail";
import UserProfile from "./pages/student/UserProfile";
import Profile from "./pages/student/Profile";
import SavedJobs from "./pages/student/SavedJobs";
import Notifications from "./pages/student/Notifications";
import MyReports from "./pages/student/MyReports";
import Login from "./pages/student/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import EmployerLogin from "./pages/employer/EmployerLogin";
import EmployerHome from "./pages/employer/EmployerHome";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerApplicants from "./pages/employer/EmployerApplicants";
import EmployerMessages from "./pages/employer/EmployerMessages";
import EmployerNotifications from "./pages/employer/EmployerNotifications";
import EmployerAnalytics from "./pages/employer/EmployerAnalytics";

import EmployerBuyPosts from "./pages/employer/EmployerBuyPosts";
import EmployerSettings from "./pages/employer/EmployerSettings";
import PaymentSuccess from "./pages/employer/PaymentSuccess";
import StudentApplications from "./pages/student/StudentApplications";
import StudentInformation from "./pages/student/StudentInformation";
import AdminOverview from "./pages/admin/Overview";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPackages from "./pages/admin/Packages";
import AdminReports from "./pages/admin/Reports";

import AccountManagement from "./pages/admin/AccountManagement";
import SystemBackup from "./pages/admin/SystemBackup";
import SystemLogs from "./pages/admin/SystemLogs";
import AdminSettings from "./pages/admin/Settings";
import AdminReport from "./pages/admin/AdminReport";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCategories from "./pages/admin/AdminCategories";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import StudentManual from "./pages/manual/StudentManual";
import EmployerManual from "./pages/manual/EmployerManual";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/unauthorized",
    Component: Unauthorized,
  },
  {
    path: "/register",
    element: <Navigate to="/login?tab=register" replace />,
  },
  {
    path: "/register/student",
    element: <Navigate to="/login?tab=register" replace />,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/verify-otp",
    Component: VerifyOtp,
  },
  {
    path: "/payment/success",
    Component: PaymentSuccess,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "packages", Component: AdminPackages },
      { path: "reports", Component: AdminReports },

      { path: "accounts", Component: AccountManagement },
      { path: "analytics", Component: AdminDashboard },
      { path: "report", Component: AdminReport },
      { path: "backup", Component: SystemBackup },
      { path: "logs", Component: SystemLogs },
      { path: "community", Component: AdminDashboard },
      { path: "categories", Component: AdminCategories },
      { path: "notifications", Component: AdminNotifications },
      { path: "settings", Component: AdminSettings },
      { path: "system", Component: AdminDashboard },
      { path: "overview", Component: AdminOverview },
    ],
  },
  {
    path: "/employer",
    children: [
      { index: true, Component: EmployerHome },
      { path: "login", Component: EmployerLogin },
      {
        path: "dashboard",
        Component: EmployerLayout,
        children: [
          { index: true, Component: EmployerDashboard },
          { path: "jobs", Component: EmployerJobs },
          { path: "applicants", Component: EmployerApplicants },
          { path: "notifications", Component: EmployerNotifications },
          { path: "messages", Component: EmployerMessages },
          { path: "pricing", Component: EmployerBuyPosts }, // Buy posts page
          { path: "analytics", Component: EmployerAnalytics },

          { path: "buy-posts", Component: EmployerBuyPosts },
          { path: "settings", Component: EmployerSettings },
        ],
      },
    ],
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "jobs", Component: JobBrowse },
      { path: "jobs/:id", Component: JobDetail },
      { path: "saved", Component: SavedJobs },
      { path: "community", Component: Community },
      { path: "community/post/:id", Component: CommunityPostDetail },
      { path: "community/user/:userId", Component: UserProfile },
      { path: "profile", Component: Profile },
      { path: "student/applications", Component: StudentApplications },
      { path: "student/information", Component: StudentInformation },
      { path: "notifications", Component: Notifications },
      { path: "my-reports", Component: MyReports },
      { path: "manual/student", Component: StudentManual },
      { path: "manual/employer", Component: EmployerManual },
      { path: "*", Component: NotFound },
    ],
  },
]);