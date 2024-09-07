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
        // Fetch version history from the backend
        const fetchVersionHistory = async () => {
            const response = await fetch(`/api/document/${id}/versions`);
            const data = await response.json();
            setVersions(data);
        };

        fetchVersionHistory();
    }, [id]);

    const handleRollback = async (versionIndex: number) => {
        await fetch(`/api/document/rollback/${id}/${versionIndex}`, {
            method: "POST",
        });
        // Optionally, refresh the version list after rollback
        window.location.reload();
    };

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
                        <button onClick={() => handleRollback(index)}>
                            Rollback to this Version
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VersionHistory;
