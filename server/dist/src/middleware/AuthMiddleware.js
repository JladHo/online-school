"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpError_1 = require("../errors/HttpError");
const AuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new HttpError_1.UnauthorizedError('Требуется авторизация');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new HttpError_1.UnauthorizedError('Некорректный токен');
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET не определен в переменных окружения');
            throw new HttpError_1.InternalError('Ошибка конфигурации сервера');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new HttpError_1.UnauthorizedError('Невалидный или истекший токен'));
        }
        else {
            next(error);
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
