import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await loginUser(email, password);
            login(data.token, data.id, email);
            navigate("/documents");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageBackground}>
            <form onSubmit={handleLogin} className={styles.form}>
                {error && <p className={styles.error}>{error}</p>}
                <h2>Login to your account</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={loading}
                    className={styles.input}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={loading}
                    className={styles.input}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={styles.button}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
