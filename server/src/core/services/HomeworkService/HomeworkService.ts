import { IHomeworkRepository } from '../../repositories/HomeworkRepository/IHomeworkRepository';
import { IHomeworkSubmissionRepository } from '../../repositories/HomeworkSubmissionRepository/IHomeworkSubmissionRepository';
import { IUserRepository } from '../../repositories/UserRepository/IUserRepository';
import { CreateHomeworkDto } from '../../repositories/HomeworkRepository/dto/CreateHomeworkDto';
import { CreateHomeworkSubmissionDto } from '../../repositories/HomeworkSubmissionRepository/dto/CreateHomeworkSubmissionDto';
import { HomeworkEntity } from '../../entities/HomeworkEntity';
import { HomeworkSubmissionEntity } from '../../entities/HomeworkSubmissionEntity';
import { NotFoundError, BadRequestError } from '../../../errors/HttpError';
import { prisma } from '../../../infrastructure/db';

export class HomeworkService {
    constructor(
        private readonly homeworkRepository: IHomeworkRepository,
        private readonly submissionRepository: IHomeworkSubmissionRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async getHomeworksByLessonId(lessonId: number): Promise<HomeworkEntity[]> {
        const homeworks = await this.homeworkRepository.findAll();
        return homeworks.filter(h => h.lessonId === lessonId);
    }

    async getAllHomeworks(): Promise<HomeworkEntity[]> {
        return this.homeworkRepository.findAll();
    }

    async getSubmissionsByStudentId(studentId: number): Promise<HomeworkSubmissionEntity[]> {
        return this.submissionRepository.findSubmissionsByStudentId(studentId);
    }

    async getSubmissionsByTeacherId(teacherId: number): Promise<HomeworkSubmissionEntity[]> {
        return this.submissionRepository.findSubmissionsByTeacherId(teacherId);
    }

    async getAllSubmissions(): Promise<HomeworkSubmissionEntity[]> {
        return this.submissionRepository.findAll();
    }

    async createHomework(dto: CreateHomeworkDto): Promise<HomeworkEntity> {
        return this.homeworkRepository.create(dto);
    }

    async updateHomework(id: number, dto: any): Promise<HomeworkEntity> {
        const updated = await this.homeworkRepository.update(id, dto);
        if (!updated) throw new NotFoundError('ДЗ не найдено');
        return updated;
    }

    async deleteHomework(id: number): Promise<void> {
        await this.homeworkRepository.delete(id);
    }

    async submitHomework(dto: CreateHomeworkSubmissionDto): Promise<HomeworkSubmissionEntity> {
        const homework = await this.homeworkRepository.findById(dto.homeworkId);
        if (!homework) {
            throw new NotFoundError('Домашнее задание не найдено');
        }

        const student = await this.userRepository.findById(dto.studentId);
        if (!student) {
            throw new NotFoundError('Ученик не найден');
        }

        return this.submissionRepository.create({
            ...dto,
            status: 'pending'
        });
    }

    async gradeHomework(
        submissionId: number,
        score: number,
        teacherId: number,
        comment?: string
    ): Promise<HomeworkSubmissionEntity> {
        const submission = await this.submissionRepository.findById(submissionId);
        if (!submission) {
            throw new NotFoundError('Решение домашнего задания не найдено');
        }

        const newStatus: 'accepted' | 'rejected' = score === 100 ? 'accepted' : 'rejected';

        const updatedSubmission = await this.submissionRepository.update(submissionId, {
            score,
            status: newStatus,
            teacherComment: comment ?? null,
            checkerId: teacherId
        });

        if (!updatedSubmission) {
            throw new NotFoundError('Не удалось обновить решение');
        }

        // Award points ONLY if it wasn't already accepted with 100 points
        if (score === 100 && submission.status !== 'accepted') {
            const student = await this.userRepository.findById(submission.studentId);
            if (student) {
                await this.userRepository.update(student.id, {
                    bonusPoints: (student.bonusPoints || 0) + 100
                });
                
                // Get homework title for reason
                const hw = await this.homeworkRepository.findById(submission.homeworkId);
                const reason = hw ? `Идеальное ДЗ: Оценка 100` : `Идеальное ДЗ`;
                
                await prisma.pointTransaction.create({
                  data: {
                    userId: student.id,
                    amount: 100,
                    reason: reason
                  }
                });
            }
        }

        return updatedSubmission;
    }
}
