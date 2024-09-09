import React, { useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import Editor from "../../components/EditorComponent/EditorComponent";
import validator from "validator";

const ProviderManager: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

    useEffect(() => {
        if (!id || !token) return;

        const sanitizedId = encodeURIComponent(id);
        if (!validator.isUUID(id)) {
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
            onClose: () => console.log("Connection closed"),
            onSynced: (isSynced) => console.log("Document synced:", isSynced),
        });

        setProvider(newProvider);

        return () => {
            newProvider.disconnect();
            console.log("HocuspocusProvider disconnected");
        };
    }, [id, token]);

    return provider ? <Editor provider={provider} /> : <div>Loading...</div>;
};

export default ProviderManager;
