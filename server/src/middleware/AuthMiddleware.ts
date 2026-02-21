import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import {InternalError, UnauthorizedError} from "../errors/HttpError";

interface AuthRequest extends Request {
    user?: any;
}

export const AuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedError('Требуется авторизация');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError('Некорректный токен');
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET не определен в переменных окружения')
            throw new InternalError('Ошибка конфигурации сервера')
        }

        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Невалидный или истекший токен'));
        } else {
            next(error);
        }
    }
}