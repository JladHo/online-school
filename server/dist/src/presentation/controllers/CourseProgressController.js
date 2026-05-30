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
exports.CourseProgressController = void 0;
class CourseProgressController {
    constructor(courseProgressService) {
        this.courseProgressService = courseProgressService;
    }
    canAccessLesson(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentId = parseInt(String(req.params.studentId), 10);
                const lessonId = parseInt(String(req.params.lessonId), 10);
                if (isNaN(studentId) || isNaN(lessonId)) {
                    return res.status(400).json({ message: 'Invalid studentId or lessonId' });
                }
                const canAccess = yield this.courseProgressService.canAccessLesson(studentId, lessonId);
                res.status(200).json({ canAccess });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.CourseProgressController = CourseProgressController;
