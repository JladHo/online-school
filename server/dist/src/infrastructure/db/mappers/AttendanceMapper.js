"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceMapper = void 0;
class AttendanceMapper {
    static toEntity(attendance) {
        return {
            id: attendance.id,
            isPresent: attendance.isPresent,
            sessionId: attendance.sessionId,
            studentId: attendance.studentId,
        };
    }
}
exports.AttendanceMapper = AttendanceMapper;
