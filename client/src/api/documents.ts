import validator from 'validator';

export const fetchDocument = async (documentId: string) => {
    if (!validator.isMongoId(documentId)) {
        throw new Error('Invalid document ID');
    }

    const sanitizedDocumentId = validator.escape(documentId);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents/${sanitizedDocumentId}`)

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};

export const fetchDocuments = async () => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
};

export const fetchVersionHistory = async (documentId: string) => {
    if (!validator.isMongoId(documentId)) {
        throw new Error('Invalid document ID');
    }

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents/${documentId}/versions`);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    try {
        return await response.json();
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error parsing response JSON: ${err.message}`);
    }
};


export const createNewDocument = async (token: string) => {
    if (!validator.isJWT(token)) {
        throw new Error('Invalid token');
    }

    const sanitizedToken = validator.escape(token);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sanitizedToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};

export const deleteDocument = async (documentId: string, token: string) => {
    if (!validator.isMongoId(documentId)) {
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

export const rollbackDocument = async (documentId: string, versionId: string, token: string) => {
    if (!validator.isMongoId(documentId)) {
        throw new Error('Invalid document ID');
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
