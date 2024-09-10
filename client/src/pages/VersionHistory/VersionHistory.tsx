import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchVersionHistory, rollbackDocument } from "../../api/documents";
import styles from "./VersionHistory.module.css";
import ReadOnlyEditor from "../../components/ReadOnlyEditor/ReadOnlyEditor";

interface Version {
    _id: string;
    createdAt: string;
    updatedBy: string;
    content: { type: string; data: number[] };
}

const VersionHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getVersionHistory = async () => {
            try {
                setLoading(true);
                const data = await fetchVersionHistory(id!);

                const sortedVersions = data.sort(
                    (a: Version, b: Version) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                setVersions(sortedVersions);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        getVersionHistory();
    }, [id, token]);

    const handleRollback = async (versionId: string) => {
        try {
            await rollbackDocument(id!, versionId, token!);
        } catch (error) {
            console.error("Error performing rollback:", error);
        }

        window.location.href = `/documents/${id}`;
    };

    if (loading) {
        return <div>Loading versions...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

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
                            {version.updatedBy}
                        </div>
                        <ReadOnlyEditor content={version.content} />
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
