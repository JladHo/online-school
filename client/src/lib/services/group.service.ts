import { apiClient } from '../api';

export interface Group {
  id: number;
  name: string;
  type: 'individual' | 'group';
  courseId: number;
  teacherId: number | null;
}

export interface StudentGroup {
  studentId: number;
  groupId: number;
  teacherNote?: string | null;
}

export const groupService = {
  getAll: async (): Promise<Group[]> => {
    const res = await apiClient.get('/groups');
    return res.data;
  },
  
  getGroupsByTeacherId: async (teacherId: number): Promise<Group[]> => {
    const res = await apiClient.get(`/groups/teacher/${teacherId}`);
    return res.data;
  },
  
  getStudentsByGroupId: async (groupId: number): Promise<StudentGroup[]> => {
    const res = await apiClient.get(`/groups/${groupId}/students`);
    return res.data;
  },

  updateStudentNote: async (groupId: number, studentId: number, note: string | null): Promise<StudentGroup> => {
    const res = await apiClient.patch(`/groups/${groupId}/students/${studentId}/note`, { note });
    return res.data;
  }
};
