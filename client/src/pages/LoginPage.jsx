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
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br /><br />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br /><br />
                <button type="submit">Login</button>
            </form>

            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
}
