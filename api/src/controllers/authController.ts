import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || '52EfU6n#vVLxhIq5';

export const register = async (req: Request, res: Response) => {
    let { email, password } = req.body;

    try {
        email = validator.normalizeEmail(email);
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!validator.isLength(password, { min: 8 })) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(201).json({ token, id: newUser._id });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    let { email, password } = req.body;

    try {
        email = validator.normalizeEmail(email);
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!validator.isLength(password, { min: 8 })) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({ token, id: user._id });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
