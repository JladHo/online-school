import { apiClient } from '../api';

export interface Course {
  id: number;
  title: string;
  description: string;
  ageCategory: string;
  price: number;
}

export const courseService = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses');
    return response.data;
  },

  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },
};

