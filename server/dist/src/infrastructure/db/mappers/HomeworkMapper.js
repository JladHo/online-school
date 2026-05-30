"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkMapper = void 0;
class HomeworkMapper {
    static toEntity(homework) {
        return {
            id: homework.id,
            description: homework.description,
            lessonId: homework.lessonId,
        };
    }
}
exports.HomeworkMapper = HomeworkMapper;
