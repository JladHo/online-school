'use client';

import { useEffect, useState } from 'react';
import { Group, groupService } from '@/lib/services/group.service';
import { useAuthStore } from '@/store/authStore';
import { Users, User, BookOpen } from 'lucide-react';
import { courseService } from '@/lib/services/course.service';
import Link from 'next/link';

interface GroupWithCourse extends Group {
  courseName?: string;
  studentCount?: number;
}

export default function TeacherGroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<GroupWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        // Загружаем только группы преподавателя
        const teacherGroups = await groupService.getGroupsByTeacherId(user.id);

        // Загружаем информацию по курсам и студентам для каждой группы
        const enrichedGroups = await Promise.all(
          teacherGroups.map(async (group) => {
            let courseName = 'Неизвестный курс';
            let studentCount = 0;
            
            try {
              const course = await courseService.getById(group.courseId);
              courseName = course.title;
            } catch {
              console.error('Failed to fetch course for group', group.id);
            }
            
            try {
              const students = await groupService.getStudentsByGroupId(group.id);
              studentCount = students.length;
            } catch {
              console.error('Failed to fetch students for group', group.id);
            }

            return {
              ...group,
              courseName,
              studentCount
            };
          })
        );

        setGroups(enrichedGroups);
      } catch {
        setError('Не удалось загрузить ваши группы');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Мои группы</h1>
        <p className="text-gray-500">Управление вашими группами и учениками.</p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Нет активных групп</h3>
          <p className="mt-1 text-sm text-gray-500">За вами пока не закреплена ни одна группа.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${group.type === 'individual' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' : 'bg-indigo-50 text-indigo-700 ring-indigo-700/10'}`}>
                    {group.type === 'individual' ? 'Индивидуально' : 'Группа'}
                  </div>
                  <span className="text-gray-400 text-sm">ID: {group.id}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="line-clamp-1">{group.courseName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{group.studentCount} {group.studentCount === 1 ? 'ученик' : 'учеников'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <Link href={`/dashboard/groups/${group.id}`} className="block w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Посмотреть состав &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
