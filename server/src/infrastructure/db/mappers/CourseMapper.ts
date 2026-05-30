import { Course as PrismaCourse } from '@prisma/client';
import { CourseEntity } from '../../../core/entities/CourseEntity';

export class CourseMapper {
    public static toEntity(course: PrismaCourse): CourseEntity {
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            ageCategory: course.ageCategory,
            price: course.price,
        };
    }
}
