import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/', AuthMiddleware, upload.single('image'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Нет файла для загрузки' });
        }
        
        // Return the absolute URL to access the uploaded file
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        res.status(201).json({ url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при загрузке файла' });
    }
});

export const uploadRouter = router;
