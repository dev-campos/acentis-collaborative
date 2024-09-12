import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Login from "./Login";
import { loginUser } from "../../api/auth";
import { Mock } from "vitest";

vi.mock("../../api/auth", () => ({
    loginUser: vi.fn(),
}));

test("disables inputs and shows loading while logging in", async () => {
    (loginUser as jest.Mock).mockResolvedValueOnce({
        token: "fake-token",
        id: "user-id",
    });

    render(
        <AuthProvider>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
        expect(screen.getByPlaceholderText("Email")).toBeDisabled();
        expect(screen.getByPlaceholderText("Password")).toBeDisabled();
    });
});

test("displays error message on failed login", async () => {
    (loginUser as Mock).mockRejectedValue(new Error("Invalid credentials"));

    render(
        <AuthProvider>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
