'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, courseService } from '@/lib/services/course.service';
import { Module, moduleService } from '@/lib/services/module.service';
import { Lesson, lessonService } from '@/lib/services/lesson.service';
import { courseProgressService } from '@/lib/services/courseProgress.service';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Lock, PlayCircle } from 'lucide-react';

interface LessonWithAccess extends Lesson {
  canAccess: boolean;
}

interface ModuleWithLessons extends Module {
  lessons: LessonWithAccess[];
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return;
      
      try {
        const courseId = parseInt(params.id, 10);
        if (isNaN(courseId)) {
          setError('Неверный ID курса');
          return;
        }

        const courseData = await courseService.getById(courseId);
        setCourse(courseData);

        const courseModules = await moduleService.getByCourseId(courseId);
        
        const modulesWithLessonsPromises = courseModules.map(async (mod) => {
          const lessons = await lessonService.getByModuleId(mod.id);
          
          const lessonsWithAccessPromises = lessons.map(async (lesson) => {
            const canAccess = await courseProgressService.canAccessLesson(user.id, lesson.id);
            return { ...lesson, canAccess };
          });
          
          const lessonsWithAccess = await Promise.all(lessonsWithAccessPromises);
          
          // Sort lessons by orderNumber
          lessonsWithAccess.sort((a, b) => a.orderNumber - b.orderNumber);
          
          return { ...mod, lessons: lessonsWithAccess };
        });

        const resolvedModules = await Promise.all(modulesWithLessonsPromises);
        setModules(resolvedModules);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные курса');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error || 'Курс не найден'}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 text-sm font-medium text-red-700 underline"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Назад к курсам
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{course.title}</h1>
        <p className="mt-2 text-lg text-gray-500">{course.description}</p>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Программа курса</h2>
        
        {modules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            В этом курсе пока нет модулей.
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((mod, index) => {
              const isModuleAccessible = index === 0 || (mod.lessons.length > 0 && mod.lessons[0].canAccess);

              return (
                <div key={mod.id} className={`overflow-hidden rounded-xl shadow ring-1 transition-all ${isModuleAccessible ? 'bg-white ring-gray-200' : 'bg-gray-50 ring-gray-100 opacity-75'}`}>
                  <div className={`border-b px-6 py-4 flex items-center justify-between ${isModuleAccessible ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div>
                      <h3 className={`text-lg font-medium flex items-center gap-2 ${isModuleAccessible ? 'text-gray-900' : 'text-gray-500'}`}>
                        {!isModuleAccessible && <Lock className="h-4 w-4 text-gray-400" />}
                        Модуль {index + 1}: {mod.title}
                      </h3>
                      <p className={`mt-1 text-sm ${isModuleAccessible ? 'text-gray-500' : 'text-gray-400'}`}>{mod.description}</p>
                    </div>
                    {!isModuleAccessible && (
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Недоступен</span>
                    )}
                  </div>
                  
                  {isModuleAccessible && (
                    <div className="divide-y divide-gray-100">
                      {mod.lessons.length === 0 ? (
                        <div className="px-6 py-4 text-sm text-gray-500">В этом модуле пока нет уроков.</div>
                      ) : (
                        mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between px-6 py-4 transition-colors ${
                              lesson.canAccess ? 'hover:bg-gray-50' : 'bg-gray-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                  lesson.canAccess ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {lesson.canAccess ? <PlayCircle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${
                                    lesson.canAccess ? 'text-gray-900' : 'text-gray-500'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              {lesson.canAccess ? (
                                <Link
                                  href={`/dashboard/lessons/${lesson.id}`}
                                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                >
                                  Пройти
                                </Link>
                              ) : (
                                <span className="inline-flex items-center text-sm text-gray-400">
                                  Недоступно
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
