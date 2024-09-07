import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./DocumentList.module.css";
import { useAuth } from "../../context/AuthContext";
import {
    createNewDocument,
    fetchDocuments,
    deleteDocument,
} from "../../api/documents";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { v4 } from "uuid";

interface JwtPayloadWithId extends JwtPayload {
    id: string;
}

interface DocumentVersion {
    _id: string;
    content: string;
    updatedBy: string;
    createdAt: string;
}

interface Document {
    _id: string;
    title: string;
    content: string;
    versions: DocumentVersion[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const navigate = useNavigate();
    const { token } = useAuth();

    const getUserIdFromToken = (token: string): string | null => {
        try {
            const decoded: JwtPayloadWithId = jwtDecode(token);
            return decoded.id;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const userId = token ? getUserIdFromToken(token) : null;

    useEffect(() => {
        const getDocuments = async () => {
            try {
                const data = await fetchDocuments();
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        getDocuments();
    }, []);

    const handleNewDocument = async () => {
        if (token) {
            try {
                const id = v4();
                const newDocument: Document = await createNewDocument(
                    id,
                    id,
                    token
                );

                setDocuments((prevDocs) => [...prevDocs, newDocument]);
                navigate(`/documents/${newDocument._id}`);
            } catch (error) {
                alert(`Failed to create document: ${error}`);
            }
        } else {
            alert("You need to be authenticated to create a document.");
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (token) {
            try {
                await deleteDocument(documentId, token);
                setDocuments((prevDocs) =>
                    prevDocs.filter((doc) => doc._id !== documentId)
                );
                alert("Document deleted successfully.");
            } catch (error) {
                alert(`Failed to delete document: ${error}`);
            }
        } else {
            alert("You need to be authenticated to delete a document.");
        }
    };

    return (
        <div className={styles.documentList}>
            <h2>Your Documents</h2>
            <button onClick={handleNewDocument} className={styles.newButton}>
                Start New Document
            </button>
            <ul className={styles.list}>
                {documents.map((doc) => (
                    <li key={doc._id} className={styles.listItem}>
                        <Link
                            to={`/documents/${doc._id}`}
                            className={styles.link}>
                            {doc.title}
                        </Link>
                        {doc.createdBy === userId && (
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteDocument(doc._id)}>
                                Delete
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocumentList;
