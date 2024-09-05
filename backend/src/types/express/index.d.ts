import { IUser } from '../../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

// Add an intentional type error here:
const invalidVar: number = 'This should throw a type error';