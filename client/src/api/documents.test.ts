import { vi } from "vitest";
import {
    fetchDocument,
    fetchDocuments,
    fetchVersionHistory,
    createNewDocument,
    deleteDocument,
    rollbackDocument,
} from "./documents";

global.fetch = vi.fn();

const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";


describe("fetchDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if document ID is invalid", async () => {
        await expect(fetchDocument("invalid-id")).rejects.toThrow("Invalid document ID");
    });

    it("should call the API and return the document data", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: "document123", content: "Document content" }),
        });

        const document = await fetchDocument("60f5ba8646ec2f3b4c9d0d64");
        expect(document).toEqual({ id: "document123", content: "Document content" });

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/documents/60f5ba8646ec2f3b4c9d0d64`
        );
    });

    it("should throw an error if the API response is not ok", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        await expect(fetchDocument("60f5ba8646ec2f3b4c9d0d64")).rejects.toThrow("HTTP error: 404");
    });
});

describe("fetchDocuments", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call the API and return the documents list", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: "doc1" }, { id: "doc2" }],
        });

        const documents = await fetchDocuments();
        expect(documents).toEqual([{ id: "doc1" }, { id: "doc2" }]);

        expect(fetch).toHaveBeenCalledWith(`${import.meta.env.VITE_BASE_URL}/api/documents`);
    });

    it("should throw an error if the API response is not ok", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(fetchDocuments()).rejects.toThrow("HTTP error: 500");
    });
});

describe("fetchVersionHistory", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if document ID is invalid", async () => {
        await expect(fetchVersionHistory("invalid-id")).rejects.toThrow("Invalid document ID");
    });

    it("should call the API and return the version history", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{ versionId: "v1" }, { versionId: "v2" }],
        });

        const versions = await fetchVersionHistory("60f5ba8646ec2f3b4c9d0d64");
        expect(versions).toEqual([{ versionId: "v1" }, { versionId: "v2" }]);

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/documents/60f5ba8646ec2f3b4c9d0d64/versions`
        );
    });

    it("should throw an error if the API response is not ok", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 400,
        });

        await expect(fetchVersionHistory("60f5ba8646ec2f3b4c9d0d64")).rejects.toThrow(
            "HTTP error: 400"
        );
    });
});

describe("createNewDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if the token is invalid", async () => {
        await expect(createNewDocument("invalid-token")).rejects.toThrow("Invalid token");
    });

    it("should call the API and return the created document", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: "new-doc" }),
        });

        const document = await createNewDocument(validToken);
        expect(document).toEqual({ id: "new-doc" });

        expect(fetch).toHaveBeenCalledWith(`${import.meta.env.VITE_BASE_URL}/api/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${validToken}`,
            },
        });
    });

    it("should throw an error if the API response is not ok", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        await expect(createNewDocument(validToken)).rejects.toThrow("HTTP error: 403");
    });
});

describe("deleteDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if the document ID or token is invalid", async () => {
        await expect(deleteDocument("invalid-id", validToken)).rejects.toThrow(
            "Invalid document ID"
        );

        await expect(deleteDocument("60f5ba8646ec2f3b4c9d0d64", "invalid-token")).rejects.toThrow(
            "Invalid token"
        );
    });

    it("should call the API to delete the document and return the response", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Document deleted" }),
        });

        const response = await deleteDocument("60f5ba8646ec2f3b4c9d0d64", validToken);
        expect(response).toEqual({ message: "Document deleted" });

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/documents/60f5ba8646ec2f3b4c9d0d64`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
            }
        );
    });

    it("should throw an error if the user is not authorized to delete the document", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        await expect(
            deleteDocument("60f5ba8646ec2f3b4c9d0d64", validToken)
        ).rejects.toThrow("You are not authorized to delete this document");
    });
});

describe("rollbackDocument", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw an error if document ID, version ID, or token is invalid", async () => {
        await expect(rollbackDocument("invalid-id", "valid-version", validToken)).rejects.toThrow(
            "Invalid document ID"
        );

        await expect(rollbackDocument("60f5ba8646ec2f3b4c9d0d64", "valid-version", "invalid-token")).rejects.toThrow(
            "Invalid token"
        );
    });

    it("should call the API to rollback the document and return the response", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Document rolled back" }),
        });

        const response = await rollbackDocument(
            "60f5ba8646ec2f3b4c9d0d64",
            "version123",
            validToken
        );
        expect(response).toEqual({ message: "Document rolled back" });

        expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BASE_URL}/api/rollback/60f5ba8646ec2f3b4c9d0d64/version123`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${validToken}`,
                },
            }
        );
    });

    it("should throw an error if the API response is not ok", async () => {
        (fetch as vi.mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(
            rollbackDocument("60f5ba8646ec2f3b4c9d0d64", "version123", validToken)
        ).rejects.toThrow("HTTP error: 500");
    });
});
