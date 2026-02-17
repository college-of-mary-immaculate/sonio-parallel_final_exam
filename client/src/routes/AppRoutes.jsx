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
                {/* Public routes wrapped in MainLayout WITHOUT navbar */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/" replace /> : <LoginPage />}
                    />
                </Route>

                {/* Protected routes wrapped in MainLayout WITH navbar */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout Navbar={Navbar} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<HomePage />} />
                    {/* Add more protected pages here */}
                    {/* <Route path="dashboard" element={<Dashboard />} /> */}
                    {/* <Route path="profile" element={<Profile />} /> */}
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
