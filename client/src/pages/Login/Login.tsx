import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginUser(email, password);
            login(data.token);
            navigate("/documents");
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            {error && <p>{error}</p>}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;
