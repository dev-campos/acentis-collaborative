import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./Editor.module.css";

const Editor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [content, setContent] = useState("");
    const editorRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        // Placeholder for setting up the WebSocket connection to fetch document content
        const setupWebSocket = () => {
            console.log(`Setting up WebSocket for document ID: ${id}`);
            // Placeholder for WebSocket connection setup
            const ws = new WebSocket(`ws://localhost:5001/documents/${id}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setContent(data.content);
            };

            return () => {
                ws.close();
                console.log("WebSocket connection closed");
            };
        };

        const cleanupWebSocket = setupWebSocket();

        return cleanupWebSocket;
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setContent(newValue);
        // Placeholder for sending content updates via WebSocket
        console.log("Content changed:", newValue);
    };

    return (
        <div className={styles.editor}>
            <h2>Editing Document: {id}</h2>
            <textarea
                ref={editorRef}
                value={content}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Start typing..."
            />
            <Link
                to={`/documents/${id}/history`}
                className={styles.historyLink}>
                View Version History
            </Link>
        </div>
    );
};

export default Editor;
