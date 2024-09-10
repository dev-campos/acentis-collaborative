import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    isAuthenticated: boolean;
    isRegistered: boolean;
    token: string | null;
    id: string | null;
    email: string | null;
    login: (token: string, id: string, email: string) => void;
    register: () => void;
    logout: () => void;
}

interface DecodedToken {
    exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [id, setId] = useState<string | null>(localStorage.getItem("id"));
    const [email, setEmail] = useState<string | null>(
        localStorage.getItem("email")
    );
    const [isRegistered, setIsRegistered] = useState<boolean>(
        !!localStorage.getItem("isRegistered")
    );

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch {
            return true;
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedId = localStorage.getItem("id");
        const storedEmail = localStorage.getItem("email");

        if (
            storedToken &&
            !isTokenExpired(storedToken) &&
            storedId &&
            storedEmail
        ) {
            setToken(storedToken);
            setId(storedId);
            setEmail(storedEmail);
        } else {
            logout();
        }

        setIsRegistered(!!localStorage.getItem("isRegistered"));
    }, []);

    const login = (newToken: string, id: string, email: string) => {
        if (!isTokenExpired(newToken)) {
            setToken(newToken);
            setId(id);
            setEmail(email);
            localStorage.setItem("token", newToken);
            localStorage.setItem("id", id);
            localStorage.setItem("email", email);
        } else {
            logout();
        }
    };

    const register = () => {
        setIsRegistered(true);
        localStorage.setItem("isRegistered", "true");
    };

    const logout = () => {
        setToken(null);
        setIsRegistered(false);
        setId(null);
        setEmail(null);
        localStorage.removeItem("token");
        localStorage.removeItem("isRegistered");
        localStorage.removeItem("id");
        localStorage.removeItem("email");
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!token,
                isRegistered,
                token,
                id,
                email,
                login,
                register,
                logout,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
