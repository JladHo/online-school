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
exports.StudentGroupRepository = void 0;
const db_1 = require("../db");
const StudentGroupMapper_1 = require("../db/mappers/StudentGroupMapper");
class StudentGroupRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentGroup = yield db_1.prisma.studentGroup.create({
                data: Object.assign({}, dto),
            });
            return StudentGroupMapper_1.StudentGroupMapper.toEntity(studentGroup);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentGroup = yield db_1.prisma.studentGroup.findUnique({
                where: {
                    studentId_groupId: {
                        studentId: id.studentId,
                        groupId: id.groupId,
                    },
                },
            });
            return studentGroup ? StudentGroupMapper_1.StudentGroupMapper.toEntity(studentGroup) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const studentGroups = yield db_1.prisma.studentGroup.findMany();
            return studentGroups.map(StudentGroupMapper_1.StudentGroupMapper.toEntity);
        });
    }
    updateNote(studentId, groupId, note) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield db_1.prisma.studentGroup.update({
                where: {
                    studentId_groupId: { studentId, groupId }
                },
                data: { teacherNote: note }
            });
            return StudentGroupMapper_1.StudentGroupMapper.toEntity(updated);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const studentGroup = yield db_1.prisma.studentGroup.update({
                where: {
                    studentId_groupId: {
                        studentId: id.studentId,
                        groupId: id.groupId,
                    },
                },
                data: Object.assign({}, dto),
            });
            return StudentGroupMapper_1.StudentGroupMapper.toEntity(studentGroup);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.studentGroup.delete({
                where: {
                    studentId_groupId: {
                        studentId: id.studentId,
                        groupId: id.groupId,
                    },
                },
            });
        });
    }
}
exports.StudentGroupRepository = StudentGroupRepository;
