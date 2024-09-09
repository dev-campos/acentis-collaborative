// Get documents
export const fetchDocuments = async () => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`);
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
};

// Create a new document with token-based verification
export const createNewDocument = async (id: string, title: string, token: string) => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`  // Pass the token for authorization
        },
        body: JSON.stringify({ id, title }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
};

// Delete a document with token-based verification
export const deleteDocument = async (documentId: string, token: string) => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`  // Pass the token for authorization
        },
    });

    if (!response.ok) {
        throw new Error('You are not authorized to delete this document');
    }

    return response.json();
};
