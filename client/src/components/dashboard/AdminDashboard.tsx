'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { 
  DollarSign, 
  Users, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Award,
  CalendarDays
} from 'lucide-react';

export default function AdminDashboard({ greeting, firstName }: { greeting: string, firstName: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Ошибка загрузки статистики', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-purple-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">{greeting}, {firstName}!</h1>
        <p className="text-gray-400 relative z-10">Сводная аналитика платформы (Бизнес и Академия)</p>
      </div>

      {/* Financials & Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Общая выручка</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.financials.totalRevenue.toLocaleString('ru-RU')} ₽</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400">За все время</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Выручка за месяц</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.financials.currentMonthRevenue.toLocaleString('ru-RU')} ₽</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400">С 1-го числа текущего месяца</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Конверсия заявок</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.applications.conversionRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Target size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400">{stats.applications.closedApplications} успешных из {stats.applications.totalApplications} всего</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Проведено уроков</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.academic.totalSessions}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <CalendarDays size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Академическая активность</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            Пользователи (Роли)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Ученики (Users)</span>
              <span className="text-lg font-bold text-gray-900">{stats.users.user}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Преподаватели</span>
              <span className="text-lg font-bold text-gray-900">{stats.users.teacher}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Менеджеры</span>
              <span className="text-lg font-bold text-gray-900">{stats.users.manager}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">Администраторы</span>
              <span className="text-lg font-bold text-gray-900">{stats.users.admin}</span>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Лидерборд (Топ-5 учеников по баллам)
          </h3>
          
          {stats.topStudents.length === 0 ? (
             <div className="text-center py-8 text-gray-500">Пока нет учеников с баллами</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-3 font-medium px-2">Место</th>
                    <th className="pb-3 font-medium px-2">Имя ученика</th>
                    <th className="pb-3 font-medium px-2 text-right">Бонусные баллы</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.topStudents.map((student: any, index: number) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        {index === 0 ? <span className="text-yellow-500 font-bold">🥇 1</span> : 
                         index === 1 ? <span className="text-gray-400 font-bold">🥈 2</span> : 
                         index === 2 ? <span className="text-amber-600 font-bold">🥉 3</span> : 
                         <span className="text-gray-400 font-medium">{index + 1}</span>}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">{student.studentName || student.fullName || 'Без имени'}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="inline-block bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-lg">
                          {student.bonusPoints}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
