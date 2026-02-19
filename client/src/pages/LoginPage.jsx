import "../css/pages/LoginPage.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult]     = useState(null);
    const [isError, setIsError]   = useState(false);
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            await login(email, password);
            setIsError(false);
            setResult("Login successful");
        } catch (err) {
            setIsError(true);
            setResult(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* Brand / logo slot */}
                <div className="login-brand">
                    <div className="brand-icon">
                        {/* simple lock icon — swap for your own logo */}
                        <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2>Welcome back</h2>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </Button>
                    </div>
                </form>

                {result && (
                    <div className={`login-result ${isError ? "error" : ""}`}>
                        {result}
                    </div>
                )}

            </div>
        </div>
    );
}