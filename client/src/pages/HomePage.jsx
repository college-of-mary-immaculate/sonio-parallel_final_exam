import "../css/HomePage.css";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const { user, logout } = useAuth();

    return (
        <div className="home-page">
            <h2>Home</h2>
            {user ? (
                <>
                    <p className="welcome-text">Welcome, {user.email}</p>
                    {/* logout-btn is a page-level override — red, not role-theme color */}
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
}