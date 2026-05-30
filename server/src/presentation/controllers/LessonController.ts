import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../../core/services/LessonService/LessonService';
import { CreateLessonSchema } from '../../core/repositories/LessonRepository/dto/CreateLessonDto';
import { UpdateLessonSchema } from '../../core/repositories/LessonRepository/dto/UpdateLessonDto';

export class LessonController {
    constructor(private readonly lessonService: LessonService) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const lesson = await this.lessonService.create(data);
            res.status(201).json(lesson);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const lesson = await this.lessonService.findById(id);
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }
            res.status(200).json(lesson);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const lessons = await this.lessonService.findAll();
            res.status(200).json(lessons);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const data = req.body;
            const lesson = await this.lessonService.update(id, data);
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' });
            }
            res.status(200).json(lesson);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.lessonService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
