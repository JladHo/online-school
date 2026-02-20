import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('wwwwwwwwwwwwwwwwwwwww!');
})

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
})