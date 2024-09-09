import validator from 'validator';

export const fetchDocuments = async () => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
};

export const createNewDocument = async (id: string, title: string, token: string) => {
    if (!validator.isUUID(id)) {
        throw new Error('Invalid document ID');
    }
    if (!validator.isLength(title, { min: 1 })) {
        throw new Error('Title cannot be empty');
    }
    if (!validator.isJWT(token)) {
        throw new Error('Invalid token');
    }

    const sanitizedId = validator.escape(id);
    const sanitizedTitle = validator.escape(title);
    const sanitizedToken = validator.escape(token);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sanitizedToken}`,
        },
        body: JSON.stringify({ id: sanitizedId, title: sanitizedTitle }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};

export const deleteDocument = async (documentId: string, token: string) => {
    if (!validator.isUUID(documentId)) {
        throw new Error('Invalid document ID');
    }
    if (!validator.isJWT(token)) {
        throw new Error('Invalid token');
    }

    const sanitizedDocumentId = validator.escape(documentId);
    const sanitizedToken = validator.escape(token);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents/${sanitizedDocumentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${sanitizedToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('You are not authorized to delete this document');
    }

    return response.json();
};

export const fetchVersionHistory = async (documentId: string, token: string) => {
    if (!validator.isUUID(documentId)) {
        throw new Error('Invalid document ID');
    }
    if (!validator.isJWT(token)) {
        throw new Error('Invalid token');
    }

    const sanitizedDocumentId = validator.escape(documentId);
    const sanitizedToken = validator.escape(token);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/document/${sanitizedDocumentId}/versions`, {
        headers: {
            Authorization: `Bearer ${sanitizedToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};

export const rollbackDocument = async (documentId: string, versionId: string, token: string) => {
    if (!validator.isUUID(documentId)) {
        throw new Error('Invalid document ID');
    }
    if (!validator.isUUID(versionId)) {
        throw new Error('Invalid version ID');
    }
    if (!validator.isJWT(token)) {
        throw new Error('Invalid token');
    }

    const sanitizedDocumentId = validator.escape(documentId);
    const sanitizedVersionId = validator.escape(versionId);
    const sanitizedToken = validator.escape(token);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/rollback/${sanitizedDocumentId}/${sanitizedVersionId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${sanitizedToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};
