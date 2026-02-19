import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";

import AdminCandidatesPage from "../pages/admin/AdminCandidatesPage";
import AdminPositionsPage from "../pages/admin/AdminPositionsPage";
import AdminElectionsPage from "../pages/admin/AdminElectionsPage";
import AdminElectionConfigPage from "../pages/admin/pages/AdminElectionConfigPage"; // NEW

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading app...</p>;

    return (
        <BrowserRouter>
            <Routes>

                {/* ================= PUBLIC ROUTES ================= */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/" replace /> : <LoginPage />}
                    />
                </Route>


                {/* ================= AUTHENTICATED ROUTES ================= */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout Navbar={Navbar} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<HomePage />} />
                </Route>


                {/* ================= ADMIN ROUTES ================= */}
                <Route
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <MainLayout Navbar={Navbar} />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
                    <Route path="/admin/positions" element={<AdminPositionsPage />} />

                    {/* Election Management */}
                    <Route path="/admin/elections" element={<AdminElectionsPage />} />

                    {/* NEW: Election Config Page */}
                    <Route
                        path="/admin/elections/:electionId"
                        element={<AdminElectionConfigPage />}
                    />
                </Route>


                {/* ================= FALLBACK ================= */}
                <Route path="*" element={<Navigate to="/" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
