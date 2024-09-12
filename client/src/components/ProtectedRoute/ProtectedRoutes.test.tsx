import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "../../context/AuthContext";
import { describe, it, expect, vi } from "vitest";

const mockAuthContext = (isAuthenticated: boolean) => ({
    isAuthenticated,
    isRegistered: true,
    token: isAuthenticated ? "mock-token" : null,
    id: isAuthenticated ? "mock-id" : null,
    email: isAuthenticated ? "test@example.com" : null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
});

describe("ProtectedRoute", () => {
    const renderWithAuth = (isAuthenticated: boolean) => {
        return render(
            <AuthContext.Provider value={mockAuthContext(isAuthenticated)}>
                <MemoryRouter initialEntries={["/protected"]}>
                    <Routes>
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    it("renders the protected component when authenticated", () => {
        const { getByText } = renderWithAuth(true);
        expect(getByText("Protected Content")).toBeInTheDocument();
    });

    it("redirects to login when not authenticated", () => {
        const { getByText } = renderWithAuth(false);
        expect(getByText("Login Page")).toBeInTheDocument();
    });
});
