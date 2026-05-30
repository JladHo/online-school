"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseMapper = void 0;
class CourseMapper {
    static toEntity(course) {
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            ageCategory: course.ageCategory,
            price: course.price,
        };
    }
}
exports.CourseMapper = CourseMapper;
