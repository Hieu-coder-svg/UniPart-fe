import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { SavedJobsProvider } from "./contexts/SavedJobsContext";
import { NotificationProvider } from "./contexts/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SavedJobsProvider>
          <RouterProvider router={router} />
        </SavedJobsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}