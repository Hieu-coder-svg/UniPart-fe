import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { SavedJobsProvider } from "./contexts/SavedJobsContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SavedJobsProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </SavedJobsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}