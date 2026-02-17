import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

export default function AppWrapper() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
