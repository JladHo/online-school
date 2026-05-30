'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson, lessonService } from '@/lib/services/lesson.service';
import { Homework, HomeworkSubmission, homeworkService } from '@/lib/services/homework.service';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, ChevronLeft, Clock, FileText, Send, XCircle } from 'lucide-react';
import LessonRenderer from '@/components/dashboard/LessonRenderer';

export default function LessonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissionsHistory, setSubmissionsHistory] = useState<HomeworkSubmission[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [homeworkContent, setHomeworkContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!user) return;
      
      try {
        const lessonId = parseInt(params.id, 10);
        if (isNaN(lessonId)) {
          setError('Неверный ID урока');
          return;
        }

        const lessonData = await lessonService.getById(lessonId);
        setLesson(lessonData);

        const hws = await homeworkService.getByLessonId(lessonId);
        setHomeworks(hws);

        if (hws.length > 0) {
          const submissions = await homeworkService.getSubmissionsByStudentId(user.id);
          // Найдем все решения для первого ДЗ этого урока
          const subs = submissions.filter(s => s.homeworkId === hws[0].id);
          
          // Сортируем по дате убывания (самые новые сверху)
          subs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          
          setSubmissionsHistory(subs);
        }
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить данные урока');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [params.id, user]);

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || homeworks.length === 0 || !homeworkContent.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const newSubmission = await homeworkService.submit(homeworks[0].id, user.id, homeworkContent);
      // Добавляем новое решение в начало истории
      setSubmissionsHistory(prev => [newSubmission, ...prev]);
      setHomeworkContent('');
    } catch (err) {
      console.error(err);
      // @ts-expect-error - fast fix for error response
      setSubmitError(err.response?.data?.message || 'Не удалось отправить домашнее задание');
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

  if (error || !lesson) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error || 'Урок не найден'}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 text-sm font-medium text-red-700 underline"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const latestSubmission = submissionsHistory.length > 0 ? submissionsHistory[0] : null;
  const canSubmitAgain = !latestSubmission || latestSubmission.status === 'rejected';

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Назад к модулю
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{lesson.title}</h1>
        <p className="mt-2 text-lg text-gray-500">{lesson.description}</p>
      </div>

      {/* Lesson Content */}
      <div className="prose max-w-none rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <LessonRenderer content={lesson.content} />
      </div>

      {/* Homework Section */}
      {homeworks.length > 0 && (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Домашнее задание</h2>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-700 whitespace-pre-wrap">{homeworks[0].description}</p>
          </div>

          {/* Форма отправки показывается только если нет решений или последнее решение отклонено */}
          {canSubmitAgain && (
            <div className={submissionsHistory.length > 0 ? "mb-8 border-b border-gray-200 pb-8" : ""}>
              {submissionsHistory.length > 0 && (
                <h3 className="text-lg font-medium text-gray-900 mb-4">Отправить новую попытку:</h3>
              )}
              <form onSubmit={handleSubmitHomework} className="space-y-4">
                <div>
                  <label htmlFor="homework-content" className="block text-sm font-medium leading-6 text-gray-900">
                    Ваш ответ
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="homework-content"
                      name="homework-content"
                      rows={6}
                      className="block w-full rounded-md border-0 p-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Напишите здесь ваше решение или прикрепите ссылку на репозиторий..."
                      value={homeworkContent}
                      onChange={(e) => setHomeworkContent(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !homeworkContent.trim()}
                  className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Отправка...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      Отправить на проверку
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* История решений */}
          {submissionsHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">История ваших решений:</h3>
              {submissionsHistory.map((sub, index) => (
                <div key={sub.id} className={`rounded-xl border p-6 ${index === 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-gray-50 opacity-75'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                        Попытка #{submissionsHistory.length - index}
                      </span>
                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          <Clock className="h-4 w-4" /> На проверке
                        </span>
                      )}
                      {sub.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          <CheckCircle className="h-4 w-4" /> Принято
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          <XCircle className="h-4 w-4" /> Отклонено
                        </span>
                      )}
                      
                      {sub.score !== null && (
                        <span className="text-sm font-medium text-gray-600">
                          Оценка: {sub.score} / 100
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500">Ваш ответ:</p>
                    <div className="mt-1 rounded-md bg-white p-3 text-sm text-gray-800 shadow-sm ring-1 ring-gray-200 whitespace-pre-wrap">
                      {sub.content}
                    </div>
                  </div>

                  {sub.teacherComment && (
                    <div className={`mt-4 rounded-lg p-4 ring-1 border-l-4 ${sub.status === 'accepted' ? 'bg-green-50 ring-green-100 border-green-500' : 'bg-red-50 ring-red-100 border-red-500'}`}>
                      <p className={`text-xs font-semibold mb-1 ${sub.status === 'accepted' ? 'text-green-800' : 'text-red-800'}`}>
                        Комментарий преподавателя:
                      </p>
                      <p className={`text-sm whitespace-pre-wrap ${sub.status === 'accepted' ? 'text-green-900' : 'text-red-900'}`}>
                        {sub.teacherComment}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
