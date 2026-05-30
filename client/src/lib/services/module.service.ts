import { apiClient } from '../api';

export interface Module {
  id: number;
  title: string;
  description: string;
  courseId: number;
}

export const moduleService = {
  getAll: async (): Promise<Module[]> => {
    const response = await apiClient.get('/modules');
    return response.data;
  },

  getById: async (id: number): Promise<Module> => {
    const response = await apiClient.get(`/modules/${id}`);
    return response.data;
  },

  getByCourseId: async (courseId: number): Promise<Module[]> => {
    // Backend doesn't have filtering, so we fetch all and filter
    const modules = await moduleService.getAll();
    return modules.filter((m) => m.courseId === courseId);
  },
};
