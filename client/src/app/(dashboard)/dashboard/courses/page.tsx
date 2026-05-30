'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/lib/services/course.service';
import { BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        const response = await apiClient.get(`/users/${user.id}/courses`);
        setCourses(response.data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить курсы');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Мои курсы</h1>
        <p className="text-gray-500">Продолжайте обучение с того места, где остановились.</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Нет курсов</h3>
          <p className="mt-1 text-sm text-gray-500">Вы еще не записаны ни на один курс.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-indigo-500">
                <div className="flex-1 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {course.ageCategory}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                    {course.title}
                  </h3>
                  <p className="line-clamp-3 text-sm text-gray-500">{course.description}</p>
                </div>
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-end text-sm text-gray-500">
                    <div className="font-medium text-indigo-600">Подробнее &rarr;</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
