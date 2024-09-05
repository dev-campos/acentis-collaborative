import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import { setupSwagger } from './swagger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';


// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use('/api/auth', authRoutes);

// Setup Swagger
setupSwagger(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
