"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMapper = void 0;
class GroupMapper {
    static toEntity(group) {
        return {
            id: group.id,
            name: group.name,
            type: group.type,
            courseId: group.courseId,
            teacherId: group.teacherId,
        };
    }
}
exports.GroupMapper = GroupMapper;
