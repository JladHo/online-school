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
exports.HomeworkController = void 0;
const CreateHomeworkSubmissionDto_1 = require("../../core/repositories/HomeworkSubmissionRepository/dto/CreateHomeworkSubmissionDto");
class HomeworkController {
    constructor(homeworkService) {
        this.homeworkService = homeworkService;
    }
    getHomeworksByLessonId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lessonId = parseInt(String(req.params.lessonId), 10);
                const homeworks = yield this.homeworkService.getHomeworksByLessonId(lessonId);
                res.status(200).json(homeworks);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllHomeworks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const homeworks = yield this.homeworkService.getAllHomeworks();
                res.status(200).json(homeworks);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSubmissionsByStudentId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const studentId = parseInt(String(req.params.studentId), 10);
                const submissions = yield this.homeworkService.getSubmissionsByStudentId(studentId);
                res.status(200).json(submissions);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSubmissionsByTeacherId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teacherId = parseInt(String(req.params.teacherId), 10);
                const submissions = yield this.homeworkService.getSubmissionsByTeacherId(teacherId);
                res.status(200).json(submissions);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllSubmissions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const submissions = yield this.homeworkService.getAllSubmissions();
                res.status(200).json(submissions);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createHomework(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const homework = yield this.homeworkService.createHomework(data);
                res.status(201).json(homework);
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const data = req.body;
                const homework = yield this.homeworkService.updateHomework(id, data);
                res.status(200).json(homework);
            }
            catch (error) {
                next(error);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                yield this.homeworkService.deleteHomework(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    submitHomework(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = CreateHomeworkSubmissionDto_1.CreateHomeworkSubmissionSchema.parse(req.body);
                const submission = yield this.homeworkService.submitHomework(data);
                res.status(201).json(submission);
            }
            catch (error) {
                next(error);
            }
        });
    }
    gradeHomework(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const submissionId = parseInt(String(req.params.submissionId), 10);
                const { score, teacherId, comment } = req.body;
                const updatedSubmission = yield this.homeworkService.gradeHomework(submissionId, score, teacherId, comment);
                res.status(200).json(updatedSubmission);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.HomeworkController = HomeworkController;
