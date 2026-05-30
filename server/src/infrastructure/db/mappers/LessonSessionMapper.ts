import { LessonSession as PrismaLessonSession } from '@prisma/client';
import { LessonSessionEntity } from '../../../core/entities/LessonSessionEntity';

export class LessonSessionMapper {
    public static toEntity(session: PrismaLessonSession): LessonSessionEntity {
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
