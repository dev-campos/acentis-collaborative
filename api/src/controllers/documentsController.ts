import { Request, Response } from 'express';
import { Document } from '../models/Document';
import { AuthenticatedRequest } from 'src/types/AuthenticatedRequest';
import validator from 'validator';

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await Document.find();
        if (!documents.length) {
            return res.status(200).json([]);
        }
        return res.status(200).json(documents);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching documents', error });
    }
};

export const createDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { id, title } = req.body;
    const userId = req.user?.id;

    if (!validator.isUUID(id)) {
        return res.status(400).json({ message: 'Invalid document ID format' });
    }

    if (!validator.isLength(title, { min: 1 })) {
        return res.status(400).json({ message: 'Title cannot be empty' });
    }

    try {
        const newDocument = new Document({
            _id: id,
            title: validator.escape(title),
            content: Buffer.from(''),
            versions: [],
            createdBy: userId,
        });
        await newDocument.save();
        return res.status(201).json(newDocument);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating document', error });
    }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    const documentId = req.params.id;
    const userId = req.user?.id;

    if (!validator.isUUID(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID format' });
    }

    try {
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this document' });
        }
        await Document.findByIdAndDelete(documentId);
        return res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting document', error });
    }
};

export const getDocumentVersions = async (req: Request, res: Response) => {
    const { documentId } = req.params;

    if (!validator.isUUID(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID format' });
    }

    try {
        const document = await Document.findById(documentId, 'versions');
        if (document) {
            return res.status(200).json(document.versions);
        }
        return res.status(404).json({ message: 'Document not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching version history', error });
    }
};

export const rollbackDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { documentId, versionId } = req.params;
    const userId = req.user?.id;

    if (!validator.isUUID(documentId)) {
        return res.status(400).json({ message: 'Invalid document ID format' });
    }

    if (!validator.isMongoId(versionId)) {
        return res.status(400).json({ message: 'Invalid version ID format' });
    }

    try {
        const document = await Document.findById(documentId);

        if (document) {
            const previousVersion = document.versions.find(
                (version) => version._id.toString() === versionId
            );

            if (!previousVersion) {
                return res.status(404).json({ message: 'Version not found' });
            }

            document.content = Buffer.from(previousVersion.content);

            document.versions.push({
                content: Buffer.from(previousVersion.content),
                updatedBy: `rolled_to_${versionId}_by_${userId}`,
            });

            await document.save();

            return res.status(200).json({ message: 'Document rolled back', content: document.content });
        }

        return res.status(404).json({ message: 'Document not found' });
    } catch (error) {
        return res.status(500).json({ message: 'Error rolling back document', error });
    }
};
