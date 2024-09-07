import React from "react";
import styles from "./Editor.module.css";
import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { HocuspocusProvider } from "@hocuspocus/provider";

interface EditorProps {
    provider: HocuspocusProvider;
}

const Editor: React.FC<EditorProps> = ({ provider }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            }),
            Collaboration.configure({
                document: provider.document,
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
        onUpdate: () => console.log("Editor updated"),
    });

    return <EditorContent className={styles.editor} editor={editor} />;
};

export default Editor;
