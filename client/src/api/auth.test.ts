import { describe, it, expect, vi, Mock } from 'vitest';
import { registerUser, loginUser } from "./auth";
import validator from "validator";

global.fetch = vi.fn();

describe("registerUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if the email format is invalid", async () => {
        await expect(registerUser("invalid-email", "password123")).rejects.toThrow(
            "Invalid email format"
        );
    });

    it("should throw an error if the password is less than 8 characters", async () => {
        await expect(registerUser("test@example.com", "short")).rejects.toThrow(
            "Password must be at least 8 characters long"
        );
    });

    it("should call the API with sanitized inputs and return a successful response", async () => {
        (fetch as Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "User registered successfully" }),
        });

        const response = await registerUser("test@example.com", "password123");
        expect(response).toEqual({ message: "User registered successfully" });

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: validator.normalizeEmail("test@example.com"),
                    password: validator.escape("password123"),
                }),
            }
        );
    });

    it("should throw an error when the API returns a failed response", async () => {
        (fetch as Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Registration failed" }),
        });

        await expect(registerUser("test@example.com", "password123")).rejects.toThrow(
            "Registration failed"
        );
    });
});

describe("loginUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if the email format is invalid", async () => {
        await expect(loginUser("invalid-email", "password123")).rejects.toThrow(
            "Invalid email format"
        );
    });

    it("should throw an error if the password is less than 8 characters", async () => {
        await expect(loginUser("test@example.com", "short")).rejects.toThrow(
            "Password must be at least 8 characters long"
        );
    });

    it("should call the API with sanitized inputs and return a successful response", async () => {
        (fetch as Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: "12345" }),
        });

        const response = await loginUser("test@example.com", "password123");
        expect(response).toEqual({ token: "12345" });

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: validator.normalizeEmail("test@example.com"),
                    password: validator.escape("password123"),
                }),
            }
        );
    });

    it("should throw an error when the API returns a failed response", async () => {
        (fetch as Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Login failed" }),
        });

        await expect(loginUser("test@example.com", "password123")).rejects.toThrow(
            "Login failed"
        );
    });
});
