import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css"; // Import the CSS Module

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await registerUser(email, password);
            login(data.token, data.id, email);
            navigate("/documents");
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleRegister}
            data-testid="register-form"
            className={styles.form}>
            {error && (
                <p data-testid="error-message" className={styles.error}>
                    {error}
                </p>
            )}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                data-testid="email-input"
                className={styles.input}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
                data-testid="password-input"
                className={styles.input}
            />
            <button
                type="submit"
                disabled={loading}
                data-testid="submit-button"
                className={styles.button}>
                {loading ? "Registering..." : "Register"}
            </button>
        </form>
    );
};

export default Register;
