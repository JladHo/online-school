"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleMapper = void 0;
class ModuleMapper {
    static toEntity(module) {
        return {
            id: module.id,
            title: module.title,
            description: module.description,
            courseId: module.courseId,
        };
    }
}
exports.ModuleMapper = ModuleMapper;
