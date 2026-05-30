import {Router} from "express";
import {UserController} from "../presentation/controllers/UserController";
import {UserRepository} from "../infrastructure/repositories/UserRepository";
import {UserService} from "../core/services/UserService/UserService";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import rateLimit from "express-rate-limit";
import {validate} from "../middleware/ValidationMiddleware";
import {LoginSchema} from "../core/repositories/UserRepository/dto/LoginDto";
import {UpdateUserSchema} from "../core/repositories/UserRepository/dto/UpdateUserDto";
import {CreateUserSchema} from "../core/repositories/UserRepository/dto/CreateUserDto";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 1000,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Слишком много запросов. Попробуйте чере 15 минут',
})

const router = Router();

router.post('/login', authLimiter, validate(LoginSchema), (req, res, next) => userController.login(req, res, next));
router.post('/', AuthMiddleware, validate(CreateUserSchema), (req, res, next) => userController.createUser(req, res, next));

// Points & Store
router.get('/:id/points-history', AuthMiddleware, (req, res, next) => userController.getPointsHistory(req, res, next));
router.get('/store/items', AuthMiddleware, (req, res, next) => userController.getStoreItems(req, res, next));
router.post('/:id/purchase-store-item', AuthMiddleware, (req, res, next) => userController.purchaseItem(req, res, next));
router.post('/:id/course-access', AuthMiddleware, (req, res, next) => userController.grantCourseAccess(req, res, next));
router.delete('/:id/course-access/:courseId', AuthMiddleware, (req, res, next) => userController.revokeCourseAccess(req, res, next));
router.get('/:id/courses', AuthMiddleware, (req, res, next) => userController.getUserCourses(req, res, next));
router.get('/:id/groups', AuthMiddleware, (req, res, next) => userController.getUserGroups(req, res, next));

router.get('/manager/students', AuthMiddleware, (req, res, next) => userController.getStudentsForManager(req, res, next));
router.get('/manager/store-orders', AuthMiddleware, (req, res, next) => userController.getStoreOrders(req, res, next));
router.patch('/manager/store-orders/:orderId', AuthMiddleware, (req, res, next) => userController.updateStoreOrder(req, res, next));
router.get('/pool', AuthMiddleware, (req, res, next) => userController.getFreePool(req, res, next));

router.get('/', AuthMiddleware, (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', AuthMiddleware, (req, res, next) => userController.getUserById(req, res, next));
router.patch('/:id', AuthMiddleware, validate(UpdateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => userController.deleteUser(req, res, next));

export const userRouter = router;
