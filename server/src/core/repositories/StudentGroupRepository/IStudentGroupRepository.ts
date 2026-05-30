import { StudentGroupEntity } from '../../entities/StudentGroupEntity';
import { CreateStudentGroupDto } from './dto/CreateStudentGroupDto';
import { UpdateStudentGroupDto } from './dto/UpdateStudentGroupDto';

export interface IStudentGroupRepository {
    create(dto: CreateStudentGroupDto): Promise<StudentGroupEntity>;
    findById(id: { studentId: number, groupId: number }): Promise<StudentGroupEntity | null>;
    findAll(): Promise<StudentGroupEntity[]>;
    update(id: { studentId: number, groupId: number }, dto: UpdateStudentGroupDto): Promise<StudentGroupEntity | null>;
    updateNote(studentId: number, groupId: number, note: string | null): Promise<StudentGroupEntity>;
    delete(id: { studentId: number, groupId: number }): Promise<void>;
}
