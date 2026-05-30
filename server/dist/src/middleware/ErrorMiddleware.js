"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const HttpError_1 = require("../errors/HttpError");
const ErrorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof HttpError_1.HttpError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    const isProduction = process.env.NODE_ENC === 'production';
    const message = isProduction ? 'На сервере произошла непредвиденная ошибка' : err.message;
    res.status(500).json({ message });
};
exports.ErrorMiddleware = ErrorMiddleware;
