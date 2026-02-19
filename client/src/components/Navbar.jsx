import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="logo">
                <h2>Voting System</h2>
            </div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>

                {/* Admin links */}
                {user?.role === "admin" && (
                    <>
                        <li><Link to="/admin/candidates">Candidates</Link></li>
                        <li><Link to="/admin/positions">Positions</Link></li>
                        <li><Link to="/admin/elections">Elections</Link></li>
                    </>
                )}
            </ul>

            <div className="nav-right">
                {user ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}
