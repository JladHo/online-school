import { IGroupRepository } from "../../core/repositories/GroupRepository/IGroupRepository";
import { CreateGroupDto } from "../../core/repositories/GroupRepository/dto/CreateGroupDto";
import { UpdateGroupDto } from "../../core/repositories/GroupRepository/dto/UpdateGroupDto";
import { GroupEntity } from "../../core/entities/GroupEntity";
import { prisma } from "../db";
import { GroupMapper } from "../db/mappers/GroupMapper";

export class GroupRepository implements IGroupRepository {
    async create(dto: CreateGroupDto): Promise<GroupEntity> {
        const group = await prisma.group.create({
            data: { ...dto },
        });
        return GroupMapper.toEntity(group);
    }

    async findById(id: number): Promise<GroupEntity | null> {
        const group = await prisma.group.findUnique({
            where: { id },
        });
        return group ? GroupMapper.toEntity(group) : null;
    }

    async findAll(): Promise<GroupEntity[]> {
        const groups = await prisma.group.findMany();
        return groups.map(GroupMapper.toEntity);
    }

    async findGroupsByTeacherId(teacherId: number): Promise<GroupEntity[]> {
        const groups = await prisma.group.findMany({
            where: { teacherId }
        });
        return groups.map(GroupMapper.toEntity);
    }

    async update(id: number, dto: UpdateGroupDto): Promise<GroupEntity | null> {
        const group = await prisma.group.update({
            where: { id },
            data: { ...dto },
        });
        return GroupMapper.toEntity(group);
    }

    async delete(id: number): Promise<void> {
        await prisma.group.delete({
            where: { id },
        });
    }
}
