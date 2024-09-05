import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv'

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || '52EfU6n#vVLxhIq5';

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        // Create a JWT token for the new user
        const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: '1h' });

        // Return the token along with the success message
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login a user
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify a token
export const verifyToken = async (req: Request, res: Response, next: any) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user as IUser;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
