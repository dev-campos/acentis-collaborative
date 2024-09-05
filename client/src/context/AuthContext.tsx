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
    login: (token: string) => void;
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
        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
        } else {
            logout();
        }

        const registeredStatus = localStorage.getItem("isRegistered");
        if (registeredStatus) {
            setIsRegistered(true);
        }
    }, []);

    const login = (newToken: string) => {
        if (!isTokenExpired(newToken)) {
            setToken(newToken);
            localStorage.setItem("token", newToken);
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
        localStorage.removeItem("token");
        localStorage.removeItem("isRegistered");
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!token,
                isRegistered,
                token,
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
