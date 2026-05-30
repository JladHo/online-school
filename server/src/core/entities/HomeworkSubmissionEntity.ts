export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';

export interface HomeworkSubmissionEntity {
    id: number;
    content: string;
    score: number | null;
    status: SubmissionStatus;
    teacherComment: string | null;
    submittedAt: Date;
    homeworkId: number;
    studentId: number;
    checkerId: number | null;
}
