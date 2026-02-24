import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SSRProvider } from "./context/SSRContext";

export default function AppWrapper({ ssrData = {} }) {
  return (
    <AuthProvider>
      <SSRProvider data={ssrData}>
        <AppRoutes />
      </SSRProvider>
    </AuthProvider>
  );
}