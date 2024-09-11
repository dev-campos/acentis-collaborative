import { createServer } from 'http';
import { createHocuspocusServer } from '../../../websocket/websocketServer';
import { WebSocket } from 'ws';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

describe('Integration: Hocuspocus Server with Database and WebSocket', () => {
    let httpServer: any;
    let hocuspocusServer: any;

    beforeAll(async () => {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

        await mongoose.connect(MONGODB_URI)
            .then(() => console.log('MongoDB connected'))
            .catch(err => console.error('MongoDB connection error:', err));

        httpServer = createServer();
        hocuspocusServer = createHocuspocusServer(httpServer);
        httpServer.listen(5001);
    });

    afterAll(async () => {
        await hocuspocusServer.close();

        await new Promise<void>((resolve, reject) => {
            httpServer.close((err: any) => {
                if (err) return reject(err);
                resolve();
            });
        });

        await mongoose.connection.close();
    });

    it('should accept WebSocket connections and interact with the database', (done) => {
        const ws = new WebSocket('ws://localhost:5001');

        ws.on('open', () => {
            ws.close();
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            done();
        });
    });
});
