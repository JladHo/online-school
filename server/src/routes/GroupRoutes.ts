import { Router } from 'express';
import { GroupController } from '../presentation/controllers/GroupController';
import { GroupRepository } from '../infrastructure/repositories/GroupRepository';
import { StudentGroupRepository } from '../infrastructure/repositories/StudentGroupRepository';
import { GroupService } from '../core/services/GroupService/GroupService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const groupRepository = new GroupRepository();
const studentGroupRepository = new StudentGroupRepository();
const groupService = new GroupService(groupRepository, studentGroupRepository);
const groupController = new GroupController(groupService);

const router = Router();

router.post('/', AuthMiddleware, (req, res, next) => groupController.createGroup(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => groupController.getAllGroups(req, res, next));
router.get('/teacher/:teacherId', AuthMiddleware, (req, res, next) => groupController.getGroupsByTeacherId(req, res, next));
router.post('/teacher/:teacherId/claim', AuthMiddleware, (req, res, next) => groupController.claimStudent(req, res, next));
router.post('/:id/students', AuthMiddleware, (req, res, next) => groupController.addStudent(req, res, next));
router.delete('/:id/students/:studentId', AuthMiddleware, (req, res, next) => groupController.removeStudent(req, res, next));
router.get('/:id/students', AuthMiddleware, (req, res, next) => groupController.listGroupStudents(req, res, next));
router.patch('/:groupId/students/:studentId/note', AuthMiddleware, (req, res, next) => groupController.updateStudentNote(req, res, next));
router.patch('/:id/teacher', AuthMiddleware, (req, res, next) => groupController.assignTeacher(req, res, next));
router.patch('/:id', AuthMiddleware, (req, res, next) => groupController.updateGroup(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => groupController.deleteGroup(req, res, next));

export const groupRouter = router;
