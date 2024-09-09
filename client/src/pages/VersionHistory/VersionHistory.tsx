import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchVersionHistory, rollbackDocument } from "../../api/documents";
import styles from "./VersionHistory.module.css";

interface Version {
    _id: string;
    createdAt: string;
    updatedBy: string;
    content: string;
}

const VersionHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [versions, setVersions] = useState<Version[]>([]);

    useEffect(() => {
        const getVersionHistory = async () => {
            try {
                const data = await fetchVersionHistory(id!, token!);
                const sortedVersions = data.sort(
                    (a: Version, b: Version) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
                setVersions(sortedVersions);
            } catch (error) {
                console.error("Error fetching version history:", error);
            }
        };

        getVersionHistory();
    }, [id, token]);

    const handleRollback = async (versionId: string) => {
        try {
            await rollbackDocument(id!, versionId, token!);
            window.location.reload();
        } catch (error) {
            console.error("Error performing rollback:", error);
        }
    };

    return (
        <div className={styles.versionHistory}>
            <h3>Version History for Document: {id}</h3>
            <Link to={`/documents/${id}`} className={styles.backLink}>
                Back to Editor
            </Link>
            <ul className={styles.versionList}>
                {versions.map((version) => (
                    <li key={version._id}>
                        <div>
                            <strong>
                                {new Date(version.createdAt).toLocaleString()}
                            </strong>{" "}
                            by {version.updatedBy}
                        </div>
                        <pre>{version.content}</pre>
                        <button onClick={() => handleRollback(version._id)}>
                            Rollback to this Version
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VersionHistory;
