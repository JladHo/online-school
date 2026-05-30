import { apiClient } from '../api';

export interface LessonSession {
  id: number;
  scheduledAt: string | Date;
  durationMin: number;
  meetingLink: string | null;
  lessonId: number;
  groupId: number;
  teacherId: number;
}

export interface Attendance {
  id: number;
  isPresent: boolean;
  sessionId: number;
  studentId: number;
}

export const sessionService = {
  getAll: async (): Promise<LessonSession[]> => {
    const res = await apiClient.get('/sessions');
    return res.data;
  },

  create: async (data: Omit<LessonSession, 'id'>): Promise<LessonSession> => {
    const res = await apiClient.post('/sessions', data);
    return res.data;
  },

  update: async (id: number, data: Partial<LessonSession>): Promise<LessonSession> => {
    const res = await apiClient.put(`/sessions/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },
  
  getAttendancesByStudentId: async (studentId: number): Promise<Attendance[]> => {
    const res = await apiClient.get(`/sessions/attendance/student/${studentId}`);
    return res.data;
  }
};
