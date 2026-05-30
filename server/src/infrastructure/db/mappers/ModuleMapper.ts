import { Module as PrismaModule } from '@prisma/client';
import { ModuleEntity } from '../../../core/entities/ModuleEntity';

export class ModuleMapper {
    public static toEntity(module: PrismaModule): ModuleEntity {
        return {
            id: module.id,
            title: module.title,
            description: module.description,
            courseId: module.courseId,
        };
    }
}
