import React, { useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { generateHTML } from "@tiptap/html";
import { yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";
import styles from "./ReadOnlyEditor.module.css";

interface ReadOnlyEditorProps {
    content: { type: string; data: number[] };
}

const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ content }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        editable: false,
    });

    const extensions = [StarterKit];
    const xmlFragmentName = "default";

    const getHtmlFromByteArray = (
        editor: Editor,
        rawContent: Uint8Array
    ): any => {
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, rawContent);
        const yXmlFragment = ydoc.get(xmlFragmentName, Y.XmlFragment);
        const rootNode = yXmlFragmentToProseMirrorRootNode(
            yXmlFragment,
            editor.schema
        );
        return rootNode.toJSON(); // Return JSON, not HTML
    };

    useEffect(() => {
        if (editor && content) {
            const array = new Uint8Array(content.data);
            const jsonContent = getHtmlFromByteArray(editor, array);
            editor.commands.setContent(jsonContent); // Set content using JSON
        }
    }, [content, editor]);

    return <EditorContent className={styles.editor} editor={editor} />;
};

export default ReadOnlyEditor;
