import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import {apiRouter} from "./routes";
import {ErrorMiddleware} from "./middleware/ErrorMiddleware";
import helmet from "helmet";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false })); 
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api', apiRouter);
app.use(ErrorMiddleware);

app.listen(PORT, () => {
    try {
        console.log(`Сервер запущен на порту ${PORT}`);
    } catch (error) {
        console.log(error);
    }
})

