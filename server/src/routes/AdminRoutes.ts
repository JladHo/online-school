import { Router } from 'express';
import { AdminController } from '../presentation/controllers/AdminController';
import { AdminService } from '../core/services/AdminService/AdminService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { RoleMiddleware } from '../middleware/RoleMiddleware';

const adminService = new AdminService();
const adminController = new AdminController(adminService);

const router = Router();

// Защищаем все маршруты админа
router.use(AuthMiddleware, RoleMiddleware(['admin']));

router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.post('/users', (req, res, next) => adminController.createUser(req, res, next));
router.patch('/users/:id', (req, res, next) => adminController.updateUser(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));

router.get('/courses', (req, res, next) => adminController.getCourses(req, res, next));
router.post('/courses', (req, res, next) => adminController.createCourse(req, res, next));
router.patch('/courses/:id', (req, res, next) => adminController.updateCourse(req, res, next));
router.delete('/courses/:id', (req, res, next) => adminController.deleteCourse(req, res, next));

router.get('/sales', (req, res, next) => adminController.getSalesHistory(req, res, next));

export const adminRouter = router;
