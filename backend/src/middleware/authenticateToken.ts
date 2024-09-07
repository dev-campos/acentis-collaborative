import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

interface JwtPayloadWithId extends JwtPayload {
    id: string
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadWithId;
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        res.sendStatus(403);
    }
};

export default authenticateToken;
