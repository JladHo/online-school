import { apiClient } from '../api';

export interface Homework {
  id: number;
  description: string;
  lessonId: number;
}

export interface HomeworkSubmission {
  id: number;
  homeworkId: number;
  studentId: number;
  content: string;
  score: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  teacherComment: string | null;
  checkerId: number | null;
  submittedAt: string | Date;
}

export const homeworkService = {
  getByLessonId: async (lessonId: number): Promise<Homework[]> => {
    const res = await apiClient.get(`/homeworks/lesson/${lessonId}`);
    return res.data;
  },

  getAll: async (): Promise<Homework[]> => {
    const res = await apiClient.get('/homeworks');
    return res.data;
  },

  getSubmissionsByStudentId: async (studentId: number): Promise<HomeworkSubmission[]> => {
    const response = await apiClient.get(`/homeworks/submissions/student/${studentId}`);
    return response.data;
  },

  submit: async (homeworkId: number, studentId: number, content: string): Promise<HomeworkSubmission> => {
    const res = await apiClient.post('/homeworks/submit', {
      homeworkId,
      studentId,
      content
    });
    return res.data;
  },

  getAllSubmissions: async (): Promise<HomeworkSubmission[]> => {
    const res = await apiClient.get('/homeworks/submissions');
    return res.data;
  },

  getSubmissionsByTeacherId: async (teacherId: number): Promise<HomeworkSubmission[]> => {
    const res = await apiClient.get(`/homeworks/submissions/teacher/${teacherId}`);
    return res.data;
  },

  grade: async (submissionId: number, score: number, teacherId: number, comment?: string): Promise<HomeworkSubmission> => {
    const res = await apiClient.patch(`/homeworks/grade/${submissionId}`, {
      score,
      teacherId,
      comment
    });
    return res.data;
  }
};
