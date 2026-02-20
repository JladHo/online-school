import express from 'express';
import * as dotenv from 'dotenv';
import {apiRouter} from "./routes";
import {HttpError} from "./core/errors/HttpError";
import {Request, Response, NextFunction} from "express";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use('/api', apiRouter)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.listen(PORT, () => {
    try {
        console.log(`Сервер запущен на порту ${PORT}`);
    } catch (e) {
        console.log(e)
    }
})