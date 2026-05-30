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
exports.lessonRouter = void 0;
const express_1 = require("express");
const LessonController_1 = require("../presentation/controllers/LessonController");
const LessonRepository_1 = require("../infrastructure/repositories/LessonRepository");
const LessonService_1 = require("../core/services/LessonService/LessonService");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const ValidationMiddleware_1 = require("../middleware/ValidationMiddleware");
const CreateLessonDto_1 = require("../core/repositories/LessonRepository/dto/CreateLessonDto");
const UpdateLessonDto_1 = require("../core/repositories/LessonRepository/dto/UpdateLessonDto");
const CourseProgressRoutes_1 = require("./CourseProgressRoutes");
const HttpError_1 = require("../errors/HttpError");
const lessonRepository = new LessonRepository_1.LessonRepository();
const lessonService = new LessonService_1.LessonService(lessonRepository);
const lessonController = new LessonController_1.LessonController(lessonService);
const router = (0, express_1.Router)();
router.post('/', AuthMiddleware_1.AuthMiddleware, (0, ValidationMiddleware_1.validate)(CreateLessonDto_1.CreateLessonSchema), (req, res, next) => lessonController.create(req, res, next));
router.get('/', AuthMiddleware_1.AuthMiddleware, (req, res, next) => lessonController.getAll(req, res, next));
router.get('/:id', AuthMiddleware_1.AuthMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const lessonId = parseInt(String(req.params.id), 10);
        // BOLA Fix: If user is a student, check if they have access to this lesson
        if (user && user.role === 'user') {
            const canAccess = yield CourseProgressRoutes_1.courseProgressService.canAccessLesson(user.id, lessonId);
            if (!canAccess) {
                throw new HttpError_1.ForbiddenError('У вас нет доступа к этому уроку (сдайте ДЗ за прошлый)');
            }
        }
        // If passed (or if teacher/admin), proceed to controller
        return lessonController.getById(req, res, next);
    }
    catch (e) {
        next(e);
    }
}));
router.patch('/:id', AuthMiddleware_1.AuthMiddleware, (0, ValidationMiddleware_1.validate)(UpdateLessonDto_1.UpdateLessonSchema), (req, res, next) => lessonController.update(req, res, next));
router.delete('/:id', AuthMiddleware_1.AuthMiddleware, (req, res, next) => lessonController.delete(req, res, next));
exports.lessonRouter = router;
