import { GroupEntity } from '../../entities/GroupEntity';
import { CreateGroupDto } from './dto/CreateGroupDto';
import { UpdateGroupDto } from './dto/UpdateGroupDto';

export interface IGroupRepository {
    create(dto: CreateGroupDto): Promise<GroupEntity>;
    findById(id: number): Promise<GroupEntity | null>;
    findAll(): Promise<GroupEntity[]>;
    findGroupsByTeacherId(teacherId: number): Promise<GroupEntity[]>;
    update(id: number, dto: UpdateGroupDto): Promise<GroupEntity | null>;
    delete(id: number): Promise<void>;
}
