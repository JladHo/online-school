import { IHomeworkSubmissionRepository } from "../../core/repositories/HomeworkSubmissionRepository/IHomeworkSubmissionRepository";
import { CreateHomeworkSubmissionDto } from "../../core/repositories/HomeworkSubmissionRepository/dto/CreateHomeworkSubmissionDto";
import { UpdateHomeworkSubmissionDto } from "../../core/repositories/HomeworkSubmissionRepository/dto/UpdateHomeworkSubmissionDto";
import { HomeworkSubmissionEntity } from "../../core/entities/HomeworkSubmissionEntity";
import { prisma } from "../db";
import { HomeworkSubmissionMapper } from "../db/mappers/HomeworkSubmissionMapper";

export class HomeworkSubmissionRepository implements IHomeworkSubmissionRepository {
    async create(dto: CreateHomeworkSubmissionDto): Promise<HomeworkSubmissionEntity> {
        const submission = await prisma.homeworkSubmission.create({
            data: { ...dto },
        });
        return HomeworkSubmissionMapper.toEntity(submission);
    }

    async findById(id: number): Promise<HomeworkSubmissionEntity | null> {
        const submission = await prisma.homeworkSubmission.findUnique({
            where: { id },
        });
        return submission ? HomeworkSubmissionMapper.toEntity(submission) : null;
    }

    async findAll(): Promise<HomeworkSubmissionEntity[]> {
        const submissions = await prisma.homeworkSubmission.findMany();
        return submissions.map(HomeworkSubmissionMapper.toEntity);
    }

    async update(id: number, dto: UpdateHomeworkSubmissionDto): Promise<HomeworkSubmissionEntity | null> {
        const submission = await prisma.homeworkSubmission.update({
            where: { id },
            data: { ...dto },
        });
        return HomeworkSubmissionMapper.toEntity(submission);
    }

    async delete(id: number): Promise<void> {
        await prisma.homeworkSubmission.delete({
            where: { id },
        });
    }

    async findSubmissionsByHomeworkId(homeworkId: number): Promise<HomeworkSubmissionEntity[]> {
        const submissions = await prisma.homeworkSubmission.findMany({
            where: { homeworkId },
        });
        return submissions.map(HomeworkSubmissionMapper.toEntity);
    }

    async findSubmissionsByStudentId(studentId: number): Promise<HomeworkSubmissionEntity[]> {
        const submissions = await prisma.homeworkSubmission.findMany({
            where: { studentId },
        });
        return submissions.map(HomeworkSubmissionMapper.toEntity);
    }

    async findSubmissionsByTeacherId(teacherId: number): Promise<HomeworkSubmissionEntity[]> {
        // Fetch all submissions with their course context
        const submissions = await prisma.homeworkSubmission.findMany({
            include: {
                homework: {
                    include: {
                        lesson: {
                            include: {
                                module: true
                            }
                        }
                    }
                }
            }
        });

        // Fetch all student-course links for this specific teacher
        const teacherLinks = await prisma.studentGroup.findMany({
            where: {
                group: {
                    teacherId: teacherId
                }
            },
            include: {
                group: true
            }
        });

        // Strictly filter: The teacher must be assigned to THIS student for THIS specific course
        const validSubmissions = submissions.filter(sub => {
            const courseId = sub.homework.lesson.module.courseId;
            return teacherLinks.some(link => link.studentId === sub.studentId && link.group.courseId === courseId);
        });

        return validSubmissions.map(HomeworkSubmissionMapper.toEntity);
    }
}
