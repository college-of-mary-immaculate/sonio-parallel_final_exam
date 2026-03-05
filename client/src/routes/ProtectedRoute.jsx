import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isBrowser = typeof window !== "undefined";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    // On the SERVER: skip all auth checks — just render the children
    // The page will render with SSR data, and the client will re-check auth after hydration
    if (!isBrowser) return children;

    // On the CLIENT: normal auth guard
    if (loading) return <p>Loading...</p>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}