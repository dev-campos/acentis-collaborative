import { renderHook } from "@testing-library/react-hooks";
import { AuthProvider, useAuth } from "./AuthContext";
import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { ReactNode, FunctionComponent, act } from "react";

const secretKey = "8sEJlZ8gO2WLQHkB";

const generateMockJWT = () => {
    return jwt.sign({ id: "mock-id", email: "mock-email" }, secretKey, {
        expiresIn: "1h",
    });
};

const mockLocalStorage = () => {
    const storage = new Map();

    return {
        getItem: (key: string) => storage.get(key) || null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
    };
};

describe("AuthContext", () => {
    const Wrapper: FunctionComponent<{ children: ReactNode }> = ({
        children,
    }) => {
        return <AuthProvider>{children}</AuthProvider>;
    };

    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: mockLocalStorage(),
        });
    });

    it("should update isAuthenticated when login is called with a valid (non-expired) JWT", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

        expect(result.current.isAuthenticated).toBe(false);

        const mockToken = generateMockJWT();

        act(() => {
            result.current.login(mockToken, "mock-id", "mock-email");
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.token).toBe(mockToken);
        expect(result.current.email).toBe("mock-email");
    });

    it("should update isAuthenticated to false when logout is called", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

        const mockToken = generateMockJWT();
        act(() => {
            result.current.login(mockToken, "mock-id", "mock-email");
        });

        expect(result.current.isAuthenticated).toBe(true);

        act(() => {
            result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
    });
});
