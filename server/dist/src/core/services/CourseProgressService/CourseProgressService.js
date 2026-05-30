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
exports.CourseProgressService = void 0;
const HttpError_1 = require("../../../errors/HttpError");
class CourseProgressService {
    constructor(lessonRepository, submissionRepository, attendanceRepository, homeworkRepository, sessionRepository, moduleRepository) {
        this.lessonRepository = lessonRepository;
        this.submissionRepository = submissionRepository;
        this.attendanceRepository = attendanceRepository;
        this.homeworkRepository = homeworkRepository;
        this.sessionRepository = sessionRepository;
        this.moduleRepository = moduleRepository;
    }
    canAccessLesson(studentId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetLesson = yield this.lessonRepository.findById(lessonId);
            if (!targetLesson) {
                throw new HttpError_1.NotFoundError('Урок не найден');
            }
            const targetModule = yield this.moduleRepository.findById(targetLesson.moduleId);
            if (!targetModule)
                return true; // Fallback
            const courseModules = yield this.moduleRepository.findAll();
            const courseModuleIds = courseModules.filter(m => m.courseId === targetModule.courseId).map(m => m.id);
            const allLessons = yield this.lessonRepository.findAll();
            const courseLessons = allLessons
                .filter(l => courseModuleIds.includes(l.moduleId))
                .sort((a, b) => {
                const aModIndex = courseModuleIds.indexOf(a.moduleId);
                const bModIndex = courseModuleIds.indexOf(b.moduleId);
                if (aModIndex === bModIndex) {
                    return a.orderNumber - b.orderNumber;
                }
                return aModIndex - bModIndex;
            });
            const currentIndex = courseLessons.findIndex(l => l.id === targetLesson.id);
            if (currentIndex <= 0) {
                return true;
            }
            const previousLesson = courseLessons[currentIndex - 1];
            // Check Homework for previous lesson
            const allHomeworks = yield this.homeworkRepository.findAll();
            const previousLessonHomeworks = allHomeworks.filter(h => h.lessonId === previousLesson.id);
            // If there's no homework for the previous lesson, we assume it's "completed" automatically
            if (previousLessonHomeworks.length === 0) {
                return true;
            }
            const submissions = yield this.submissionRepository.findSubmissionsByStudentId(studentId);
            const hasAcceptedHomework = previousLessonHomeworks.every(hw => submissions.some(sub => sub.homeworkId === hw.id && sub.score === 100));
            return hasAcceptedHomework;
        });
    }
}
exports.CourseProgressService = CourseProgressService;
