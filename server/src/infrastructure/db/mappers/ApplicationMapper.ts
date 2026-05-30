import { Application as PrismaApplication } from '@prisma/client';
import { ApplicationEntity, ApplicationStatus } from "../../../core/entities/ApplicationEntity";

export class ApplicationMapper {
    public static toEntity(application: PrismaApplication): ApplicationEntity {
        return {
            id: application.id,
            courseId: application.courseId,
            parentName: application.parentName,
            studentName: application.studentName,
            phone: application.phone,
            email: application.email,
            status: application.status as ApplicationStatus,
            createdAt: application.createdAt,
            managerId: application.managerId,
        };
    }
}
