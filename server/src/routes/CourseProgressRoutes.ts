import { Router } from 'express';
import { CourseProgressController } from '../presentation/controllers/CourseProgressController';
import { CourseProgressService } from '../core/services/CourseProgressService/CourseProgressService';
import { LessonRepository } from '../infrastructure/repositories/LessonRepository';
import { HomeworkSubmissionRepository } from '../infrastructure/repositories/HomeworkSubmissionRepository';
import { AttendanceRepository } from '../infrastructure/repositories/AttendanceRepository';
import { HomeworkRepository } from '../infrastructure/repositories/HomeworkRepository';
import { LessonSessionRepository } from '../infrastructure/repositories/LessonSessionRepository';
import { ModuleRepository } from '../infrastructure/repositories/ModuleRepository';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const lessonRepository = new LessonRepository();
const submissionRepository = new HomeworkSubmissionRepository();
const attendanceRepository = new AttendanceRepository();
const homeworkRepository = new HomeworkRepository();
const sessionRepository = new LessonSessionRepository();
const moduleRepository = new ModuleRepository();

export const courseProgressService = new CourseProgressService(
    lessonRepository,
    submissionRepository,
    attendanceRepository,
    homeworkRepository,
    sessionRepository,
    moduleRepository
);

const courseProgressController = new CourseProgressController(courseProgressService);

const router = Router();

router.get('/:studentId/can-access/:lessonId', AuthMiddleware, (req, res, next) => courseProgressController.canAccessLesson(req, res, next));

export const courseProgressRouter = router;
