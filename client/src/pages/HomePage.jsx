import "../css/pages/HomePage.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function HomePage() {
    const { user } = useAuth();

    const isAdmin = user?.role === "admin";
    const isVoter = user?.role === "voter";

    return (
        <div className="home-page">
            {user ? (
                <div className="welcome-card">

                    {/* Icon */}
                    <div className="welcome-icon">
                        {isAdmin ? "⚙️" : "🗳️"}
                    </div>

                    {/* Badge */}
                    <span className="role-badge">
                        {isAdmin ? "Administrator" : "Voter"}
                    </span>

                    {/* Heading */}
                    <h1 className="welcome-heading">
                        {isAdmin
                            ? <>Welcome back, <span>Admin!</span></>
                            : <>Welcome, <span>{user.email.split("@")[0]}!</span></>}
                    </h1>

                    {/* Divider */}
                    <hr className="welcome-divider" />

                    {/* Sub-message */}
                    <p className="welcome-sub">
                        {isAdmin
                            ? "Manage elections, candidates, and positions from your admin panel. Keep the voting system running smoothly."
                            : "You're logged in to the Voting System. Browse open elections and cast your vote securely."}
                    </p>

                    {/* Quick-action buttons */}
                    <div className="welcome-actions">
                        {isAdmin && (
                            <>
                                <Link to="/admin/elections" className="action-btn primary">
                                    🗂 Manage Elections
                                </Link>
                                <Link to="/admin/candidates" className="action-btn secondary">
                                    👤 Candidates
                                </Link>
                                <Link to="/admin/positions" className="action-btn secondary">
                                    📋 Positions
                                </Link>
                            </>
                        )}
                        {isVoter && (
                            <Link to="/elections" className="action-btn primary">
                                🗳 View Elections
                            </Link>
                        )}
                    </div>

        

                </div>
            ) : (
                <p className="not-logged-in">Not logged in.</p>
            )}
        </div>
    );
}