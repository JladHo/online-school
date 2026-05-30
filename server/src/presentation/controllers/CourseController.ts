import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../../core/services/CourseService/CourseService';
import { CreateCourseSchema } from '../../core/repositories/CourseRepository/dto/CreateCourseDto';
import { UpdateCourseSchema } from '../../core/repositories/CourseRepository/dto/UpdateCourseDto';

export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateCourseSchema.parse(req.body);
            const course = await this.courseService.create(data);
            res.status(201).json(course);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const course = await this.courseService.findById(id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.status(200).json(course);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const courses = await this.courseService.findAll();
            res.status(200).json(courses);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const data = UpdateCourseSchema.parse(req.body);
            const course = await this.courseService.update(id, data);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.status(200).json(course);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.courseService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
