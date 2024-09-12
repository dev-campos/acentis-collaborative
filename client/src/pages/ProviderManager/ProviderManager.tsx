import React, { useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuth } from "../../context/AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import Editor from "../../components/EditorComponent/EditorComponent";
import validator from "validator";
import styles from "./ProviderManager.module.css";

const ProviderManager: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token, logout } = useAuth();
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || !token) return;

        const sanitizedId = encodeURIComponent(id);
        if (!validator.isMongoId(id)) {
            console.error("Invalid room ID");
            return;
        }

        if (!validator.isJWT(token)) {
            console.error("Invalid token");
            return;
        }

        const newProvider = new HocuspocusProvider({
            token,
            url: `${import.meta.env.VITE_BASE_WS_URL}/?roomId=${sanitizedId}`,
            name: sanitizedId,
            onOpen: () => console.log("Connection opened to WebSocket server"),
            onClose: (data) => {
                console.log("Connection closed", event);

                if (
                    data.event.code === 4001 ||
                    data.event.reason === "Unauthorized" ||
                    data.event.reason === "Forbidden"
                ) {
                    console.error("Authentication failed, logging out");
                    logout();
                    navigate("/");
                }
            },
            onSynced: (isSynced) => console.log("Document synced:", isSynced),
            onAuthenticated: () => {
                console.log("Authenticated successfully");
            },
        });

        setProvider(newProvider);

        return () => {
            newProvider.disconnect();
            console.log("HocuspocusProvider disconnected");
        };
    }, [id, token]);

    return (
        <div className={styles.providerManager}>
            <div className={styles.versionLink}>
                <Link to={`/documents/${id}/history`}>
                    View Version History
                </Link>
            </div>
            {provider ? <Editor provider={provider} /> : <div>Loading...</div>}
        </div>
    );
};

export default ProviderManager;
