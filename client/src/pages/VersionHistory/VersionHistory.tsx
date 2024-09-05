import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./VersionHistory.module.css";

interface Version {
    timestamp: string;
    author: string;
    content: string;
}

const VersionHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [versions, setVersions] = useState<Version[]>([]);

    useEffect(() => {
        // Placeholder for fetching version history from the server
        const fetchVersionHistory = async () => {
            console.log(
                `Fetching version history for document ID: ${id} (placeholder)`
            );
            const fetchedVersions: Version[] = [
                {
                    timestamp: "2024-09-01T10:00:00Z",
                    author: "User1",
                    content: "Version 1 content",
                },
                {
                    timestamp: "2024-09-02T12:00:00Z",
                    author: "User2",
                    content: "Version 2 content",
                },
            ];
            setVersions(fetchedVersions);
        };

        fetchVersionHistory();
    }, [id]);

    return (
        <div className={styles.versionHistory}>
            <h3>Version History for Document: {id}</h3>
            <Link to={`/documents/${id}`} className={styles.backLink}>
                Back to Editor
            </Link>
            <ul className={styles.versionList}>
                {versions.map((version, index) => (
                    <li key={index}>
                        <div>
                            <strong>{version.timestamp}</strong> by{" "}
                            {version.author}
                        </div>
                        <pre>{version.content}</pre>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VersionHistory;
