import {Router} from "express";
import {UserController} from "../presentation/controllers/UserController";
import {UserRepository} from "../infrastructure/repositories/UserRepository";
import {UserService} from "../core/services/UserService/UserService";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import rateLimit from "express-rate-limit";
import {validate} from "../middleware/ValidationMiddleware";
import {LoginSchema} from "../core/repositories/UserRepository/dto/LoginDto";
import {UpdateUserSchema} from "../core/repositories/UserRepository/dto/UpdateUserDto";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Слишком много запросов. Попробуйте чере 15 минут'
});

router.post('/login', authLimiter, validate(LoginSchema), (req, res, next) => userController.login(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', AuthMiddleware, (req, res, next) => userController.getUserById(req, res, next));
router.patch('/:id', AuthMiddleware, validate(UpdateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => userController.deleteUser(req, res, next));

export const userRouter = router;
