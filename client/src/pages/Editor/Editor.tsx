import styles from "./Editor.module.css";

import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

const Editor = () => {
    const ydoc = new Y.Doc();
    new WebsocketProvider(
        "ws://localhost:3000",
        "tiptap-collaboration-room",
        ydoc
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            }),
            Collaboration.configure({
                document: ydoc,
            }),
        ],
        immediatelyRender: true,
        shouldRerenderOnTransaction: false,
    });

    return <EditorContent className={styles.editor} editor={editor} />;
};

export default Editor;
