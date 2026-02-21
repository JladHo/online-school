import {HttpError, InternalError} from "../errors/HttpError";
import {Request, Response, NextFunction} from "express";

export const ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}