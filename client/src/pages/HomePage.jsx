import "../css/HomePage.css";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h2>Home</h2>
            {user ? (
                <>
                    <p>Welcome {user.email}</p>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <p>Not logged in</p>
            )}
        </div>
    );
}
