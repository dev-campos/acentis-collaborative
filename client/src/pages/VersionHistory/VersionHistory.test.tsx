import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import VersionHistory from "./VersionHistory";
import { fetchVersionHistory } from "../../api/documents";
import { vi, Mock } from "vitest";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key";

const defaultUser = {
    _id: "user123",
    email: "user@example.com",
    token: "",
};

const defaultToken = jwt.sign(
    { id: defaultUser._id, email: defaultUser.email },
    SECRET_KEY,
    { expiresIn: "1h" }
);

defaultUser.token = defaultToken;

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn(() => ({
        token: defaultUser.token,
        id: defaultUser._id,
        isAuthenticated: true,
        isRegistered: true,
        email: defaultUser.email,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
    })),
}));

vi.mock("../../api/documents", () => ({
    fetchVersionHistory: vi.fn(),
}));

describe("VersionHistory", () => {
    const documentId = "66e0e31ea7360ab20240e997";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call fetchVersionHistory with the correct document ID", async () => {
        const versions = [
            {
                _id: "version1",
                content: {
                    type: "Buffer",
                    data: [
                        1, 3, 195, 222, 157, 241, 5, 0, 7, 1, 7, 100, 101, 102,
                        97, 117, 108, 116, 3, 9, 112, 97, 114, 97, 103, 114, 97,
                        112, 104, 7, 0, 195, 222, 157, 241, 5, 0, 6, 4, 0, 195,
                        222, 157, 241, 5, 1, 1, 97, 0, 32, 33, 34, 35, 36, 37,
                        38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                    ],
                },
                updatedBy: "user1",
                createdAt: "2024-09-11T21:45:09.968Z",
            },
        ];
        (fetchVersionHistory as Mock).mockResolvedValue(versions);

        await act(async () => {
            render(
                <MemoryRouter
                    initialEntries={[`/documents/${documentId}/history`]}>
                    <Routes>
                        <Route
                            path="documents/:id/history"
                            element={<VersionHistory />}
                        />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(fetchVersionHistory).toHaveBeenCalledWith(documentId);
            expect(fetchVersionHistory).toHaveBeenCalledTimes(1);
        });
    });

    it("should display the version history after loading", async () => {
        const versions = [
            {
                _id: "version1",
                content: {
                    type: "Buffer",
                    data: [
                        1, 3, 195, 222, 157, 241, 5, 0, 7, 1, 7, 100, 101, 102,
                        97, 117, 108, 116, 3, 9, 112, 97, 114, 97, 103, 114, 97,
                        112, 104, 7, 0, 195, 222, 157, 241, 5, 0, 6, 4, 0, 195,
                        222, 157, 241, 5, 1, 1, 97, 0, 32, 33, 34, 35, 36, 37,
                        38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                    ],
                },
                updatedBy: "user1",
                createdAt: "2024-09-11T21:45:09.968Z",
            },
        ];
        (fetchVersionHistory as Mock).mockResolvedValue(versions);

        await act(async () => {
            render(
                <MemoryRouter
                    initialEntries={[`/documents/${documentId}/history`]}>
                    <Routes>
                        <Route
                            path="documents/:id/history"
                            element={<VersionHistory />}
                        />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("a")).toBeInTheDocument();
            expect(screen.getByText("user1")).toBeInTheDocument();
        });
    });

    it("should display an error message if fetchVersionHistory fails with invalid document ID", async () => {
        (fetchVersionHistory as Mock).mockRejectedValue(
            new Error("Invalid document ID")
        );

        await act(async () => {
            render(
                <MemoryRouter
                    initialEntries={[`/documents/${documentId}/history`]}>
                    <Routes>
                        <Route
                            path="documents/:id/history"
                            element={<VersionHistory />}
                        />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            const errorElement = screen.getByTestId("error");
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent("Invalid document ID");
        });
    });
});
