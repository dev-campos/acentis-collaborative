import React, { useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import Editor from "../../components/Editor/Editor";

const ProviderManager: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

    useEffect(() => {
        if (!id || !token) return;

        const encodedRoomId = encodeURIComponent(id);

        const newProvider = new HocuspocusProvider({
            token,
            url: `${import.meta.env.VITE_BASE_WS_URL}/?roomId=${encodedRoomId}`,
            name: encodedRoomId,
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
