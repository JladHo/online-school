import express from 'express';
import * as dotenv from 'dotenv';
import {apiRouter} from "./routes";
import {ErrorMiddleware} from "./middleware/ErrorMiddleware";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use('/api', apiRouter)
app.use(ErrorMiddleware)

app.listen(PORT, () => {
    try {
        console.log(`Сервер запущен на порту ${PORT}`);
    } catch (error) {
        console.log(error)
    }
})