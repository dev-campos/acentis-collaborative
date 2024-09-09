import React from "react";
import styles from "./EditorComponent.module.css";
import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HocuspocusProvider } from "@hocuspocus/provider";

interface EditorComponentProps {
    provider: HocuspocusProvider;
}

const EditorComponent: React.FC<EditorComponentProps> = ({ provider }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            }),
            Collaboration.configure({
                document: provider?.document || null,
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

    return <EditorContent className={styles.editor} editor={editor} />;
};

export default EditorComponent;
