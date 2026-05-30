import { IStudentGroupRepository } from "../../core/repositories/StudentGroupRepository/IStudentGroupRepository";
import { CreateStudentGroupDto } from "../../core/repositories/StudentGroupRepository/dto/CreateStudentGroupDto";
import { UpdateStudentGroupDto } from "../../core/repositories/StudentGroupRepository/dto/UpdateStudentGroupDto";
import { StudentGroupEntity } from "../../core/entities/StudentGroupEntity";
import { prisma } from "../db";
import { StudentGroupMapper } from "../db/mappers/StudentGroupMapper";

export class StudentGroupRepository implements IStudentGroupRepository {
    async create(dto: CreateStudentGroupDto): Promise<StudentGroupEntity> {
        const studentGroup = await prisma.studentGroup.create({
            data: { ...dto },
        });
        return StudentGroupMapper.toEntity(studentGroup);
    }

    async findById(id: { studentId: number; groupId: number }): Promise<StudentGroupEntity | null> {
        const studentGroup = await prisma.studentGroup.findUnique({
            where: {
                studentId_groupId: {
                    studentId: id.studentId,
                    groupId: id.groupId,
                },
            },
        });
        return studentGroup ? StudentGroupMapper.toEntity(studentGroup) : null;
    }

    async findAll(): Promise<StudentGroupEntity[]> {
        const studentGroups = await prisma.studentGroup.findMany();
        return studentGroups.map(StudentGroupMapper.toEntity);
    }

    async updateNote(studentId: number, groupId: number, note: string | null): Promise<StudentGroupEntity> {
        const updated = await prisma.studentGroup.update({
            where: {
                studentId_groupId: { studentId, groupId }
            },
            data: { teacherNote: note }
        });
        return StudentGroupMapper.toEntity(updated);
    }

    async update(id: { studentId: number; groupId: number }, dto: UpdateStudentGroupDto): Promise<StudentGroupEntity | null> {
        const studentGroup = await prisma.studentGroup.update({
            where: {
                studentId_groupId: {
                    studentId: id.studentId,
                    groupId: id.groupId,
                },
            },
            data: { ...dto },
        });
        return StudentGroupMapper.toEntity(studentGroup);
    }

    async delete(id: { studentId: number; groupId: number }): Promise<void> {
        await prisma.studentGroup.delete({
            where: {
                studentId_groupId: {
                    studentId: id.studentId,
                    groupId: id.groupId,
                },
            },
        });
    }
}
