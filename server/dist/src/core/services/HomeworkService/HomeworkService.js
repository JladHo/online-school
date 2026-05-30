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
exports.HomeworkService = void 0;
const HttpError_1 = require("../../../errors/HttpError");
const db_1 = require("../../../infrastructure/db");
class HomeworkService {
    constructor(homeworkRepository, submissionRepository, userRepository) {
        this.homeworkRepository = homeworkRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
    }
    getHomeworksByLessonId(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const homeworks = yield this.homeworkRepository.findAll();
            return homeworks.filter(h => h.lessonId === lessonId);
        });
    }
    getAllHomeworks() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.homeworkRepository.findAll();
        });
    }
    getSubmissionsByStudentId(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionRepository.findSubmissionsByStudentId(studentId);
        });
    }
    getSubmissionsByTeacherId(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionRepository.findSubmissionsByTeacherId(teacherId);
        });
    }
    getAllSubmissions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.submissionRepository.findAll();
        });
    }
    createHomework(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.homeworkRepository.create(dto);
        });
    }
    updateHomework(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.homeworkRepository.update(id, dto);
            if (!updated)
                throw new HttpError_1.NotFoundError('ДЗ не найдено');
            return updated;
        });
    }
    deleteHomework(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.homeworkRepository.delete(id);
        });
    }
    submitHomework(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const homework = yield this.homeworkRepository.findById(dto.homeworkId);
            if (!homework) {
                throw new HttpError_1.NotFoundError('Домашнее задание не найдено');
            }
            const student = yield this.userRepository.findById(dto.studentId);
            if (!student) {
                throw new HttpError_1.NotFoundError('Ученик не найден');
            }
            return this.submissionRepository.create(Object.assign(Object.assign({}, dto), { status: 'pending' }));
        });
    }
    gradeHomework(submissionId, score, teacherId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield this.submissionRepository.findById(submissionId);
            if (!submission) {
                throw new HttpError_1.NotFoundError('Решение домашнего задания не найдено');
            }
            const newStatus = score === 100 ? 'accepted' : 'rejected';
            const updatedSubmission = yield this.submissionRepository.update(submissionId, {
                score,
                status: newStatus,
                teacherComment: comment !== null && comment !== void 0 ? comment : null,
                checkerId: teacherId
            });
            if (!updatedSubmission) {
                throw new HttpError_1.NotFoundError('Не удалось обновить решение');
            }
            // Award points ONLY if it wasn't already accepted with 100 points
            if (score === 100 && submission.status !== 'accepted') {
                const student = yield this.userRepository.findById(submission.studentId);
                if (student) {
                    yield this.userRepository.update(student.id, {
                        bonusPoints: (student.bonusPoints || 0) + 100
                    });
                    // Get homework title for reason
                    const hw = yield this.homeworkRepository.findById(submission.homeworkId);
                    const reason = hw ? `Идеальное ДЗ: Оценка 100` : `Идеальное ДЗ`;
                    yield db_1.prisma.pointTransaction.create({
                        data: {
                            userId: student.id,
                            amount: 100,
                            reason: reason
                        }
                    });
                }
            }
            return updatedSubmission;
        });
    }
}
exports.HomeworkService = HomeworkService;
