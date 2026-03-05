import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import AdminCandidatesPage from "../pages/admin/AdminCandidatesPage";
import AdminPositionsPage from "../pages/admin/AdminPositionsPage";
import AdminElectionsPage from "../pages/admin/AdminElectionsPage";
import AdminElectionDetailPage from "../pages/admin/pages/AdminElectionDetailpage";
import UserElectionsPage from "../pages/user/UserElectionsPage";
import BallotPage from "../pages/user/BallotPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Navbar from "../components/Navbar";

const isBrowser = typeof window !== "undefined";

function AppRoutes() {
  const { user, loading } = useAuth();

  console.log('[AppRoutes] render — user:', user, 'loading:', loading)

  if (isBrowser && loading) {
    console.log('[AppRoutes] still loading, returning null')
    return null;
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<MainLayout />}>
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === "admin" ? "/admin/elections" : "/"} replace />
              : <LoginPage />
          }
        />
      </Route>

      {/* AUTHENTICATED USERS (admin + voter) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout Navbar={Navbar} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/elections" element={<UserElectionsPage />} />
        <Route path="/vote/:electionId" element={<BallotPage />} />
      </Route>

      {/* ADMIN ONLY */}
      <Route
        element={
          <ProtectedRoute roles={["admin"]}>
            <MainLayout Navbar={Navbar} />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
        <Route path="/admin/positions" element={<AdminPositionsPage />} />
        <Route path="/admin/elections" element={<AdminElectionsPage />} />
        <Route
          path="/admin/elections/:electionId"
          element={<AdminElectionDetailPage />}
        />
      </Route>

      {/* FALLBACK — send to login if not authenticated, home if authenticated */}
      <Route
        path="*"
        element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;