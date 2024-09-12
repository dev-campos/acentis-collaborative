import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext"; // Import your AuthProvider
import Login from "./Login";
import { loginUser } from "../../api/auth";

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
        // Assert the inputs are disabled when loading is true
        expect(screen.getByPlaceholderText("Email")).toBeDisabled();
        expect(screen.getByPlaceholderText("Password")).toBeDisabled();
    });
});

test("displays error message on failed login", async () => {
    // Mock the loginUser function to reject with an error
    (loginUser as vi.Mock).mockRejectedValue(new Error("Invalid credentials"));

    render(
        <AuthProvider>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </AuthProvider>
    );

    // Trigger the input changes and form submission
    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    // Wait for the error message to be displayed
    await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
