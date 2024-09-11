import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import { setupSwagger } from './swagger';
import { createServer } from 'http';
import { createHocuspocusServer } from './websocket/websocketServer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use('/api/auth', authRoutes);
app.use('/api', documentRoutes);

setupSwagger(app);

const server = createServer(app);

const { close } = createHocuspocusServer(server);

if (process.env.NODE_ENV !== 'test') {
    const PORT = parseInt(process.env.PORT || '5001', 10);
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

server.on('close', () => {
    close()
});

export { app, server };


