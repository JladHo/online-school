'use client';

import { useAuthStore } from '@/store/authStore';
import { Clock, Calendar, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user, setAuth } = useAuthStore();
  const [todaySessions, setTodaySessions] = useState<{ time: string, isPast: boolean }[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      if (user.role === 'user') {
        try {
          const userRes = await apiClient.get(`/users/${user.id}`);
          if (userRes.data && userRes.data.bonusPoints !== user.bonusPoints) {
             const token = localStorage.getItem('token') || '';
             setAuth(userRes.data, token);
          }
          
          try {
            const coursesRes = await apiClient.get(`/users/${user.id}/courses`);
            setMyCourses(coursesRes.data);
          } catch {}

          const sessionsRes = await apiClient.get('/sessions');
          const allSessions = sessionsRes.data;
          
          const userGroupsRes = await apiClient.get(`/users/${user.id}/groups`);
          const myGroupIds = userGroupsRes.data.map((g: any) => g.id);
          const mySessions = allSessions.filter((s: { groupId: number }) => myGroupIds.includes(s.groupId));

          const now = new Date();
          const today = mySessions.filter((s: { scheduledAt: string | Date }) => {
            const d = new Date(s.scheduledAt);
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          if (today.length > 0) {
            today.sort((a: { scheduledAt: string | Date }, b: { scheduledAt: string | Date }) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
            setTodaySessions(today.map((t: { scheduledAt: string | Date; durationMin: number }) => {
               const d = new Date(t.scheduledAt);
               return {
                 time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                 isPast: d.getTime() + t.durationMin * 60000 < now.getTime()
               }
            }));
          }
        } catch {
          // ignore
        }
      }
    };
    fetchStats();
  }, [user, setAuth]);

  // Приветствие в зависимости от времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const greeting = getGreeting();
  const firstName = (user?.fullName || user?.studentName)?.split(' ')[1] || user?.email?.split('@')[0] || 'пользователь';

  // Различный контент в зависимости от роли
  if (user?.role === 'user') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50 to-transparent"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{greeting}, {firstName}!</h1>
          <p className="text-gray-600 relative z-10">Добро пожаловать в личный кабинет. Твой путь в IT продолжается!</p>
        </div>

        {/* Текущий прогресс и расписание */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Продолжить обучение</h2>
              <Link href="/dashboard/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Все курсы <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {myCourses.length > 0 ? (
                <Link href={`/dashboard/courses/${myCourses[0].id}`} className="block p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">{myCourses[0].ageCategory || 'Для всех'}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={14}/> В процессе</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{myCourses[0].title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-1">{myCourses[0].description}</p>
                  
                  {/* Progress bar dummy */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">Начало положено</div>
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 h-full min-h-[140px]">
                  <p className="text-gray-600 font-medium">Нет доступных курсов</p>
                  <p className="text-xs mt-1 text-gray-400">Менеджер скоро откроет вам доступ</p>
                </div>
              )}
            </div>
          </div>

          <Link href="/dashboard/schedule" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group flex flex-col h-full block">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Занятия на сегодня</h2>
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:text-blue-700">
                Мой график <ArrowRight size={16} />
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-3">
              {todaySessions.length > 0 ? (
                todaySessions.map((session, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${session.isPast ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className={session.isPast ? 'text-gray-400' : 'text-blue-500'} />
                      <span className="font-bold">{session.time}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${session.isPast ? 'bg-gray-200 text-gray-600' : 'bg-blue-200 text-blue-800'}`}>
                      {session.isPast ? 'Завершено' : 'Запланировано'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 h-full min-h-[140px]">
                  <Calendar size={40} className="text-gray-300 mb-3 group-hover:text-blue-400 transition" />
                  <p className="text-gray-600 font-medium">Нет занятий на сегодня</p>
                  <p className="text-xs mt-1 text-gray-400">Можно немного отдохнуть!</p>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'teacher') {
		return <TeacherDashboard greeting={greeting} firstName={firstName} />
	}

  if (user?.role === 'manager') {
    return <ManagerDashboard greeting={greeting} firstName={firstName} />;
  }

  if (user?.role === 'admin') {
		return <AdminDashboard greeting={greeting} firstName={firstName} />
	}
}

