import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SSRProvider } from "./context/SSRContext";

export default function AppWrapper({ ssrData = {} }) {
  return (
    <SSRProvider data={ssrData}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </SSRProvider>
  );
}