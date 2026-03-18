import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import {BadRequestError} from "../errors/HttpError";

export const validate = (schema: ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map(e => e.message).join('. ');
                next(new BadRequestError(`Ошибка валидации: ${errorMessages}`))
            } else {
                next(error);
            }
        }
    }