import { Router } from 'express';
import { HomeworkController } from '../presentation/controllers/HomeworkController';
import { HomeworkRepository } from '../infrastructure/repositories/HomeworkRepository';
import { HomeworkSubmissionRepository } from '../infrastructure/repositories/HomeworkSubmissionRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { HomeworkService } from '../core/services/HomeworkService/HomeworkService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validate } from '../middleware/ValidationMiddleware';
import { CreateHomeworkSchema } from '../core/repositories/HomeworkRepository/dto/CreateHomeworkDto';
import { UpdateHomeworkSchema } from '../core/repositories/HomeworkRepository/dto/UpdateHomeworkDto';

const homeworkRepository = new HomeworkRepository();
const submissionRepository = new HomeworkSubmissionRepository();
const userRepository = new UserRepository();

const homeworkService = new HomeworkService(homeworkRepository, submissionRepository, userRepository);
const homeworkController = new HomeworkController(homeworkService);

const router = Router();

router.get('/lesson/:lessonId', AuthMiddleware, (req, res, next) => homeworkController.getHomeworksByLessonId(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => homeworkController.getAllHomeworks(req, res, next));
router.get('/submissions', AuthMiddleware, (req, res, next) => homeworkController.getAllSubmissions(req, res, next));
router.get('/submissions/teacher/:teacherId', AuthMiddleware, (req, res, next) => homeworkController.getSubmissionsByTeacherId(req, res, next));
router.get('/submissions/student/:studentId', AuthMiddleware, (req, res, next) => homeworkController.getSubmissionsByStudentId(req, res, next));
router.post('/', AuthMiddleware, validate(CreateHomeworkSchema), (req, res, next) => homeworkController.createHomework(req, res, next));
router.patch('/:id', AuthMiddleware, validate(UpdateHomeworkSchema), (req, res, next) => homeworkController.update(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => homeworkController.delete(req, res, next));
router.post('/submit', AuthMiddleware, (req, res, next) => homeworkController.submitHomework(req, res, next));
router.patch('/grade/:submissionId', AuthMiddleware, (req, res, next) => homeworkController.gradeHomework(req, res, next));

export const homeworkRouter = router;
