import { Router } from 'express';
import { CourseController } from '../presentation/controllers/CourseController';
import { CourseRepository } from '../infrastructure/repositories/CourseRepository';
import { CourseService } from '../core/services/CourseService/CourseService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);
const courseController = new CourseController(courseService);

const router = Router();

router.post('/', AuthMiddleware, (req, res, next) => courseController.create(req, res, next));
router.get('/', (req, res, next) => courseController.getAll(req, res, next));
router.get('/:id', (req, res, next) => courseController.getById(req, res, next));
router.patch('/:id', AuthMiddleware, (req, res, next) => courseController.update(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => courseController.delete(req, res, next));

export const courseRouter = router;
