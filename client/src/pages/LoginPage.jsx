import "../css/pages/LoginPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult]     = useState(null);
    const [isError, setIsError]   = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    console.log('[LoginPage] render — user:', user, 'loading:', loading)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        console.log('[LoginPage] handleSubmit fired, email:', email)
        try {
            console.log('[LoginPage] calling login()...')
            await login(email, password);
            console.log('[LoginPage] login() success — navigating to /')
            setIsError(false);
            navigate("/", { replace: true });
        } catch (err) {
            console.error('[LoginPage] login() threw:', err)
            console.error('[LoginPage] error response:', err.response?.data)
            setIsError(true);
            setResult(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2>Welcome back</h2>
                    <p>Sign in to your account to continue</p>
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
                        <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
                            {isLoading ? "Signing in…" : "Sign in"}
                        </Button>
                    </div>
                </form>

                {result && (
                    <div className={`login-result ${isError ? "error" : "success"}`}>
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}