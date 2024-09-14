import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app, server } from '../../../index';
import { User } from '../../../models/User';

const mongoUri = process.env.MONGODB_URI || 'your-cloud-mongodb-uri-here';

describe('User Authentication Integration Tests', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }


        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }, 30000);

    afterAll(async () => {
        await mongoose.disconnect();
        server.close();
    });

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user and return a token', async () => {
            const user = {
                email: 'testuser@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(user);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials and return a token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = new User({
                email: 'testuser@example.com',
                password: hashedPassword,
            });
            await user.save();

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('id');
        });
    });
});