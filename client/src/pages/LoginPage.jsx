import "../css/LoginPage.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            setResult("Login successful");
        } catch (err) {
            setResult(err.response?.data || err.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        />
                    </div>
                    <button type="submit" className="btn-submit">Login</button>
                </form>

                {result && (
                    <pre className="login-result">{JSON.stringify(result, null, 2)}</pre>
                )}
            </div>
        </div>
    );
}