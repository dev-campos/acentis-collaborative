import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DocumentList from "./DocumentList";
import {
    createNewDocument,
    fetchDocuments,
    deleteDocument,
} from "../../api/documents";
import jwt from "jsonwebtoken";
import { useAuth } from "../../context/AuthContext";
const SECRET_KEY = "your-secret-key";

const defaultUser = {
    _id: "user123",
    email: "user@example.com",
    token: "",
};

const differentUser = {
    _id: "user456",
    email: "different@example.com",
    token: "",
};

const defaultToken = jwt.sign(
    { id: defaultUser._id, email: defaultUser.email },
    SECRET_KEY,
    { expiresIn: "1h" }
);

const differentToken = jwt.sign(
    { id: differentUser._id, email: differentUser.email },
    SECRET_KEY,
    { expiresIn: "1h" }
);

defaultUser.token = defaultToken;
differentUser.token = differentToken;

const createMockAuth = (
    user: {
        _id: string;
        email: string;
        token: string;
    } | null = null
) => {
    if (user) {
        return {
            token: user.token,
            id: user._id,
            isAuthenticated: true,
            isRegistered: true,
            email: user.email,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
        };
    } else {
        return {
            token: null,
            id: null,
            isAuthenticated: false,
            isRegistered: false,
            email: "",
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
        };
    }
};

vi.mock("../../context/AuthContext", () => ({
    useAuth: vi.fn((user) => createMockAuth(user)),
}));

vi.mock("../../api/documents", () => ({
    createNewDocument: vi.fn(),
    fetchDocuments: vi.fn(),
    deleteDocument: vi.fn(),
}));

describe("DocumentList", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    it("should render the component", async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });
        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
        await waitFor(() =>
            expect(screen.getByTestId("document-list")).toBeInTheDocument()
        );
    });

    it("should fetch and display documents on mount", async () => {
        const mockDocuments = [
            {
                _id: "1",
                title: "Document 1",
                createdBy: defaultUser._id,
                content: "",
            },
        ];

        (fetchDocuments as vi.Mock).mockResolvedValue(mockDocuments);

        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
        await waitFor(() => expect(fetchDocuments).toHaveBeenCalled());
        expect(screen.getByTestId("document-link-1")).toBeInTheDocument();
    });

    it("should display loading state while fetching documents", async () => {
        (fetchDocuments as vi.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
        );

        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });

        expect(screen.getByTestId("loading-text")).toBeInTheDocument();

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
    });

    it("should handle error while fetching documents", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        (fetchDocuments as vi.Mock).mockRejectedValue(
            new Error("Failed to fetch")
        );

        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
        await waitFor(() =>
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error fetching documents:",
                expect.any(Error)
            )
        );
        consoleErrorSpy.mockRestore();
    });

    it("should create a new document when the button is clicked", async () => {
        (useAuth as vi.Mock).mockImplementation(() =>
            createMockAuth(defaultUser)
        );
        const mockNewDocument = {
            _id: "2",
            title: "New Document",
            createdBy: defaultUser._id,
            content: "",
        };

        (fetchDocuments as vi.Mock).mockResolvedValue([]);
        (createNewDocument as vi.Mock).mockResolvedValue(mockNewDocument);

        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });

        expect(screen.getByTestId("new-document-button")).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByTestId("new-document-button"));
        });

        await waitFor(() => {
            expect(createNewDocument).toHaveBeenCalled();
            expect(screen.getByTestId("document-link-2")).toBeInTheDocument();
        });
    });

    it("should only show delete button if the user is the document creator", async () => {
        (useAuth as vi.Mock).mockImplementation(() =>
            createMockAuth(defaultUser)
        );
        const mockDocuments = [
            {
                _id: "66e0e31ea7360ab20240e997",
                title: "No title set",
                createdBy: defaultUser._id,
                content: "",
            },
            {
                _id: "66e1bdee816e1420be044fe7",
                title: "Document 2",
                createdBy: "otherUser",
                content: "",
            },
        ];

        (fetchDocuments as vi.Mock).mockResolvedValue(mockDocuments);

        render(
            <MemoryRouter>
                <DocumentList />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
        await waitFor(() => expect(fetchDocuments).toHaveBeenCalled());

        expect(
            screen.getByTestId("delete-document-66e0e31ea7360ab20240e997")
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId("delete-document-66e1bdee816e1420be044fe7")
        ).not.toBeInTheDocument();
    });

    it("should delete a document when the delete button is clicked", async () => {
        (useAuth as vi.Mock).mockImplementation(() =>
            createMockAuth(defaultUser)
        );
        const mockDocuments = [
            {
                _id: "66e0e31ea7360ab20240e997",
                title: "No title set",
                createdBy: defaultUser._id,
                content: "",
            },
        ];

        (fetchDocuments as vi.Mock).mockResolvedValue(mockDocuments);

        render(
            <MemoryRouter>
                <DocumentList />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );
        await waitFor(() => expect(fetchDocuments).toHaveBeenCalled());
        fireEvent.click(
            screen.getByTestId("delete-document-66e0e31ea7360ab20240e997")
        );

        await waitFor(() =>
            expect(deleteDocument).toHaveBeenCalledWith(
                "66e0e31ea7360ab20240e997",
                defaultToken
            )
        );
    });

    it("should not show delete if the user the is not the document creator", async () => {
        (useAuth as vi.Mock).mockImplementation(() =>
            createMockAuth(differentUser)
        );
        const mockDocuments = [
            {
                _id: "66e0e31ea7360ab20240e997",
                title: "No title set",
                createdBy: defaultUser._id,
                content: "",
            },
        ];

        (fetchDocuments as vi.Mock).mockResolvedValue(mockDocuments);

        await act(async () => {
            render(
                <MemoryRouter>
                    <DocumentList />
                </MemoryRouter>
            );
        });

        await waitFor(() =>
            expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument()
        );

        await waitFor(() => {
            expect(
                screen.getByTestId("document-66e0e31ea7360ab20240e997")
            ).toBeInTheDocument();

            expect(
                screen.queryByTestId("document-delete-66e0e31ea7360ab20240e997")
            ).not.toBeInTheDocument();
        });
    });
});
