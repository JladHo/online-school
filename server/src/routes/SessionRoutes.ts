import { Router } from 'express';
import { SessionController } from '../presentation/controllers/SessionController';
import { LessonSessionRepository } from '../infrastructure/repositories/LessonSessionRepository';
import { AttendanceRepository } from '../infrastructure/repositories/AttendanceRepository';
import { SessionService } from '../core/services/SessionService/SessionService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const sessionRepository = new LessonSessionRepository();
const attendanceRepository = new AttendanceRepository();

const sessionService = new SessionService(sessionRepository, attendanceRepository);
const sessionController = new SessionController(sessionService);

const router = Router();

router.post('/', AuthMiddleware, (req, res, next) => sessionController.createLessonSession(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => sessionController.getAllSessions(req, res, next));
router.put('/:id', AuthMiddleware, (req, res, next) => sessionController.updateLessonSession(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => sessionController.deleteLessonSession(req, res, next));
router.get('/attendance/student/:studentId', AuthMiddleware, (req, res, next) => sessionController.getAttendancesByStudent(req, res, next));
router.get('/:id/attendance', AuthMiddleware, (req, res, next) => sessionController.getAttendance(req, res, next));
router.post('/:id/attendance', AuthMiddleware, (req, res, next) => sessionController.markAttendance(req, res, next));

export const sessionRouter = router;
