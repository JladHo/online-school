import {HttpError, InternalError} from "../errors/HttpError";
import {Request, Response, NextFunction} from "express";

export const ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    const isProduction = process.env.NODE_ENC === 'production';
    const message = isProduction ? 'На сервере произошла непредвиденная ошибка' : err.message;

    res.status(500).json({ message });
}