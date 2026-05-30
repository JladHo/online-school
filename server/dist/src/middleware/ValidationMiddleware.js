"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const HttpError_1 = require("../errors/HttpError");
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errorMessages = error.issues.map(e => e.message).join('. ');
            next(new HttpError_1.BadRequestError(`Ошибка валидации: ${errorMessages}`));
        }
        else {
            next(error);
        }
    }
};
exports.validate = validate;
