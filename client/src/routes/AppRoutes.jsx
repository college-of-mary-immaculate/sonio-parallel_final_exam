import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading app...</p>;

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route: Login page with MainLayout without navbar */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <MainLayout>
                                <LoginPage />
                            </MainLayout>
                        )
                    }
                />

                {/* Protected Route: Home page with MainLayout and navbar */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout Navbar={Navbar}>
                                <HomePage />
                            </MainLayout>
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
