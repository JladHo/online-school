import { Group as PrismaGroup } from '@prisma/client';
import { GroupEntity, GroupType } from '../../../core/entities/GroupEntity';

export class GroupMapper {
    public static toEntity(group: PrismaGroup): GroupEntity {
        return {
            id: group.id,
            name: group.name,
            type: group.type as GroupType,
            courseId: group.courseId,
            teacherId: group.teacherId,
        };
    }
}
