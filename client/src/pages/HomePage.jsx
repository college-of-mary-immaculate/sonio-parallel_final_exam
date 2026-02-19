import "../css/pages/HomePage.css";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function HomePage() {
    const { user, logout } = useAuth();

    return (
        <div className="home-page">
            <h2>Home</h2>
            {user ? (
                <>
                    <p className="welcome-text">Welcome, {user.email}</p>

                    {/* variant="danger" → picks up --btn-danger-* from active role theme */}
                    <Button variant="danger" size="md" onClick={logout}>
                        Logout
                    </Button>
                </>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
}