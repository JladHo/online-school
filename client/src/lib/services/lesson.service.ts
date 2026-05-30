import { apiClient } from '../api';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  orderNumber: number;
  moduleId: number;
}

export const lessonService = {
  getAll: async (): Promise<Lesson[]> => {
    const response = await apiClient.get('/lessons');
    return response.data;
  },

  getById: async (id: number): Promise<Lesson> => {
    const response = await apiClient.get(`/lessons/${id}`);
    return response.data;
  },

  getByModuleId: async (moduleId: number): Promise<Lesson[]> => {
    // Backend doesn't have filtering, so we fetch all and filter
    const lessons = await lessonService.getAll();
    return lessons.filter((l) => l.moduleId === moduleId);
  },
};
