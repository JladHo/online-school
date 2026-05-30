"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleMiddleware = void 0;
const HttpError_1 = require("../errors/HttpError");
const RoleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new HttpError_1.UnauthorizedError('Пользователь не авторизован');
            }
            if (!allowedRoles.includes(user.role)) {
                res.status(403).json({ message: 'Доступ запрещен. Недостаточно прав.' });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.RoleMiddleware = RoleMiddleware;
