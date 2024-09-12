import { AuthenticatedRequest } from 'src/types/AuthenticatedRequest';
import {
    createDocument,
    getDocument,
    getDocuments,
    deleteDocument,
    getDocumentVersions,
    rollbackDocument,
} from '../../../controllers/documentsController';
import { Document } from '../../../models/Document';
import { Response } from 'express'
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import validator from 'validator';

jest.mock('validator');
jest.mock('../../../models/Document.ts');


describe('Document Controller', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('createDocument', () => {
        let req: Partial<AuthenticatedRequest>;
        let res: Partial<Response>;
        let json: jest.Mock;
        let status: jest.Mock;

        const MockedDocument = jest.mocked(Document);

        beforeEach(() => {
            req = {
                user: {
                    id: 'mockUserId',
                },
            };

            json = jest.fn();
            status = jest.fn().mockReturnValue({ json });
            res = {
                status,
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should create a new document and return status 201 with the document', async () => {
            const savedDocument = {
                content: Buffer.from(''),
                versions: [],
                createdBy: 'mockUserId',
                _id: 'mockDocumentId',
                save: jest.fn().mockResolvedValue(this),
            };

            MockedDocument.mockImplementationOnce(() => savedDocument as any);

            await createDocument(req as AuthenticatedRequest, res as Response);

            expect(MockedDocument).toHaveBeenCalledWith({
                content: Buffer.from(''),
                versions: [],
                createdBy: 'mockUserId',
            });

            expect(savedDocument.save).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(201);
            expect(json).toHaveBeenCalledWith(savedDocument);
        });

        it('should return status 500 if an error occurs while saving the document', async () => {
            const saveMock = jest.fn().mockRejectedValue(new Error('Save failed'));

            MockedDocument.mockImplementationOnce(() => ({
                save: saveMock,
            }) as any);

            await createDocument(req as AuthenticatedRequest, res as Response);

            expect(MockedDocument).toHaveBeenCalledWith({
                content: Buffer.from(''),
                versions: [],
                createdBy: 'mockUserId',
            });

            expect(status).toHaveBeenCalledWith(500);
            expect(json).toHaveBeenCalledWith({
                message: 'Error creating document',
                error: expect.any(Error),
            });
        });
    });


    describe('getDocument', () => {
        it('should return 400 for invalid document ID format', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(false);
            req.params.documentId = 'invalidId';

            await getDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid document ID format' });
        });

        it('should return 404 if document is not found', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(true);
            req.params.documentId = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockResolvedValue(null);

            await getDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
        });

        it('should return 200 if document is found', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(true);
            req.params.documentId = '615f354acd421c0c92f79f6e';
            const mockDocument = { _id: '615f354acd421c0c92f79f6e', title: 'Test Document' };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);

            await getDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDocument);
        });

        it('should return 500 if an error occurs', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(true);
            req.params.documentId = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching document', error: new Error('Database error') });
        });
    });

    describe('getDocuments', () => {
        it('should return an empty array if no documents are found', async () => {
            (Document.find as jest.Mock).mockResolvedValue([]);

            await getDocuments(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should return documents if found', async () => {
            const mockDocuments = [{ _id: '615f354acd421c0c92f79f6e', title: 'Test Document' }];
            (Document.find as jest.Mock).mockResolvedValue(mockDocuments);

            await getDocuments(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDocuments);
        });

        it('should return 500 if an error occurs', async () => {
            (Document.find as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getDocuments(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching documents', error: new Error('Database error') });
        });
    });

    describe('deleteDocument', () => {
        it('should return 400 for invalid document ID format', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(false);
            req.params.id = 'invalidId';

            await deleteDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid document ID format' });
        });

        it('should return 404 if document is not found', async () => {
            (validator.isMongoId as jest.Mock).mockReturnValue(true);
            req.params.id = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockResolvedValue(null);

            await deleteDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
        });

        it('should return 403 if user is not the creator of the document', async () => {
            req.user = { id: 'differentUserId' };
            req.params.id = '615f354acd421c0c92f79f6e';
            const mockDocument = { _id: '615f354acd421c0c92f79f6e', createdBy: '615f354acd421c0c92f79f6f' };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);

            await deleteDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'You do not have permission to delete this document' });
        });

        it('should return 200 if document is deleted successfully', async () => {
            req.user = { id: '615f354acd421c0c92f79f6f' };
            req.params.id = '615f354acd421c0c92f79f6e';
            const mockDocument = { _id: '615f354acd421c0c92f79f6e', createdBy: '615f354acd421c0c92f79f6f' };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);
            (Document.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await deleteDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Document deleted successfully' });
        });

        it('should return 500 if an error occurs during deletion', async () => {
            req.params.id = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await deleteDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting document', error: new Error('Database error') });
        });
    });

    describe('getDocumentVersions', () => {
        it('should return versions of the document if found', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            const mockDocument = { versions: [{ _id: 'v1', content: 'Version 1' }] };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);

            await getDocumentVersions(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDocument.versions);
        });

        it('should return 404 if document is not found', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockResolvedValue(null);

            await getDocumentVersions(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Document not found' });
        });

        it('should return 500 if an error occurs', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            (Document.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getDocumentVersions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching version history', error: new Error('Database error') });
        });
    });

    describe('rollbackDocument', () => {
        it('should roll back the document to a previous version', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            req.params.versionId = 'v1';
            req.user = { id: '615f354acd421c0c92f79f6f' };

            const mockDocument = {
                _id: '615f354acd421c0c92f79f6e',
                versions: [{ _id: 'v1', content: 'Version 1' }],
                save: jest.fn(),
            };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);

            await rollbackDocument(req, res);

            expect(mockDocument.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Document rolled back' }));
        });

        it('should return 404 if version is not found', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            req.params.versionId = 'v1';
            req.user = { id: '615f354acd421c0c92f79f6f' };

            const mockDocument = { _id: '615f354acd421c0c92f79f6e', versions: [] };
            (Document.findById as jest.Mock).mockResolvedValue(mockDocument);

            await rollbackDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Version not found' });
        });

        it('should return 500 if an error occurs', async () => {
            req.params.documentId = '615f354acd421c0c92f79f6e';
            req.params.versionId = 'v1';
            req.user = { id: '615f354acd421c0c92f79f6f' };

            (Document.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await rollbackDocument(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error rolling back document', error: new Error('Database error') });
        });
    });
});