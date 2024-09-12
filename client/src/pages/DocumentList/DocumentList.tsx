import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./DocumentList.module.css";
import { useAuth } from "../../context/AuthContext";
import {
    createNewDocument,
    fetchDocuments,
    deleteDocument,
} from "../../api/documents";

interface Version {
    _id: string;
    createdAt: string;
    updatedBy: string;
    content: { type: string; data: number[] };
}

interface Document {
    _id: string;
    title: string;
    content: string;
    versions: Version[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token, id } = useAuth();

    useEffect(() => {
        const getDocuments = async () => {
            setLoading(true);
            try {
                const data = await fetchDocuments();
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        };

        getDocuments();
    }, []);

    const handleNewDocument = async () => {
        if (token) {
            setLoading(true);
            try {
                const newDocument: Document = await createNewDocument(token);

                setDocuments((prevDocs) => [...prevDocs, newDocument]);
                navigate(`/documents/${newDocument._id}`);
            } catch (error) {
                alert(`Failed to create document: ${error}`);
            } finally {
                setLoading(false);
            }
        } else {
            alert("You need to be authenticated to create a document.");
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (token) {
            setLoading(true);
            try {
                await deleteDocument(documentId, token);
                setDocuments((prevDocs) =>
                    prevDocs.filter((doc) => doc._id !== documentId)
                );
                alert("Document deleted successfully.");
            } catch (error) {
                alert(`Failed to delete document: ${error}`);
            } finally {
                setLoading(false);
            }
        } else {
            alert("You need to be authenticated to delete a document.");
        }
    };

    return (
        <div className={styles.pageBackground}>
            <div className={styles.documentList} data-testid="document-list">
                <h2>Your Documents</h2>
                <button
                    onClick={handleNewDocument}
                    className={styles.newButton}
                    disabled={loading}
                    data-testid="new-document-button">
                    {loading ? "Loading..." : "Start New Document"}
                </button>
                {loading && (
                    <p data-testid="loading-text">Loading documents...</p>
                )}
                {!loading && documents && documents.length === 0 && (
                    <p data-testid="no-docs-text">No Documents</p>
                )}

                {!loading && documents && documents.length > 0 && (
                    <ul className={styles.list} data-testid="document-items">
                        {documents.map((doc) => (
                            <li
                                key={doc._id}
                                className={styles.listItem}
                                data-testid={`document-${doc._id}`}>
                                <Link
                                    to={`/documents/${doc._id}`}
                                    className={styles.link}
                                    data-testid={`document-link-${doc._id}`}>
                                    {doc.title}
                                </Link>
                                {doc.createdBy === id && (
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() =>
                                            handleDeleteDocument(doc._id)
                                        }
                                        disabled={loading}
                                        data-testid={`delete-document-${doc._id}`}>
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
