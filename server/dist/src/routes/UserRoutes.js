"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const UserController_1 = require("../presentation/controllers/UserController");
const UserRepository_1 = require("../infrastructure/repositories/UserRepository");
const UserService_1 = require("../core/services/UserService/UserService");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const LoginDto_1 = require("../core/repositories/UserRepository/dto/LoginDto");
const UpdateUserDto_1 = require("../core/repositories/UserRepository/dto/UpdateUserDto");
const CreateUserDto_1 = require("../core/repositories/UserRepository/dto/CreateUserDto");
const userRepository = new UserRepository_1.UserRepository();
const userService = new UserService_1.UserService(userRepository);
const userController = new UserController_1.UserController(userService);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Слишком много запросов. Попробуйте чере 15 минут',
});
const router = (0, express_1.Router)();
router.post('/login', authLimiter, (0, ValidationMiddleware_1.validate)(LoginDto_1.LoginSchema), (req, res, next) => userController.login(req, res, next));
router.post('/', AuthMiddleware_1.AuthMiddleware, (0, ValidationMiddleware_1.validate)(CreateUserDto_1.CreateUserSchema), (req, res, next) => userController.createUser(req, res, next));
// Points & Store
router.get('/:id/points-history', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getPointsHistory(req, res, next));
router.get('/store/items', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getStoreItems(req, res, next));
router.post('/:id/purchase-store-item', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.purchaseItem(req, res, next));
router.post('/:id/course-access', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.grantCourseAccess(req, res, next));
router.delete('/:id/course-access/:courseId', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.revokeCourseAccess(req, res, next));
router.get('/:id/courses', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getUserCourses(req, res, next));
router.get('/:id/groups', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getUserGroups(req, res, next));
router.get('/manager/students', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getStudentsForManager(req, res, next));
router.get('/manager/store-orders', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getStoreOrders(req, res, next));
router.patch('/manager/store-orders/:orderId', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.updateStoreOrder(req, res, next));
router.get('/pool', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getFreePool(req, res, next));
router.get('/', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.getUserById(req, res, next));
router.patch('/:id', AuthMiddleware_1.AuthMiddleware, (0, ValidationMiddleware_1.validate)(UpdateUserDto_1.UpdateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', AuthMiddleware_1.AuthMiddleware, (req, res, next) => userController.deleteUser(req, res, next));
exports.userRouter = router;
