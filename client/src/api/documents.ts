import validator from 'validator';

// Get documents
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

    const sanitizedTitle = validator.escape(title);

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, title: sanitizedTitle }),
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

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('You are not authorized to delete this document');
    }

    return response.json();
};
