"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonMapper = void 0;
class LessonMapper {
    static toEntity(lesson) {
        return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            orderNumber: lesson.orderNumber,
            moduleId: lesson.moduleId,
        };
    }
}
exports.LessonMapper = LessonMapper;
