import { IGroupRepository } from '../../repositories/GroupRepository/IGroupRepository';
import { IStudentGroupRepository } from '../../repositories/StudentGroupRepository/IStudentGroupRepository';
import { CreateGroupDto } from '../../repositories/GroupRepository/dto/CreateGroupDto';
import { GroupEntity } from '../../entities/GroupEntity';
import { StudentGroupEntity } from '../../entities/StudentGroupEntity';
import { NotFoundError, ConflictError } from '../../../errors/HttpError';
import { prisma } from '../../../infrastructure/db';

export class GroupService {
    constructor(
        private readonly groupRepository: IGroupRepository,
        private readonly studentGroupRepository: IStudentGroupRepository
    ) {}

    async claimStudent(teacherId: number, studentId: number, courseId: number): Promise<StudentGroupEntity> {
        // Prevent race condition: check if student is ALREADY assigned to any group for this course
        const studentAlreadyInCourse = await prisma.studentGroup.findFirst({
            where: {
                studentId: studentId,
                group: { courseId: courseId }
            }
        });

        if (studentAlreadyInCourse) {
            throw new ConflictError('Этот ученик уже был взят преподавателем по этому курсу');
        }

        // Always create a new individual group for the student
        const student = await prisma.user.findUnique({ where: { id: studentId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        
        const studentName = student ? (student.studentName || student.fullName || 'Студент') : 'Студент';
        const courseTitle = course ? course.title : 'Курс';
        const groupName = `Инд. ${studentName} | ${courseTitle}`;
        
        const group = await prisma.group.create({
            data: {
                name: groupName,
                type: 'individual',
                courseId,
                teacherId
            }
        });

        return prisma.studentGroup.create({
            data: { studentId, groupId: group.id }
        });
    }

    async createGroup(dto: CreateGroupDto): Promise<GroupEntity> {
        return this.groupRepository.create(dto);
    }

    async updateGroup(id: number, dto: any): Promise<GroupEntity> {
        const updated = await this.groupRepository.update(id, dto);
        if (!updated) {
            throw new NotFoundError('Группа не найдена');
        }
        return updated;
    }

    async deleteGroup(id: number): Promise<void> {
        await this.groupRepository.delete(id);
    }

    async assignTeacher(groupId: number, teacherId: number): Promise<GroupEntity> {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new NotFoundError('Группа не найдена');
        }

        const updatedGroup = await this.groupRepository.update(groupId, { teacherId });
        if (!updatedGroup) {
            throw new NotFoundError('Не удалось обновить группу');
        }

        return updatedGroup;
    }

    async addStudent(groupId: number, studentId: number): Promise<StudentGroupEntity> {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new NotFoundError('Группа не найдена');
        }

        // Проверка: состоит ли ученик уже в КАКОЙ-ЛИБО группе по этому же курсу?
        const studentAlreadyInCourse = await prisma.studentGroup.findFirst({
            where: {
                studentId: studentId,
                group: { courseId: group.courseId }
            }
        });

        if (studentAlreadyInCourse) {
            throw new ConflictError('Ученик уже обучается по этому курсу в другой группе (или индивидуально)');
        }

        const existingLink = await this.studentGroupRepository.findById({ studentId, groupId });
        if (existingLink) {
            throw new ConflictError('Ученик уже добавлен в эту группу');
        }

        // Внедрение бизнес-логики: ограничение вместимости групповых занятий
        if (group.type === 'group') {
            const allLinks = await this.studentGroupRepository.findAll();
            const currentStudentCount = allLinks.filter(link => link.groupId === groupId).length;
            if (currentStudentCount >= 6) {
                throw new ConflictError('Группа уже заполнена (максимум 6 человек).');
            }
        }

        return this.studentGroupRepository.create({ studentId, groupId });
    }

    async removeStudent(groupId: number, studentId: number): Promise<void> {
        const link = await this.studentGroupRepository.findById({ studentId, groupId });
        if (!link) {
            throw new NotFoundError('Связь ученика с группой не найдена');
        }
        await prisma.studentGroup.delete({
            where: { studentId_groupId: { studentId, groupId } }
        });
    }

    async listGroupStudents(groupId: number): Promise<StudentGroupEntity[]> {
        const group = await this.groupRepository.findById(groupId);
        if (!group) {
            throw new NotFoundError('Группа не найдена');
        }

        const allLinks = await this.studentGroupRepository.findAll();
        return allLinks.filter(link => link.groupId === groupId);
    }

    async getAllGroups(): Promise<GroupEntity[]> {
        return this.groupRepository.findAll();
    }

    async getGroupsByTeacherId(teacherId: number): Promise<GroupEntity[]> {
        return this.groupRepository.findGroupsByTeacherId(teacherId);
    }

    async updateStudentNote(groupId: number, studentId: number, note: string | null): Promise<StudentGroupEntity> {
        return this.studentGroupRepository.updateNote(studentId, groupId, note);
    }
}
