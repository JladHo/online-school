"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createUserDto = req.body;
                const result = yield this.userService.create(createUserDto);
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginDto = req.body;
                const result = yield this.userService.login(loginDto);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userService.findAll();
                res.status(200).json(users);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const user = yield this.userService.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.status(200).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const authUser = req.user;
                // Only allow users to update their own profile, unless they are admin
                if (authUser.id !== userId && authUser.role !== 'admin') {
                    return res.status(403).json({ message: 'Нет доступа для изменения чужого профиля' });
                }
                const updateUserDto = req.body;
                // Prevent changing role via this endpoint
                delete updateUserDto.role;
                const updatedUser = yield this.userService.update(userId, updateUserDto);
                if (!updatedUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.status(200).json(updatedUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const user = yield this.userService.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                yield this.userService.delete(userId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPointsHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const history = yield this.userService.getPointsHistory(userId);
                res.status(200).json(history);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStoreItems(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield this.userService.getStoreItems();
                res.status(200).json(items);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserCourses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const courses = yield this.userService.getUserCourses(userId);
                res.status(200).json(courses);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserGroups(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const groups = yield this.userService.getUserGroups(userId);
                res.status(200).json(groups);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStudentsForManager(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const students = yield this.userService.getStudentsForManager();
                res.status(200).json(students);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getFreePool(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield this.userService.getFreePool();
                res.status(200).json(pool);
            }
            catch (error) {
                next(error);
            }
        });
    }
    purchaseItem(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const { itemId } = req.body;
                const updatedUser = yield this.userService.purchaseStoreItem(userId, itemId);
                res.status(200).json(updatedUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
    grantCourseAccess(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const { courseId } = req.body;
                const purchase = yield this.userService.grantCourseAccess(userId, courseId);
                res.status(201).json(purchase);
            }
            catch (error) {
                next(error);
            }
        });
    }
    revokeCourseAccess(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(String(req.params.id), 10);
                const courseId = parseInt(String(req.params.courseId), 10);
                yield this.userService.revokeCourseAccess(userId, courseId);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStoreOrders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield this.userService.getStoreOrders();
                res.status(200).json(orders);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateStoreOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = parseInt(String(req.params.orderId), 10);
                const { status } = req.body;
                const managerId = req.user.id;
                const updatedOrder = yield this.userService.updateStoreOrder(orderId, status, managerId);
                res.status(200).json(updatedOrder);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
