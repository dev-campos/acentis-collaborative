import mongoose from 'mongoose';
import request from 'supertest';
import { app, server } from '../../../index';
import { Document } from '../../../models/Document';
import { User } from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mongoUri = process.env.MONGODB_URI || 'your-cloud-mongodb-uri-here';
let token: string;

describe('Document Integration Tests with Cloud MongoDB', () => {
    let userId: string;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }


        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await new User({
            email: 'testuser@example.com',
            password: hashedPassword,
        }).save();

        userId = user._id.toString();
        token = jwt.sign({ id: userId, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        server.close()
    });

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    describe('POST /api/documents', () => {
        it('should create a new document with valid token', async () => {
            const response = await request(app)
                .post('/api/documents')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('title');
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app)
                .post('/api/documents');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/documents', () => {
        it('should fetch all documents', async () => {
            await new Document({
                title: 'Existing Document',
                content: Buffer.from('Sample content'),
                createdBy: userId,
            }).save();

            const response = await request(app)
                .get('/api/documents')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].title).toBe('Existing Document');
        });
    });

    describe('GET /api/documents/:documentId', () => {
        it('should fetch a single document by ID', async () => {
            const doc = await new Document({
                title: 'Test Document',
                content: Buffer.from('Sample content'),
                createdBy: userId,
            }).save();

            const response = await request(app)
                .get(`/api/documents/${doc._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Test Document');
        });

        it('should return 400 for invalid document ID', async () => {
            const response = await request(app)
                .get('/api/documents/invalidId')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid document ID format');
        });

        it('should return 404 if document is not found', async () => {
            const response = await request(app)
                .get('/api/documents/605c6a4b9f1a4b2c4c8899a1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Document not found');
        });
    });

    describe('DELETE /api/documents/:id', () => {
        it('should delete a document with valid token and permission', async () => {
            const doc = await new Document({
                title: 'Document to Delete',
                content: Buffer.from('Some content'),
                createdBy: userId,
            }).save();

            const response = await request(app)
                .delete(`/api/documents/${doc._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Document deleted successfully');
        });

        it('should return 403 if user is not the creator', async () => {
            const anotherUser = await new User({
                email: 'anotheruser@example.com',
                password: await bcrypt.hash('password123', 10),
            }).save();

            const doc = await new Document({
                title: 'Document from Another User',
                content: Buffer.from('Some content'),
                createdBy: anotherUser._id,
            }).save();

            const response = await request(app)
                .delete(`/api/documents/${doc._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('You do not have permission to delete this document');
        });

        it('should return 404 if document is not found', async () => {
            const response = await request(app)
                .delete('/api/documents/605c6a4b9f1a4b2c4c8899a1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Document not found');
        });
    });

    describe('GET /api/documents/:documentId/versions', () => {
        it('should fetch document versions', async () => {
            const doc = await new Document({
                title: 'Test Document',
                content: Buffer.from('Sample content'),
                createdBy: userId,
                versions: [{ content: Buffer.from('Version 1'), updatedBy: userId }]
            }).save();

            const response = await request(app)
                .get(`/api/documents/${doc._id}/versions`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].updatedBy).toBe(userId);
        });
    });

    describe('POST /api/rollback/:documentId/:versionId', () => {
        it('should rollback the document to a previous version', async () => {
            const doc = await new Document({
                title: 'Document to Rollback',
                content: Buffer.from('Version 2'),
                createdBy: userId,
                versions: [{ content: Buffer.from('Version 1'), updatedBy: userId }]
            }).save();

            const versionId = doc.versions[0]._id;

            const response = await request(app)
                .post(`/api/rollback/${doc._id}/${versionId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            expect(response.body.content.data).toEqual(Buffer.from('Version 1').toJSON().data);
        });



        it('should return 404 if version is not found', async () => {
            const doc = await new Document({
                title: 'Document to Rollback',
                content: Buffer.from('Version 2'),
                createdBy: userId,
                versions: [{ content: Buffer.from('Version 1'), updatedBy: userId }]
            }).save();

            const invalidVersionId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .post(`/api/rollback/${doc._id}/${invalidVersionId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Version not found');
        });
    });
});
