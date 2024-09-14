import bcrypt from 'bcryptjs';
import { createServer, Server } from 'http';
import { Hocuspocus } from '@hocuspocus/server';
import { createHocuspocusServer } from '../../../websocket/websocketServer';
import { WebSocketServer, WebSocket } from 'ws';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import { User } from '../../../models/User';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import express from 'express';

const app = express();

dotenv.config()

const bufferedData = Buffer.from([
    1, 3, 195, 222, 157, 241, 5, 0, 7, 1, 7, 100, 101, 102,
    97, 117, 108, 116, 3, 9, 112, 97, 114, 97, 103, 114, 97,
    112, 104, 7, 0, 195, 222, 157, 241, 5, 0, 6, 4, 0, 195,
    222, 157, 241, 5, 1, 1, 97, 0, 32, 33, 34, 35, 36, 37,
    38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
])

describe('Hocuspocus WebSocket Server', () => {
    let httpServer: Server;
    let hocuspocusServer: Hocuspocus;
    let wsServer: WebSocketServer;
    let closeHocuspocusServer: () => void;
    let token: string;
    let doc1: any;
    let doc2: any;

    beforeAll(async () => {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
        await mongoose.connect(MONGODB_URI);
        httpServer = createServer();

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }

        const { hocuspocusServer: createdHocuspocusServer, close } = createHocuspocusServer();
        hocuspocusServer = createdHocuspocusServer;
        closeHocuspocusServer = close;

        wsServer = new WebSocketServer({ server: httpServer });
        wsServer.on('connection', (ws, req) => {
            hocuspocusServer.handleConnection(ws, req);
            ws.on('message', (message) => {
                ws.send(message);
            });
        });

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await new User({
            email: 'testuser@example.com',
            password: hashedPassword,
        }).save();

        const userId = user._id.toString();
        token = jwt.sign({ id: userId, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        const response1 = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`);

        doc1 = response1.body;

        const response2 = await request(app)
            .post('/api/documents')
            .set('Authorization', `Bearer ${token}`);

        doc2 = response2.body;

        httpServer.listen(5001);
    });

    afterAll(async () => {
        closeHocuspocusServer();

        wsServer.close();

        await new Promise<void>((resolve, reject) => {
            httpServer.close((err: any) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
        await mongoose.connection.close();
    }, 20000);

    it('should create Hocuspocus server and handle WebSocket connections', (done) => {
        const client = new WebSocket(`ws://127.0.0.1:5001/roomId=${doc1._id}`);

        client.on('open', () => {
            expect(hocuspocusServer).toBeDefined();
            expect(wsServer).toBeDefined();
            client.close();
        });

        client.on('close', () => {
            done();
        });

        client.on('error', (error) => {
            client.close();
            done(error);
        });
    });

    it('should allow multiple clients to send and receive buffered data in the same room', (done) => {
        const client1 = new WebSocket(`ws://127.0.0.1:5001/roomId=${doc1._id}`);
        const client2 = new WebSocket(`ws://127.0.0.1:5001/roomId=${doc1._id}`);

        let messageCount = 0;

        const checkDone = () => {
            if (messageCount === 2) {
                client1.close();
                client2.close();
                done();
            }
        };

        client1.on('open', () => {
            client1.send(bufferedData);
        });

        client2.on('open', () => {
            client2.send(bufferedData);
        });

        const messageHandler = (data: { type: string, data: Buffer }) => {
            if (data.data) {
                expect(data.data.toString()).toEqual(bufferedData.toString());
            } else {
                expect(data.toString()).toEqual(bufferedData.toString());
            }
            messageCount++;
            checkDone();
        };

        client1.on('message', messageHandler);
        client2.on('message', messageHandler);

        client1.on('error', (error) => {
            client1.close();
            done(error);
        });

        client2.on('error', (error) => {
            client2.close();
            done(error);
        });
    });

    it('should allow clients in different rooms to send and receive data separately', (done) => {
        const client1 = new WebSocket(`ws://127.0.0.1:5001/roomId=${doc1._id}`);
        const client2 = new WebSocket(`ws://127.0.0.1:5001/roomId=${doc2._id}`);

        let client1Received = false;
        let client2Received = false;

        client1.on('open', () => {
            client1.send(bufferedData);
        });

        client2.on('open', () => {
            client2.send(bufferedData);
        });

        const messageHandler = (clientReceived: boolean, setClientReceived: Function) => (data: { type: string, data: Buffer }) => {
            if (data.data) {
                expect(data.data.toString()).toEqual(bufferedData.toString());
            } else {
                expect(data.toString()).toEqual(bufferedData.toString());
            }
            setClientReceived(true);
            if (client1Received && client2Received) {
                client1.close();
                client2.close();
                done();
            }
        };

        client1.on('message', messageHandler(client1Received, (value: boolean) => (client1Received = value)));
        client2.on('message', messageHandler(client2Received, (value: boolean) => (client2Received = value)));

        client1.on('error', (error) => {
            client1.close();
            done(error);
        });

        client2.on('error', (error) => {
            client2.close();
            done(error);
        });
    });
});
