import { HomeworkSubmission as PrismaHomeworkSubmission } from '@prisma/client';
import { HomeworkSubmissionEntity, SubmissionStatus } from '../../../core/entities/HomeworkSubmissionEntity';

export class HomeworkSubmissionMapper {
    public static toEntity(submission: PrismaHomeworkSubmission): HomeworkSubmissionEntity {
        return {
            id: submission.id,
            content: submission.content,
            score: submission.score,
            status: submission.status as SubmissionStatus,
            teacherComment: submission.teacherComment,
            submittedAt: submission.submittedAt,
            homeworkId: submission.homeworkId,
            studentId: submission.studentId,
            checkerId: submission.checkerId,
        };
    }
}
