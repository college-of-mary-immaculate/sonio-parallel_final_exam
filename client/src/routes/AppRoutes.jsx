import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import AdminCandidatesPage from "../pages/admin/AdminCandidatesPage";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading app...</p>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/" replace /> : <LoginPage />}
                    />
                </Route>

                {/* Authenticated routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout Navbar={Navbar} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<HomePage />} />
                </Route>

                {/* Admin-only routes */}
                <Route
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <MainLayout Navbar={Navbar} />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/admin/candidates"
                        element={<AdminCandidatesPage />}
                    />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
