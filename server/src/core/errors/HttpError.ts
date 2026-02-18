export class HttpError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'Неверный запрос') {
        super(400, message);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Ошибка аутентификации') {
        super(401, message);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Доступ запрещен') {
        super(403, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Ресурс не найден') {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(409, message);
    }
}