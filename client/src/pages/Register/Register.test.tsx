import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Register from "./Register";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../api/auth";

// Mock the useAuth hook
vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

// Mock the registerUser function
vi.mock("../../api/auth", () => ({
    registerUser: vi.fn(),
}));

describe("Register Component", () => {
    const mockLogin = vi.fn();

    beforeEach(() => {
        (useAuth as Mock).mockReturnValue({ login: mockLogin });
    });

    it("renders the register form", () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        expect(screen.getByTestId("register-form")).toBeInTheDocument();
        expect(screen.getByTestId("email-input")).toBeInTheDocument();
        expect(screen.getByTestId("password-input")).toBeInTheDocument();
        expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("handles successful registration", async () => {
        (registerUser as Mock).mockResolvedValue({
            token: "mockToken",
            id: "mockId",
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );
        });

        fireEvent.change(screen.getByTestId("email-input"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("password-input"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith(
                "mockToken",
                "mockId",
                "test@example.com"
            );
            expect(window.location.pathname).toBe("/documents");
        });
    });

    it("handles registration error", async () => {
        (registerUser as Mock).mockRejectedValue(new Error("Invalid email"));

        await act(async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );
        });

        fireEvent.change(screen.getByTestId("email-input"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("password-input"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(screen.getByTestId("error-message")).toHaveTextContent(
                "Invalid email"
            );
        });
    });

    it("disables form inputs and button when loading", async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            );
        });

        fireEvent.change(screen.getByTestId("email-input"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByTestId("password-input"), {
            target: { value: "password123" },
        });
        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(screen.getByTestId("email-input")).toBeDisabled();
            expect(screen.getByTestId("password-input")).toBeDisabled();
            expect(screen.getByTestId("submit-button")).toBeDisabled();
        });
    });
});
