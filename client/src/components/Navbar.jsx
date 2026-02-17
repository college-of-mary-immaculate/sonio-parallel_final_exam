import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <h2>Voting System</h2>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                {/* Add more links as needed */}
            </ul>
        </nav>
    );
}
