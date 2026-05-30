'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Course, courseService } from '@/lib/services/course.service';
import { BookOpen, ChevronLeft, FileText, MonitorPlay, Code2, ClipboardList } from 'lucide-react';
import LessonRenderer from '@/components/dashboard/LessonRenderer';
import { Module, moduleService } from '@/lib/services/module.service';
import { Lesson, lessonService } from '@/lib/services/lesson.service';
import { Homework, homeworkService } from '@/lib/services/homework.service';

interface ModuleWithLessons extends Module {
  lessons?: Lesson[];
}

export default function MaterialsPage() {
  const { user } = useAuthStore();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithLessons | null>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonHomework, setLessonHomework] = useState<Homework | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [innerLoading, setInnerLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!user) return;
      try {
        const coursesData = await courseService.getAll();
        setCourses(coursesData);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [user]);

  const handleCourseClick = async (course: Course) => {
    setSelectedCourse(course);
    setInnerLoading(true);
    try {
      const courseModules = await moduleService.getByCourseId(course.id);
      const allLessons = await lessonService.getAll();
      
      const modulesWithLessons: ModuleWithLessons[] = courseModules.map(m => ({
        ...m,
        lessons: allLessons.filter(l => l.moduleId === m.id).sort((a, b) => a.orderNumber - b.orderNumber)
      }));
      
      setModules(modulesWithLessons);
    } catch (err) {
      console.error('Failed to fetch modules', err);
    } finally {
      setInnerLoading(false);
    }
  };

  const handleModuleClick = (mod: ModuleWithLessons) => {
    setSelectedModule(mod);
  };

  const handleLessonClick = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setInnerLoading(true);
    setLessonHomework(null);
    try {
      const hws = await homeworkService.getByLessonId(lesson.id);
      if (hws && hws.length > 0) {
        setLessonHomework(hws[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInnerLoading(false);
    }
  };

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setSelectedLesson(null);
  };

  const goBackToModules = () => {
    setSelectedModule(null);
    setSelectedLesson(null);
  };

  const goBackToLessons = () => {
    setSelectedLesson(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // LEVEL 4: Lesson Content
  if (selectedLesson) {
    return (
      <div className="space-y-6 relative animate-in fade-in zoom-in duration-200">
        <div>
          <button 
            onClick={goBackToLessons}
            className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={16} className="mr-1" />
            Назад к списку уроков модуля
          </button>
          <div className="flex items-center gap-4 mb-2">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <MonitorPlay size={24} />
             </div>
             <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Урок {selectedLesson.orderNumber}</p>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{selectedLesson.title}</h1>
             </div>
          </div>
        </div>

        {innerLoading ? (
           <div className="flex justify-center py-12">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
           </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FileText className="text-blue-500" size={20} />
                Теоретическая часть
              </h3>
              <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <LessonRenderer content={selectedLesson.content} />
              </div>
            </div>

            {lessonHomework && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <ClipboardList className="text-indigo-500" size={20} />
                  Практическое задание (ДЗ)
                </h3>
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                  <p className="text-gray-800 whitespace-pre-wrap">{lessonHomework.description}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // LEVEL 3: Lessons List
  if (selectedModule) {
    return (
      <div className="space-y-6 relative animate-in slide-in-from-right-4 duration-200">
        <div>
          <button 
            onClick={goBackToModules}
            className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={16} className="mr-1" />
            Назад к списку модулей
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{selectedModule.title}</h1>
          <p className="text-gray-500">Выберите занятие для просмотра материалов.</p>
        </div>

        <div className="flex flex-col gap-3">
          {selectedModule.lessons && selectedModule.lessons.length > 0 ? (
            selectedModule.lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                onClick={() => handleLessonClick(lesson)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {lesson.orderNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{lesson.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-4">
                  <FileText size={16} /> Открыть &rarr;
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
              В этом модуле пока нет занятий.
            </div>
          )}
        </div>
      </div>
    );
  }

  // LEVEL 2: Modules List
  if (selectedCourse) {
    return (
      <div className="space-y-6 relative animate-in slide-in-from-right-4 duration-200">
        <div>
          <button 
            onClick={goBackToCourses}
            className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={16} className="mr-1" />
            Назад ко всем курсам
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{selectedCourse.title}</h1>
          <p className="text-gray-500">Выберите учебный модуль.</p>
        </div>

        {innerLoading ? (
           <div className="flex h-32 items-center justify-center">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length > 0 ? (
              modules.map((mod) => (
                <div 
                  key={mod.id}
                  onClick={() => handleModuleClick(mod)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{mod.description}</p>
                  <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                    Занятий: {mod.lessons?.length || 0}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
                В этом курсе пока нет модулей.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // LEVEL 1: Courses List
  return (
    <div className="space-y-6 relative animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Учебные материалы</h1>
        <p className="text-gray-500">Выберите курс для просмотра материалов.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div 
            key={course.id} 
            onClick={() => handleCourseClick(course)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Code2 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3">
              {course.description}
            </p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">
                {course.ageCategory} лет
              </span>
              <span className="text-sm font-medium text-blue-600 group-hover:underline">
                Открыть курс &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}