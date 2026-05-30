'use client';

import { useEffect, useState } from 'react';
import { HomeworkSubmission, homeworkService } from '@/lib/services/homework.service';
import { LessonSession, sessionService } from '@/lib/services/session.service';
import { useAuthStore } from '@/store/authStore';
import { FileText, CheckCircle, Clock, Video, User } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { lessonService } from '@/lib/services/lesson.service';
import Link from 'next/link';

interface EnrichedSubmission extends HomeworkSubmission {
  studentName?: string;
  studentEmail?: string;
}

interface TodaySession extends LessonSession {
  lessonTitle?: string;
  courseTitle?: string;
  moduleTitle?: string;
  groupType?: string;
  groupName?: string;
  formattedTime?: string;
  status: 'starting_soon' | 'in_progress' | 'upcoming' | 'past';
}

export default function TeacherDashboard({ greeting, firstName }: { greeting: string, firstName: string }) {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grading state
  const [selectedSub, setSelectedSub] = useState<EnrichedSubmission | null>(null);
  const [score, setScore] = useState<string>('100');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        
        // 1. Fetch pending homeworks
        const hwRes = await apiClient.get(`/homeworks/submissions/teacher/${user.id}`);
        const pendingSubs = hwRes.data.filter((s: { status: string }) => s.status === 'pending');

        const enrichedHw = await Promise.all(
          pendingSubs.map(async (sub: HomeworkSubmission) => {
            try {
              const userRes = await apiClient.get(`/users/${sub.studentId}`);
              return {
                ...sub,
                studentName: userRes.data.fullName || userRes.data.studentName || 'Неизвестный студент',
                studentEmail: userRes.data.email,
              };
            } catch {
              return { ...sub, studentName: `Студент #${sub.studentId}` };
            }
          })
        );
        setSubmissions(enrichedHw);

        // 2. Fetch today's sessions
        const allSessions = await sessionService.getAll();
        const mySessions = allSessions.filter(s => s.teacherId === user.id);
        
        const now = new Date();
        const todayString = now.toDateString();
        
        const todays = mySessions.filter(s => new Date(s.scheduledAt).toDateString() === todayString);

        const enrichedSessions = await Promise.all(
          todays.map(async (s) => {
            let lessonTitle = 'Урок';
            let courseTitle = 'Неизвестный курс';
            let moduleTitle = 'Неизвестный модуль';
            try {
              const lesson = await lessonService.getById(s.lessonId);
              lessonTitle = lesson.title;
              const moduleRes = await apiClient.get(`/modules/${lesson.moduleId}`);
              moduleTitle = moduleRes.data.title;
              const coursesRes = await apiClient.get('/courses');
              const course = coursesRes.data.find((c: {id: number, title: string}) => c.id === moduleRes.data.courseId);
              if (course) courseTitle = course.title;
            } catch {}

            let groupName = 'Группа';
            let groupType = 'group';
            try {
              const groupRes = await apiClient.get(`/groups/teacher/${user.id}`);
              const group = groupRes.data.find((g: { id: number, type: string }) => g.id === s.groupId);
              if (group) {
                groupName = group.name;
                groupType = group.type;
              }
            } catch {}

            const sessionDate = new Date(s.scheduledAt);
            const sessionEnd = new Date(sessionDate.getTime() + s.durationMin * 60000);
            const status: 'starting_soon' | 'in_progress' | 'upcoming' | 'past' = 
              now >= sessionDate && now <= sessionEnd ? 'in_progress' :
              now < sessionDate && sessionDate.getTime() - now.getTime() <= 15 * 60000 ? 'starting_soon' :
              sessionDate > now ? 'upcoming' : 'past';

            const formattedTime = sessionDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + 
                   ' - ' + 
                   sessionEnd.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

            return {
              ...s,
              lessonTitle,
              courseTitle,
              moduleTitle,
              groupType,
              groupName,
              status,
              formattedTime
            };
          })
        );
        
        setTodaySessions(enrichedSessions.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));

      } catch {
        setError('Не удалось загрузить данные дашборда');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !user) return;
    
    setSubmitting(true);
    try {
      await homeworkService.grade(
        selectedSub.id, 
        parseInt(score, 10), 
        user.id, 
        comment
      );
      setSubmissions(prev => prev.filter(s => s.id !== selectedSub.id));
      setSelectedSub(null);
      setScore('100');
      setComment('');
    } catch {
      alert('Не удалось сохранить оценку');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}, {firstName}!</h1>
        <p className="text-gray-600">Ваша панель преподавателя. Хорошего дня!</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Левая колонка: Уроки сегодня */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Уроки сегодня</h2>
            <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">{todaySessions.length}</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            {todaySessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <Clock size={48} className="text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-600">На сегодня занятий нет</p>
              </div>
            ) : (
              todaySessions.map(session => (
                <div key={session.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`font-bold flex items-center gap-2 ${session.status === 'past' ? 'text-gray-500' : 'text-gray-900'}`}>
                      <Clock size={16} className={session.status === 'in_progress' ? 'text-blue-500' : session.status === 'starting_soon' ? 'text-amber-500' : session.status === 'past' ? 'text-gray-400' : 'text-indigo-400'} />
                      {session.formattedTime}
                    </div>
                    {session.status === 'in_progress' ? (
                       <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Идет сейчас</span>
                    ) : session.status === 'starting_soon' ? (
                       <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">Скоро</span>
                    ) : session.status === 'past' ? (
                       <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Прошло</span>
                    ) : (
                       <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">Предстоит</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                      {session.courseTitle}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {session.moduleTitle}
                    </span>
                  </div>
                  <h3 className={`font-semibold mb-1 ${session.status === 'past' ? 'text-gray-500' : 'text-gray-800'}`}>{session.lessonTitle}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={14} />
                    {session.groupName}
                  </div>
                  
                  {session.status === 'in_progress' && session.meetingLink && (
                    <a 
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 py-2 rounded-lg font-medium transition shadow-sm text-sm"
                    >
                      <Video size={16} />
                      Подключиться
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Правая колонка: Проверка ДЗ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">ДЗ на проверку</h2>
            <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-semibold">{submissions.length}</span>
          </div>

          <div className="flex-1 flex overflow-hidden">
              <div className="w-full overflow-y-auto p-4">
                 {submissions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Всё проверено!</h3>
                    <p className="mt-1 text-gray-500">Ожидающих заданий нет.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.map(sub => (
                      <Link 
                        href={`/dashboard/homeworks/${sub.id}`}
                        key={sub.id} 
                        className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between block"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{sub.studentName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(sub.submittedAt).toLocaleString('ru-RU')}</p>
                          </div>
                        </div>
                        <FileText size={16} className="text-gray-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
