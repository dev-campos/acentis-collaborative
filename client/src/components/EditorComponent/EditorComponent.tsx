import React from "react";
import styles from "./EditorComponent.module.css";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuth } from "../../context/AuthContext";
import { generateColorFromEmail } from "../../utils/utils";
import "./cursor.css";
import * as Y from "yjs";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";

interface EditorComponentProps {
    provider: HocuspocusProvider;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ provider }) => {
    const { email } = useAuth();
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            }),
            Collaboration.configure({
                document: provider?.document ?? new Y.Doc(),
            }),
            CollaborationCursor.configure({
                provider,
                user: {
                    name: email,
                    color: generateColorFromEmail(email || "Anonymous"),
                },
            }),
        ],
        editable: true,
        immediatelyRender: true,
        shouldRerenderOnTransaction: false,
        editorProps: {
            handleDOMEvents: {
                focus: () => console.log("Editor focused"),
                blur: () => console.log("Editor blurred"),
            },
        },
        onCreate: () => console.log("Editor created"),
    });

    return (
        <ErrorBoundary>
            <EditorContent
                data-testid="editor"
                className={styles.editor}
                editor={editor}
            />
        </ErrorBoundary>
    );
};

export default EditorComponent;
