import {Request, Response, NextFunction} from "express";
import {UnauthorizedError} from "../errors/HttpError";

interface AuthRequest extends Request {
    user?: any;
}

export const RoleMiddleware = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user) {
                throw new UnauthorizedError('Пользователь не авторизован');
            }

            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({ message: 'Доступ запрещен. Недостаточно прав.' });
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    }
};