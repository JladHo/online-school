'use client';

import { useEffect, useState } from 'react';
import { HomeworkSubmission, homeworkService } from '@/lib/services/homework.service';
import { useAuthStore } from '@/store/authStore';
import { CheckSquare, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface EnrichedSubmission extends HomeworkSubmission {
  studentName?: string;
  studentEmail?: string;
}

export default function TeacherHomeworksListPage() {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      const allSub = await homeworkService.getAllSubmissions();
      const pendingSubs = allSub.filter(s => s.status === 'pending');

      const enriched = await Promise.all(
        pendingSubs.map(async (sub) => {
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

      setSubmissions(enriched);
    } catch {
      setError('Не удалось загрузить список домашних заданий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

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
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Ожидающие проверки ДЗ</h1>
        <p className="text-gray-400 relative z-10">Выберите решение из списка для детального просмотра и оценки</p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white flex flex-col items-center justify-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Отличная работа!</h3>
          <p className="mt-2 text-gray-500 max-w-md">Все домашние задания проверены. У ваших учеников пока нет новых решений, требующих оценки.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-900 flex justify-between items-center">
            <span className="flex items-center gap-2"><CheckSquare size={18} className="text-indigo-500" /> Ожидают проверки</span>
            <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2.5 rounded-lg text-xs font-black">{submissions.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {submissions.map(sub => (
              <Link 
                href={`/dashboard/homeworks/${sub.id}`} 
                key={sub.id} 
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm flex-shrink-0"></div>
                  <div>
                    <p className="font-bold text-gray-900">{sub.studentName}</p>
                    <p className="text-sm text-gray-500 mt-1">{sub.studentEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Сдано: {new Date(sub.submittedAt).toLocaleDateString('ru-RU')} {new Date(sub.submittedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1 group-hover:text-indigo-800">Перейти к проверке &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}