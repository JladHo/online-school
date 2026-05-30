import { Request, Response, NextFunction } from 'express';
import { CourseProgressService } from '../../core/services/CourseProgressService/CourseProgressService';

export class CourseProgressController {
    constructor(private readonly courseProgressService: CourseProgressService) {}

    async canAccessLesson(req: Request, res: Response, next: NextFunction) {
        try {
            const studentId = parseInt(String(req.params.studentId), 10);
            const lessonId = parseInt(String(req.params.lessonId), 10);

            if (isNaN(studentId) || isNaN(lessonId)) {
                return res.status(400).json({ message: 'Invalid studentId or lessonId' });
            }

            const canAccess = await this.courseProgressService.canAccessLesson(studentId, lessonId);
            res.status(200).json({ canAccess });
        } catch (error) {
            next(error);
        }
    }
}
