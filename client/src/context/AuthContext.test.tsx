import { render, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { FunctionComponent, ReactNode } from "react";

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

    it("should update isAuthenticated when login is called with a valid (non-expired) JWT", async () => {
        let authContext: any;

        const TestComponent = () => {
            authContext = useAuth();
            return null;
        };

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        expect(authContext.isAuthenticated).toBe(false);

        const mockToken = generateMockJWT();

        await act(async () => {
            await authContext.login(mockToken, "mock-id", "mock-email");
        });

        expect(authContext.isAuthenticated).toBe(true);
        expect(authContext.token).toBe(mockToken);
        expect(authContext.email).toBe("mock-email");
    });

    it("should update isAuthenticated to false when logout is called", async () => {
        let authContext: any;

        const TestComponent = () => {
            authContext = useAuth();
            return null;
        };

        render(
            <Wrapper>
                <TestComponent />
            </Wrapper>
        );

        const mockToken = generateMockJWT();

        await act(async () => {
            await authContext.login(mockToken, "mock-id", "mock-email");
        });

        expect(authContext.isAuthenticated).toBe(true);

        await act(async () => {
            await authContext.logout();
        });

        expect(authContext.isAuthenticated).toBe(false);
    });
});
