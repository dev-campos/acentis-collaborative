import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, vi } from "vitest";
import EditorComponent from "./EditorComponent";
import { useAuth } from "../../context/AuthContext";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

vi.mock("../../context/AuthContext", () => ({
    useAuth: () => ({
        email: "test@example.com",
    }),
}));

vi.mock("@tiptap/extension-collaboration", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

vi.mock("@tiptap/extension-collaboration-cursor", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

vi.mock("@tiptap/extension-document", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

vi.mock("@tiptap/extension-paragraph", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

vi.mock("@tiptap/extension-placeholder", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

vi.mock("@tiptap/extension-text", () => ({
    default: {
        configure: vi.fn(() => ({
            addProseMirrorPlugins: vi.fn(() => []),
        })),
    },
}));

const MockHocuspocusProvider: Partial<HocuspocusProvider> = {
    document: new Y.Doc(),
    unsyncedChanges: 0,
};

describe("EditorComponent", () => {
    const mockProvider = MockHocuspocusProvider as HocuspocusProvider;

    test("should render the editor", () => {
        render(<EditorComponent provider={mockProvider} />);
        const editorElement = screen.getByTestId("editor");
        expect(editorElement).toBeInTheDocument();
    });

    test("should initialize the editor with the correct extensions", () => {
        render(<EditorComponent provider={mockProvider} />);
        const editorElement = screen.getByTestId("editor");
        expect(editorElement).toBeInTheDocument();
    });

    test("should handle focus and blur events", () => {
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        render(<EditorComponent provider={mockProvider} />);

        const editorElement = document.querySelector(".tiptap.ProseMirror");

        if (editorElement) {
            fireEvent.focus(editorElement);
            expect(logSpy).toHaveBeenCalledWith("Editor focused");

            fireEvent.blur(editorElement);
            expect(logSpy).toHaveBeenCalledWith("Editor blurred");
        } else {
            throw new Error("Editor element not found");
        }

        logSpy.mockRestore();
    });

    test("should handle user data correctly for collaboration", () => {
        render(<EditorComponent provider={mockProvider} />);
        const email = useAuth().email;
        expect(email).toBe("test@example.com");
    });
});
