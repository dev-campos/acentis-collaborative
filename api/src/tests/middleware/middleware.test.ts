import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import authenticateToken from '../../middleware/authenticateToken';
import validator from 'validator';
import { IncomingHttpHeaders } from 'http';
import { NextFunction, Response } from 'express';

jest.mock('jsonwebtoken');
jest.mock('validator');

describe('authenticateToken middleware', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { headers: {} as IncomingHttpHeaders, };
        res = {
            sendStatus: jest.fn(),
        };
        next = jest.fn();
    });

    it('should call next if token is valid', () => {
        req.headers!['authorization'] = 'Bearer validToken';
        (validator.isJWT as jest.Mock).mockReturnValue(true);
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'userId' });

        authenticateToken(req as AuthenticatedRequest, res as Response, next);

        expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
        expect(req.user).toEqual({ id: 'userId' });
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', () => {
        authenticateToken(req as AuthenticatedRequest, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is not valid', () => {
        req.headers!['authorization'] = 'Bearer invalidToken';
        (validator.isJWT as jest.Mock).mockReturnValue(false);

        authenticateToken(req as AuthenticatedRequest, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if jwt verification fails', () => {
        req.headers!['authorization'] = 'Bearer validToken';
        (validator.isJWT as jest.Mock).mockReturnValue(true);
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authenticateToken(req as AuthenticatedRequest, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
