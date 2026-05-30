"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkSubmissionMapper = void 0;
class HomeworkSubmissionMapper {
    static toEntity(submission) {
        return {
            id: submission.id,
            content: submission.content,
            score: submission.score,
            status: submission.status,
            teacherComment: submission.teacherComment,
            submittedAt: submission.submittedAt,
            homeworkId: submission.homeworkId,
            studentId: submission.studentId,
            checkerId: submission.checkerId,
        };
    }
}
exports.HomeworkSubmissionMapper = HomeworkSubmissionMapper;
