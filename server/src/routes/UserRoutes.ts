import {Router} from "express";
import {UserController} from "../presentation/controllers/UserController";
import {UserRepository} from "../infrastructure/repositories/UserRepository";
import {UserService} from "../core/services/UserService/UserService";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

router.post('/register',  (req, res, next) => userController.register(req, res, next));
router.post('/login', (req, res, next) => userController.login(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', AuthMiddleware, (req, res, next) => userController.getUserById(req, res, next));
router.patch('/:id', AuthMiddleware, (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => userController.deleteUser(req, res, next));

export const userRouter = router;