import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
    const { isAuthenticated, isRegistered, logout } = useAuth();

    return (
        <header className={styles.header}>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/documents">Documents</Link>
                            </li>
                            <li>
                                <button onClick={logout}>Logout</button>
                            </li>
                        </>
                    ) : isRegistered ? (
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
