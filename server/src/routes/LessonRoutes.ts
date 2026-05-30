import { Router } from 'express';
import { LessonController } from '../presentation/controllers/LessonController';
import { LessonRepository } from '../infrastructure/repositories/LessonRepository';
import { LessonService } from '../core/services/LessonService/LessonService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validate } from '../middleware/ValidationMiddleware';
import { CreateLessonSchema } from '../core/repositories/LessonRepository/dto/CreateLessonDto';
import { UpdateLessonSchema } from '../core/repositories/LessonRepository/dto/UpdateLessonDto';
import { courseProgressService } from './CourseProgressRoutes';
import { ForbiddenError } from '../errors/HttpError';

const lessonRepository = new LessonRepository();
const lessonService = new LessonService(lessonRepository);
const lessonController = new LessonController(lessonService);

const router = Router();

router.post('/', AuthMiddleware, validate(CreateLessonSchema), (req, res, next) => lessonController.create(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => lessonController.getAll(req, res, next));

router.get('/:id', AuthMiddleware, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const lessonId = parseInt(String(req.params.id), 10);
        
        // BOLA Fix: If user is a student, check if they have access to this lesson
        if (user && user.role === 'user') {
            const canAccess = await courseProgressService.canAccessLesson(user.id, lessonId);
            if (!canAccess) {
                throw new ForbiddenError('У вас нет доступа к этому уроку (сдайте ДЗ за прошлый)');
            }
        }
        
        // If passed (or if teacher/admin), proceed to controller
        return lessonController.getById(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', AuthMiddleware, validate(UpdateLessonSchema), (req, res, next) => lessonController.update(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => lessonController.delete(req, res, next));

export const lessonRouter = router;
