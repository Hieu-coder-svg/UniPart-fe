import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./app/contexts/AuthContext";
import { ProtectedRoute } from "./app/components/ProtectedRoute";
import Login from "./app/pages/Login";
import AdminDashboard from "./app/pages/AdminDashboard";
import EmployerDashboard from "./app/pages/EmployerDashboard";
import Unauthorized from "./app/pages/Unauthorized";
import VerifyOtp from "./app/pages/VerifyOtp";
import ForgotPassword from "./app/pages/ForgotPassword";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/verify-otp" component={VerifyOtp} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/unauthorized" component={Unauthorized} />
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute requiredRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/employer/dashboard">
        {() => (
          <ProtectedRoute requiredRoles={["EMPLOYER"]}>
            <EmployerDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
