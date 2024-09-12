import React, { useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";
import styles from "./ReadOnlyEditor.module.css";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";

interface ReadOnlyEditorProps {
    content: { type: string; data: number[] };
}

const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ content }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        editable: false,
    });

    const xmlFragmentName = "default";

    const getHtmlFromByteArray = (
        editor: Editor,
        rawContent: Uint8Array
    ): { type: string; content: any[] } => {
        try {
            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, rawContent);
            const yXmlFragment = ydoc.get(xmlFragmentName, Y.XmlFragment);
            const rootNode = yXmlFragmentToProseMirrorRootNode(
                yXmlFragment,
                editor.schema
            );
            return rootNode.toJSON() as { type: string; content: any[] };
        } catch (error) {
            console.error("Error processing content:", error);
            return { type: "doc", content: [] };
        }
    };

    useEffect(() => {
        if (editor && content) {
            if (content.data.length > 0) {
                const array = new Uint8Array(content.data);
                const jsonContent = getHtmlFromByteArray(editor, array);
                editor.commands.setContent(jsonContent);
            }
        }
    }, [content, editor]);

    return (
        <ErrorBoundary>
            <EditorContent
                data-testid="roeditor"
                className={styles.editor}
                editor={editor}
            />
        </ErrorBoundary>
    );
};

export default ReadOnlyEditor;
