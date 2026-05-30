import { Lesson as PrismaLesson } from '@prisma/client';
import { LessonEntity } from '../../../core/entities/LessonEntity';

export class LessonMapper {
    public static toEntity(lesson: PrismaLesson): LessonEntity {
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
