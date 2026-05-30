'use client';

import { useEffect, useState } from 'react';
import { HomeworkSubmission, homeworkService } from '@/lib/services/homework.service';
import { useAuthStore } from '@/store/authStore';
import { CheckSquare, FileText, Mail, ArrowLeft, History as HistoryIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EnrichedSubmission extends HomeworkSubmission {
  studentName?: string;
  studentEmail?: string;
}

interface HomeworkAssignment {
  id: number;
  description: string;
  lessonId: number;
}

export default function TeacherGradingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [submission, setSubmission] = useState<EnrichedSubmission | null>(null);
  const [assignment, setAssignment] = useState<HomeworkAssignment | null>(null);
  const [studentHistory, setStudentHistory] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<string>('0');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const submissionId = parseInt(params.id, 10);
      
      const allSub = await homeworkService.getAllSubmissions();
      const currentSub = allSub.find(s => s.id === submissionId);
      
      if (!currentSub) {
        setError('Решение не найдено или вы не имеете к нему доступа');
        setLoading(false);
        return;
      }

      let studentName = `Студент #${currentSub.studentId}`;
      let studentEmail = '';
      try {
        const userRes = await apiClient.get(`/users/${currentSub.studentId}`);
        studentName = userRes.data.fullName || userRes.data.studentName || 'Неизвестный студент';
        studentEmail = userRes.data.email;
      } catch {}

      setSubmission({ ...currentSub, studentName, studentEmail });

      try {
        const hwRes = await apiClient.get('/homeworks');
        const currentHw = hwRes.data.find((h: any) => h.id === currentSub.homeworkId);
        if (currentHw) setAssignment(currentHw);
      } catch {}

      try {
        setHistoryLoading(true);
        const res = await apiClient.get(`/homeworks/submissions/student/${currentSub.studentId}`);
        // Combine current submission with history and sort by date descending
        const allAttempts = res.data.filter((s: any) => s.homeworkId === currentSub.homeworkId);
        setStudentHistory(allAttempts.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      } catch {} finally {
        setHistoryLoading(false);
      }

    } catch {
      setError('Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmission();
    }
  }, [user]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !user) return;
    
    setSubmitting(true);
    try {
      await homeworkService.grade(
        submission.id, 
        parseInt(score, 10), 
        user.id, 
        comment
      );
      fetchSubmission();
    } catch (err) {
      console.error('Ошибка проверки', err);
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

  if (error || !submission) {
    return (
        <div>
            <Link href="/dashboard/homeworks" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium">
                <ArrowLeft size={16} /> Назад к списку
            </Link>
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/dashboard/homeworks" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
        <ArrowLeft size={16} /> Назад к списку решений
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Решение от: {submission.studentName}</h1>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail size={14}/> {submission.studentEmail}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Ожидает проверки с:</p>
                <p className="font-bold text-gray-900">{new Date(submission.submittedAt).toLocaleDateString('ru-RU')} {new Date(submission.submittedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8 bg-gray-50/30">
            {/* Текст самого задания */}
            <div>
                <h3 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={14} /> Текст домашнего задания
                </h3>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
                    <div 
                        className="prose prose-sm prose-indigo max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: assignment ? marked.parse(assignment.description) as string : 'Задание не найдено' }}
                    />
                </div>
            </div>

            {/* История попыток */}
            <div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HistoryIcon size={14} /> История решений ученика
                </h3>
                {historyLoading ? (
                    <p className="text-gray-500 text-sm">Загрузка истории...</p>
                ) : studentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 text-sm">
                        Решений не найдено.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {studentHistory.map((historyItem, idx) => {
                            const isCurrent = historyItem.id === submission.id;
                            const attemptNumber = studentHistory.length - idx;
                            return (
                                <div key={historyItem.id} className={`bg-white border rounded-xl p-5 shadow-sm relative overflow-hidden ${isCurrent ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-gray-200'}`}>
                                    {isCurrent && (
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    )}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-900' : 'text-gray-600'}`}>
                                                Попытка #{attemptNumber} {isCurrent && '(Текущая)'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-medium text-gray-500">{new Date(historyItem.submittedAt).toLocaleString('ru-RU')}</span>
                                            {historyItem.status === 'accepted' ? (
                                                <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">Принято ({historyItem.score})</span>
                                            ) : historyItem.status === 'rejected' ? (
                                                <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">Отклонено</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">На проверке</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="whitespace-pre-wrap text-gray-800 font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 mb-3 leading-relaxed">
                                        {historyItem.content}
                                    </div>
                                    {historyItem.teacherComment && (
                                        <div className="bg-blue-50/50 text-blue-900 text-sm p-4 rounded-lg border border-blue-100">
                                            <strong className="block text-xs uppercase tracking-wider text-blue-700 mb-1">Ваш комментарий:</strong> 
                                            {historyItem.teacherComment}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-100 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] z-10 relative">
            <form onSubmit={handleGrade} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Оценка за текущую попытку (0-100)</label>
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    required
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-lg font-bold text-indigo-900"
                />
                </div>
                <div className="w-full sm:w-2/3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Комментарий к текущей попытке</label>
                <textarea 
                    rows={2}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Оставьте комментарий к работе"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-sm"
                />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                {submitting ? 'Сохранение...' : (
                    <>
                    <CheckSquare size={18} />
                    Оценить текущее решение
                    </>
                )}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
}
