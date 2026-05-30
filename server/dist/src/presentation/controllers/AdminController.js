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
exports.AdminController = void 0;
class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.adminService.getStats();
                res.json(stats);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.adminService.getAllUsers();
                res.json(users);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.adminService.createUser(req.body);
                res.status(201).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const user = yield this.adminService.updateUser(id, req.body);
                res.json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.adminService.deleteUser(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCourses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courses = yield this.adminService.getAllCourses();
                res.json(courses);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield this.adminService.createCourse(req.body);
                res.status(201).json(course);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const course = yield this.adminService.updateCourse(id, req.body);
                res.json(course);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteCourse(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.adminService.deleteCourse(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSalesHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sales = yield this.adminService.getSalesHistory();
                res.json(sales);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AdminController = AdminController;
