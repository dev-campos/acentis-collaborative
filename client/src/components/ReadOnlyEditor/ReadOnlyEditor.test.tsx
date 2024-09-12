import { render, screen } from "@testing-library/react";
import ReadOnlyEditor from "./ReadOnlyEditor";

describe("ReadOnlyEditor", () => {
    it("should render the EditorContent component", () => {
        render(<ReadOnlyEditor content={{ type: "Buffer", data: [] }} />);
        expect(screen.getByTestId("roeditor")).toBeInTheDocument();
    });

    it("should initialize the editor with the correct content", async () => {
        const content = {
            type: "Buffer",
            data: [
                1, 3, 195, 222, 157, 241, 5, 0, 7, 1, 7, 100, 101, 102, 97, 117,
                108, 116, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0,
                195, 222, 157, 241, 5, 0, 6, 4, 0, 195, 222, 157, 241, 5, 1, 1,
                97, 0,
            ],
        };

        render(<ReadOnlyEditor content={content} />);

        const editorElement = screen.getByTestId("roeditor");

        expect(editorElement).toBeInTheDocument();

        expect(editorElement.innerHTML).toContain("<p>a</p>");
    });

    it("should render empty state when no content is provided", () => {
        render(<ReadOnlyEditor content={{ type: "Buffer", data: [] }} />);
        const editorElement = screen.getByTestId("roeditor");
        expect(editorElement).toBeInTheDocument();
        expect(editorElement.innerHTML).toBe(
            '<div contenteditable="false" translate="no" class="tiptap ProseMirror"><p><br class="ProseMirror-trailingBreak"></p></div>'
        );
    });

    it("should render with contenteditable set to false", () => {
        render(<ReadOnlyEditor content={{ type: "Buffer", data: [] }} />);
        const editorContent = screen
            .getByTestId("roeditor")
            .querySelector(".ProseMirror");
        expect(editorContent).toHaveAttribute("contenteditable", "false");
    });
});
