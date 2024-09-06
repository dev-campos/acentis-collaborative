import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./DocumentList.module.css";
import { v4 as uuidv4 } from "uuid";

interface Document {
    id: string;
    title: string;
}

const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setDocuments([]);
    }, []);

    const handleNewDocument = () => {
        const newDocumentId = uuidv4(); // Simulate creating a new document
        navigate(`/documents/${newDocumentId}`);
    };

    return (
        <div className={styles.documentList}>
            <h2>Your Documents</h2>
            <button onClick={handleNewDocument} className={styles.newButton}>
                Start New Document
            </button>
            <ul className={styles.list}>
                {documents.map((doc) => (
                    <li key={doc.id}>
                        <Link
                            to={`/documents/${doc.id}`}
                            className={styles.link}>
                            {doc.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocumentList;
