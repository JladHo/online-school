import { StudentGroup as PrismaStudentGroup } from '@prisma/client';
import { StudentGroupEntity } from '../../../core/entities/StudentGroupEntity';

export class StudentGroupMapper {
    public static toEntity(studentGroup: PrismaStudentGroup): StudentGroupEntity {
        return {
            studentId: studentGroup.studentId,
            groupId: studentGroup.groupId,
            teacherNote: studentGroup.teacherNote,
        };
    }
}
