"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentGroupMapper = void 0;
class StudentGroupMapper {
    static toEntity(studentGroup) {
        return {
            studentId: studentGroup.studentId,
            groupId: studentGroup.groupId,
            teacherNote: studentGroup.teacherNote,
        };
    }
}
exports.StudentGroupMapper = StudentGroupMapper;
