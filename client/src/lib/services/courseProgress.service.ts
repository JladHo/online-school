import { apiClient } from '../api';

export const courseProgressService = {
  canAccessLesson: async (studentId: number, lessonId: number): Promise<boolean> => {
    const response = await apiClient.get(`/course-progress/${studentId}/can-access/${lessonId}`);
    return response.data.canAccess;
  },
};
