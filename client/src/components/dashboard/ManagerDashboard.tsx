'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Mail, Phone, Clock, CheckCircle, XCircle, Search, Inbox, ChevronRight, UserPlus } from 'lucide-react';

interface Application {
  id: number;
  parentName: string;
  studentName: string;
  phone: string;
  email: string;
  courseId: number | null;
  status: 'new' | 'in_progress' | 'closed' | 'rejected';
  createdAt: string;
  managerId: number | null;
}

interface Course {
  id: number;
  title: string;
}

export default function ManagerDashboard({ greeting, firstName }: { greeting: string, firstName: string }) {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [newUserForm, setNewUserForm] = useState({
    parentName: '',
    studentName: '',
    email: '',
    phone: '',
    birthday: '',
    role: 'user'
  });
  
  const [registeredAppIds, setRegisteredAppIds] = useState<number[]>([]);

  useEffect(() => {
    if (selectedApp) {
      setNewUserForm({
        parentName: selectedApp.parentName || '',
        studentName: selectedApp.studentName || '',
        email: selectedApp.email || '',
        phone: selectedApp.phone || '',
        birthday: '',
        role: 'user'
      });
    }
  }, [selectedApp]);

  const handleCreateUser = async () => {
    try {
      const payload = {
         ...newUserForm,
         birthday: newUserForm.birthday ? new Date(newUserForm.birthday).toISOString() : undefined
      };
      const res = await apiClient.post('/users', payload);
      alert(`Пользователь успешно создан! Сгенерированный пароль: ${res.data.generatedPassword}`);
      if (selectedApp) {
        setRegisteredAppIds(prev => [...prev, selectedApp.id]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при создании пользователя');
    }
  };

  const fetchApps = async () => {
    try {
      const [appRes, courseRes] = await Promise.all([
        apiClient.get('/applications'),
        apiClient.get('/courses')
      ]);
      setApplications(appRes.data);
      setCourses(courseRes.data);
      // Update selected app if it was modified
      if (selectedApp) {
        const updated = appRes.data.find((a: Application) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [user]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/applications/${id}/status`, { status });
      fetchApps();
    } catch {
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleTakeInWork = async (id: number) => {
    if (!user) return;
    try {
      await apiClient.patch(`/applications/${id}/manager`, { managerId: user.id });
      await apiClient.patch(`/applications/${id}/status`, { status: 'in_progress' });
      fetchApps();
    } catch {
      alert('Ошибка при взятии в работу');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold">Новая</span>;
      case 'in_progress': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-semibold">В работе</span>;
      case 'closed': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">Успех</span>;
      case 'rejected': return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold">Отказ</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold">{status}</span>;
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.parentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.phone.includes(searchQuery) ||
                          app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex-shrink-0">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">{greeting}, {firstName}!</h1>
        <p className="text-gray-400 relative z-10">Рабочий стол менеджера: управление входящими заявками</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Левая панель: Пул заявок */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                <Inbox size={18} className="text-indigo-500" />
                Заявки ({filteredApps.length})
              </h2>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Поиск (Имя, email, телефон)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {['all', 'new', 'in_progress', 'closed', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filterStatus === status 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Все' : 
                     status === 'new' ? 'Новые' : 
                     status === 'in_progress' ? 'В работе' : 
                     status === 'closed' ? 'Успех' : 'Отказ'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {loading ? (
              <div className="text-center text-gray-500 mt-10">Загрузка...</div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">Заявки не найдены.</div>
            ) : (
              filteredApps.map(app => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    selectedApp?.id === app.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold truncate ${selectedApp?.id === app.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {app.studentName}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1"><Phone size={12}/> {app.phone}</div>
                    <div className="flex items-center gap-1"><Mail size={12}/> {app.email}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex justify-between items-center">
                    <span>Родитель: {app.parentName}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Правая панель: Обработка заявки */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto relative">
          {!selectedApp ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Inbox size={64} className="text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-600">Выберите заявку</p>
              <p className="text-sm mt-1">Нажмите на карточку заявки в списке слева, чтобы просмотреть детали и взять её в работу.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Заявка #{selectedApp.id}</h2>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14}/> Оставлена: {new Date(selectedApp.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedApp.status === 'new' && (
                    <button 
                      onClick={() => handleTakeInWork(selectedApp.id)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                      Взять в работу
                    </button>
                  )}
                  
                  {selectedApp.status === 'in_progress' && selectedApp.managerId === user?.id && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(selectedApp.id, 'closed')}
                        className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-sm font-bold flex items-center gap-1 transition"
                      >
                        <CheckCircle size={16} /> Успех
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                        className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-bold flex items-center gap-1 transition"
                      >
                        <XCircle size={16} /> Отказ
                      </button>
                    </>
                  )}
                  {selectedApp.status === 'in_progress' && selectedApp.managerId !== user?.id && (
                    <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-100">
                      Взят в работу другим менеджером
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ФИО Клиента (Родителя)</p>
                    <p className="text-lg font-medium text-gray-900">{selectedApp.parentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Телефон</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400"/> {selectedApp.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400"/> {selectedApp.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Имя ученика</p>
                    <p className="text-lg font-medium text-gray-900">{selectedApp.studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Интересующий курс</p>
                    <p className="text-base font-medium text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-lg mt-1 border border-indigo-100">
                      {courses.find(c => c.id === selectedApp.courseId)?.title || 'Не выбран'}
                    </p>
                  </div>
                </div>
              </div>

              {((selectedApp.status === 'in_progress') && selectedApp.managerId === user?.id && !registeredAppIds.includes(selectedApp.id)) && (
                <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserPlus size={16} className="text-indigo-500" /> Регистрация аккаунта ученика
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ФИО Родителя</label>
                      <input 
                        type="text" 
                        value={newUserForm.parentName}
                        onChange={e => setNewUserForm({...newUserForm, parentName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ФИО Ученика</label>
                      <input 
                        type="text" 
                        value={newUserForm.studentName}
                        onChange={e => setNewUserForm({...newUserForm, studentName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={newUserForm.email}
                        onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Телефон</label>
                      <input 
                        type="text" 
                        value={newUserForm.phone}
                        onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Дата рождения ученика (опц.)</label>
                      <input 
                        type="date" 
                        value={newUserForm.birthday}
                        onChange={e => setNewUserForm({...newUserForm, birthday: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleCreateUser}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                      >
                        Зарегистрировать
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions / Status Info */}
              <div className="mt-auto bg-blue-50 border border-blue-100 p-5 rounded-xl text-sm text-blue-800">
                <h4 className="font-bold mb-2 flex items-center gap-2">Статус обработки</h4>
                {selectedApp.status === 'new' && <p>Эта заявка только поступила. Нажмите <b>«Взять в работу»</b>, чтобы закрепить её за собой и связаться с клиентом.</p>}
                {selectedApp.status !== 'new' && selectedApp.managerId !== user?.id && <p>Эта заявка обрабатывается или была обработана другим менеджером.</p>}
                {selectedApp.status === 'in_progress' && selectedApp.managerId === user?.id && <p>Вы взяли эту заявку в работу. Свяжитесь с клиентом по указанным контактам. По результатам разговора отметьте заявку как <b>«Успех»</b> (если клиент готов купить курс) или <b>«Отказ»</b>.</p>}
                {selectedApp.status === 'closed' && selectedApp.managerId === user?.id && <p>Заявка успешно закрыта. Клиент согласился на обучение. Вы можете выдать доступ к курсу в разделе <b>Студенты</b>.</p>}
                {selectedApp.status === 'rejected' && selectedApp.managerId === user?.id && <p>Заявка закрыта с отказом.</p>}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
