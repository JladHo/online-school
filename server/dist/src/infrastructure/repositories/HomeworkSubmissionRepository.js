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
exports.HomeworkSubmissionRepository = void 0;
const db_1 = require("../db");
const HomeworkSubmissionMapper_1 = require("../db/mappers/HomeworkSubmissionMapper");
class HomeworkSubmissionRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield db_1.prisma.homeworkSubmission.create({
                data: Object.assign({}, dto),
            });
            return HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity(submission);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield db_1.prisma.homeworkSubmission.findUnique({
                where: { id },
            });
            return submission ? HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity(submission) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const submissions = yield db_1.prisma.homeworkSubmission.findMany();
            return submissions.map(HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield db_1.prisma.homeworkSubmission.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity(submission);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.homeworkSubmission.delete({
                where: { id },
            });
        });
    }
    findSubmissionsByHomeworkId(homeworkId) {
        return __awaiter(this, void 0, void 0, function* () {
            const submissions = yield db_1.prisma.homeworkSubmission.findMany({
                where: { homeworkId },
            });
            return submissions.map(HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity);
        });
    }
    findSubmissionsByStudentId(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const submissions = yield db_1.prisma.homeworkSubmission.findMany({
                where: { studentId },
            });
            return submissions.map(HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity);
        });
    }
    findSubmissionsByTeacherId(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all submissions with their course context
            const submissions = yield db_1.prisma.homeworkSubmission.findMany({
                include: {
                    homework: {
                        include: {
                            lesson: {
                                include: {
                                    module: true
                                }
                            }
                        }
                    }
                }
            });
            // Fetch all student-course links for this specific teacher
            const teacherLinks = yield db_1.prisma.studentGroup.findMany({
                where: {
                    group: {
                        teacherId: teacherId
                    }
                },
                include: {
                    group: true
                }
            });
            // Strictly filter: The teacher must be assigned to THIS student for THIS specific course
            const validSubmissions = submissions.filter(sub => {
                const courseId = sub.homework.lesson.module.courseId;
                return teacherLinks.some(link => link.studentId === sub.studentId && link.group.courseId === courseId);
            });
            return validSubmissions.map(HomeworkSubmissionMapper_1.HomeworkSubmissionMapper.toEntity);
        });
    }
}
exports.HomeworkSubmissionRepository = HomeworkSubmissionRepository;
