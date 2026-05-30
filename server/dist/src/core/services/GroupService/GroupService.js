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
exports.GroupService = void 0;
const HttpError_1 = require("../../../errors/HttpError");
const db_1 = require("../../../infrastructure/db");
class GroupService {
    constructor(groupRepository, studentGroupRepository) {
        this.groupRepository = groupRepository;
        this.studentGroupRepository = studentGroupRepository;
    }
    claimStudent(teacherId, studentId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent race condition: check if student is ALREADY assigned to any group for this course
            const studentAlreadyInCourse = yield db_1.prisma.studentGroup.findFirst({
                where: {
                    studentId: studentId,
                    group: { courseId: courseId }
                }
            });
            if (studentAlreadyInCourse) {
                throw new HttpError_1.ConflictError('Этот ученик уже был взят преподавателем по этому курсу');
            }
            // Always create a new individual group for the student
            const student = yield db_1.prisma.user.findUnique({ where: { id: studentId } });
            const course = yield db_1.prisma.course.findUnique({ where: { id: courseId } });
            const studentName = student ? (student.studentName || student.fullName || 'Студент') : 'Студент';
            const courseTitle = course ? course.title : 'Курс';
            const groupName = `Инд. ${studentName} | ${courseTitle}`;
            const group = yield db_1.prisma.group.create({
                data: {
                    name: groupName,
                    type: 'individual',
                    courseId,
                    teacherId
                }
            });
            return db_1.prisma.studentGroup.create({
                data: { studentId, groupId: group.id }
            });
        });
    }
    createGroup(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.groupRepository.create(dto);
        });
    }
    updateGroup(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.groupRepository.update(id, dto);
            if (!updated) {
                throw new HttpError_1.NotFoundError('Группа не найдена');
            }
            return updated;
        });
    }
    deleteGroup(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.groupRepository.delete(id);
        });
    }
    assignTeacher(groupId, teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.groupRepository.findById(groupId);
            if (!group) {
                throw new HttpError_1.NotFoundError('Группа не найдена');
            }
            const updatedGroup = yield this.groupRepository.update(groupId, { teacherId });
            if (!updatedGroup) {
                throw new HttpError_1.NotFoundError('Не удалось обновить группу');
            }
            return updatedGroup;
        });
    }
    addStudent(groupId, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.groupRepository.findById(groupId);
            if (!group) {
                throw new HttpError_1.NotFoundError('Группа не найдена');
            }
            // Проверка: состоит ли ученик уже в КАКОЙ-ЛИБО группе по этому же курсу?
            const studentAlreadyInCourse = yield db_1.prisma.studentGroup.findFirst({
                where: {
                    studentId: studentId,
                    group: { courseId: group.courseId }
                }
            });
            if (studentAlreadyInCourse) {
                throw new HttpError_1.ConflictError('Ученик уже обучается по этому курсу в другой группе (или индивидуально)');
            }
            const existingLink = yield this.studentGroupRepository.findById({ studentId, groupId });
            if (existingLink) {
                throw new HttpError_1.ConflictError('Ученик уже добавлен в эту группу');
            }
            // Внедрение бизнес-логики: ограничение вместимости групповых занятий
            if (group.type === 'group') {
                const allLinks = yield this.studentGroupRepository.findAll();
                const currentStudentCount = allLinks.filter(link => link.groupId === groupId).length;
                if (currentStudentCount >= 6) {
                    throw new HttpError_1.ConflictError('Группа уже заполнена (максимум 6 человек).');
                }
            }
            return this.studentGroupRepository.create({ studentId, groupId });
        });
    }
    removeStudent(groupId, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const link = yield this.studentGroupRepository.findById({ studentId, groupId });
            if (!link) {
                throw new HttpError_1.NotFoundError('Связь ученика с группой не найдена');
            }
            yield db_1.prisma.studentGroup.delete({
                where: { studentId_groupId: { studentId, groupId } }
            });
        });
    }
    listGroupStudents(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.groupRepository.findById(groupId);
            if (!group) {
                throw new HttpError_1.NotFoundError('Группа не найдена');
            }
            const allLinks = yield this.studentGroupRepository.findAll();
            return allLinks.filter(link => link.groupId === groupId);
        });
    }
    getAllGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.groupRepository.findAll();
        });
    }
    getGroupsByTeacherId(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.groupRepository.findGroupsByTeacherId(teacherId);
        });
    }
    updateStudentNote(groupId, studentId, note) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.studentGroupRepository.updateNote(studentId, groupId, note);
        });
    }
}
exports.GroupService = GroupService;
