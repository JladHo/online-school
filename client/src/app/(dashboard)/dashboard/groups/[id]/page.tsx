'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, groupService } from '@/lib/services/group.service';
import { courseService } from '@/lib/services/course.service';
import { apiClient } from '@/lib/api';
import { ChevronLeft, Mail, Phone, User, Users } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';

interface StudentInfo {
  id: number;
  fullName: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
}

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!user) return;
      try {
        const groupId = parseInt(params.id, 10);
        
        // Fetch group ensuring teacher access
        const teacherGroups = await groupService.getGroupsByTeacherId(user.id);
        const currentGroup = teacherGroups.find(g => g.id === groupId);
        
        if (!currentGroup) {
          setError('Группа не найдена');
          setLoading(false);
          return;
        }
        setGroup(currentGroup);

        // Fetch course
        try {
          const course = await courseService.getById(currentGroup.courseId);
          setCourseName(course.title);
        } catch {
          setCourseName('Неизвестный курс');
        }

        // Fetch students
        const studentLinks = await groupService.getStudentsByGroupId(groupId);
        const studentDetails = await Promise.all(
          studentLinks.map(async (link) => {
            const userRes = await apiClient.get(`/users/${link.studentId}`);
            const userData = userRes.data;
            return {
              id: userData.id,
              fullName: userData.fullName || '',
              studentName: userData.studentName || 'Неизвестно',
              parentName: userData.parentName || 'Не указано',
              email: userData.email,
              phone: userData.phone
            };
          })
        );
        setStudents(studentDetails);

      } catch {
        setError('Ошибка при загрузке данных группы');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error || 'Группа не найдена'}</p>
        <button onClick={() => router.back()} className="mt-2 text-sm font-medium text-red-700 underline">Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{group.name}</h1>
          <p className="text-gray-500">{courseName} • {group.type === 'group' ? 'Групповые занятия' : 'Индивидуальные занятия'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Состав группы ({students.length})</h2>
          </div>
        </div>
        
        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            В этой группе пока нет учеников.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Ученик</th>
                  <th className="px-6 py-4">Родитель</th>
                  <th className="px-6 py-4">Контакты</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        {student.parentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
