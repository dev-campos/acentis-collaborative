import { register, login } from '../../../controllers/authController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { User } from '../../../models/User';
import { Request, Response } from 'express';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('validator');
jest.mock('../../../models/User');

describe('Auth Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'testpassword'
            }
        };

        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({
            json: jsonMock
        }));

        res = {
            status: statusMock,
            json: jsonMock
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return 400 if email is invalid', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(false);

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid email format' });
        });

        it('should return 400 if password is less than 8 characters', async () => {
            req.body.password = 'short';
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(false);

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters long' });
        });

        it('should return 400 if user already exists', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);
            (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User already exists' });
        });

        it('should return 201 and a token on successful registration', async () => {
            const hashedPassword = 'hashedpassword';
            const token = 'jsonwebtoken';
            const savedUser = { _id: 'userId', email: 'test@example.com', save: jest.fn() };

            (validator.normalizeEmail as jest.Mock).mockReturnValue('test@example.com');
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);

            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.prototype.save as jest.Mock).mockResolvedValue(savedUser);

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            (jwt.sign as jest.Mock).mockReturnValue(token);

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({ token });
        });




        it('should return 500 if there is a server error', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            await register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Server error', error: new Error('Database error') });
        });
    });

    describe('login', () => {
        it('should return 400 if email is invalid', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(false);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid email format' });
        });

        it('should return 400 if password is less than 8 characters', async () => {
            req.body.password = 'short';
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(false);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters long' });
        });

        it('should return 400 if user does not exist', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should return 400 if password is incorrect', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);
            (User.findOne as jest.Mock).mockResolvedValue({ password: 'hashedPassword' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should return token on successful login', async () => {
            const user = { _id: 'mockUserId', email: 'test@example.com', password: 'hashedPassword' };
            const token = 'mockToken';

            (User.findOne as jest.Mock).mockResolvedValue(user);

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            (jwt.sign as jest.Mock).mockReturnValue(token);

            await login(req as Request, res as Response);

            expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, user.password);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ token, id: user._id });
        });


        it('should return 500 if there is a server error', async () => {
            (validator.isEmail as jest.Mock).mockReturnValue(true);
            (validator.isLength as jest.Mock).mockReturnValue(true);
            (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            await login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Server error' });
        });
    });
});
