"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonSessionMapper = void 0;
class LessonSessionMapper {
    static toEntity(session) {
        return {
            id: session.id,
            scheduledAt: session.scheduledAt,
            durationMin: session.durationMin,
            meetingLink: session.meetingLink,
            lessonId: session.lessonId,
            groupId: session.groupId,
            teacherId: session.teacherId,
        };
    }
}
exports.LessonSessionMapper = LessonSessionMapper;
