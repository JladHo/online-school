import { Homework as PrismaHomework } from '@prisma/client';
import { HomeworkEntity } from '../../../core/entities/HomeworkEntity';

export class HomeworkMapper {
    public static toEntity(homework: PrismaHomework): HomeworkEntity {
        return {
            id: homework.id,
            description: homework.description,
            lessonId: homework.lessonId,
        };
    }
}
