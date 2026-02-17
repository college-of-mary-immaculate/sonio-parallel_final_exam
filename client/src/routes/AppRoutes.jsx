import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading app...</p>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/" replace /> : <LoginPage />
                    }
                />

                {/* Protected Route */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
