import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import EmployerLayout from "./components/EmployerLayout";
import ManagerLayout from "./components/ManagerLayout";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/student/Home";
import JobBrowse from "./pages/student/JobBrowse";
import JobDetail from "./pages/student/JobDetail";
import Community from "./pages/student/Community";
import Profile from "./pages/student/Profile";
import SavedJobs from "./pages/student/SavedJobs";
import Login from "./pages/student/Login";
import EmployerLogin from "./pages/employer/EmployerLogin";
import EmployerHome from "./pages/employer/EmployerHome";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerApplicants from "./pages/employer/EmployerApplicants";
import EmployerMessages from "./pages/employer/EmployerMessages";
import EmployerAnalytics from "./pages/employer/EmployerAnalytics";
import EmployerBilling from "./pages/employer/EmployerBilling";
import EmployerBuyPosts from "./pages/employer/EmployerBuyPosts";
import EmployerSettings from "./pages/employer/EmployerSettings";
import ManagerOverview from "./pages/manager/Overview";
import ManagerPackages from "./pages/manager/Packages";
import ManagerReports from "./pages/manager/Reports";
import UsersManagement from "./pages/manager/UsersManagement";
import AdminOverview from "./pages/admin/Overview";
import AccountManagement from "./pages/admin/AccountManagement";
import SystemBackup from "./pages/admin/SystemBackup";
import SystemLogs from "./pages/admin/SystemLogs";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: "accounts", Component: AccountManagement },
      { path: "backup", Component: SystemBackup },
      { path: "logs", Component: SystemLogs },
      { path: "system", Component: AdminOverview }, // Reuse overview for now
      { path: "settings", Component: AdminSettings }, // Reuse overview for now
    ],
  },
  {
    path: "/manager",
    Component: ManagerLayout,
    children: [
      { index: true, Component: ManagerOverview },
      { path: "packages", Component: ManagerPackages },
      { path: "reports", Component: ManagerReports },
      { path: "users", Component: UsersManagement },
      { path: "analytics", Component: ManagerOverview }, // Reuse overview for now
      { path: "settings", Component: ManagerOverview }, // Reuse overview for now
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
          { path: "messages", Component: EmployerMessages },
          { path: "pricing", Component: EmployerBuyPosts }, // Buy posts page
          { path: "analytics", Component: EmployerAnalytics },
          { path: "billing", Component: EmployerBilling },
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
      { path: "profile", Component: Profile },
      { path: "*", Component: NotFound },
    ],
  },
]);