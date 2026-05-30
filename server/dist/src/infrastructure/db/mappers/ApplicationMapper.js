"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationMapper = void 0;
class ApplicationMapper {
    static toEntity(application) {
        return {
            id: application.id,
            courseId: application.courseId,
            parentName: application.parentName,
            studentName: application.studentName,
            phone: application.phone,
            email: application.email,
            status: application.status,
            createdAt: application.createdAt,
            managerId: application.managerId,
        };
    }
}
exports.ApplicationMapper = ApplicationMapper;
