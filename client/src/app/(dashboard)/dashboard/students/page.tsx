'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Users, Search, Mail, Phone, BookOpen, Clock, Settings, UserPlus, Trash2 } from 'lucide-react';
import MyStudentsPage from './MyStudentsPage'; // We will rename the current file to MyStudentsPage and import it here.

export default function StudentsPage() {
  const { user } = useAuthStore();

  if (user?.role === 'teacher') {
    return <MyStudentsPage />;
  }

  if (user?.role === 'manager' || user?.role === 'admin') {
    return <ManagerStudentsPage />;
  }

  return <div className="p-8 text-gray-500">Нет доступа.</div>;
}

function ManagerStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'assigned'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);

  const [assignmentType, setAssignmentType] = useState<'group' | 'individual'>('group');
  const [assignTeacherId, setAssignTeacherId] = useState<number>(0);
  const [assignCourseId, setAssignCourseId] = useState<number>(0);

  const fetchData = async (currentSelectedId?: number) => {
    try {
      const [studentsRes, groupsRes, coursesRes, usersRes] = await Promise.all([
        apiClient.get('/users/manager/students'),
        apiClient.get('/groups'),
        apiClient.get('/courses'),
        apiClient.get('/users')
      ]);
      setStudents(studentsRes.data);
      setGroups(groupsRes.data);
      setAllCourses(coursesRes.data);
      setTeachers(usersRes.data.filter((u: any) => u.role === 'teacher'));
      
      const activeId = currentSelectedId || selectedStudent?.id;
      if (activeId) {
        const updated = studentsRes.data.find((s: any) => s.id === activeId);
        if (updated) setSelectedStudent(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenGroupModal = () => {
    setAssignmentType('group');
    setSelectedGroupId(0);
    setAssignTeacherId(0);
    setAssignCourseId(0);
    setIsGroupModalOpen(true);
  };

  const handleAddStudentToGroup = async () => {
    if (!selectedStudent) return;
    try {
      if (assignmentType === 'group') {
        if (!selectedGroupId) return;
        await apiClient.post(`/groups/${selectedGroupId}/students`, { studentId: selectedStudent.id });
      } else {
        if (!assignTeacherId || !assignCourseId) return;
        await apiClient.post(`/groups/teacher/${assignTeacherId}/claim`, { 
          studentId: selectedStudent.id, 
          courseId: assignCourseId 
        });
      }
      setIsGroupModalOpen(false);
      setSelectedGroupId(0);
      setAssignTeacherId(0);
      setAssignCourseId(0);
      fetchData(selectedStudent.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при назначении');
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedStudent || !selectedCourseId) return;
    try {
      await apiClient.post(`/users/${selectedStudent.id}/course-access`, { courseId: selectedCourseId });
      setIsCourseModalOpen(false);
      setSelectedCourseId(0);
      fetchData(selectedStudent.id);
    } catch {
      // ignore error
    }
  };

  const handleRevokeAccess = async (courseId: number) => {
    if (!selectedStudent) return;
    if (confirm('Вы уверены, что хотите забрать доступ к этому курсу?')) {
      try {
        await apiClient.delete(`/users/${selectedStudent.id}/course-access/${courseId}`);
        fetchData(selectedStudent.id);
      } catch {
        alert('Ошибка при удалении доступа');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isFree = s.studentGroups.length === 0 && s.purchases.length === 0;
    
    if (filterType === 'free') return matchesSearch && isFree;
    if (filterType === 'assigned') return matchesSearch && !isFree;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex-shrink-0">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Ученики (CRM)</h1>
        <p className="text-gray-400 relative z-10">Пул всех зарегистрированных учеников и управление доступами</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Левая колонка */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Все</button>
              <button onClick={() => setFilterType('free')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'free' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Свободные</button>
              <button onClick={() => setFilterType('assigned')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'assigned' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>В работе</button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск учеников..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {loading ? <div className="text-center text-gray-500 mt-10">Загрузка...</div> : 
             filteredStudents.length === 0 ? <div className="text-center text-gray-500 mt-10">Ничего не найдено.</div> :
             filteredStudents.map(student => {
               const isFree = student.studentGroups.length === 0 && student.purchases.length === 0;
               return (
                 <div 
                   key={student.id} 
                   onClick={() => setSelectedStudent(student)}
                   className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                     selectedStudent?.id === student.id 
                       ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                       : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                   }`}
                 >
                   <div className="flex justify-between items-start">
                     <h3 className={`text-sm font-bold truncate ${selectedStudent?.id === student.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                       {student.studentName || student.fullName || 'Без имени'}
                     </h3>
                     {isFree ? (
                       <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ml-2">Свободен</span>
                     ) : (
                       <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ml-2">В работе</span>
                     )}
                   </div>
                   <div className="text-xs text-gray-500 space-y-1">
                     <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400"/> {student.phone || 'Нет телефона'}</div>
                     <div className="flex items-center gap-1"><Mail size={12} className="text-gray-400"/> {student.email}</div>
                   </div>
                   {!isFree && (
                     <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                       {student.purchases.length > 0 && <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">Курсов: {student.purchases.length}</span>}
                       {student.studentGroups.length > 0 && <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">Групп: {student.studentGroups.length}</span>}
                     </div>
                   )}
                 </div>
               );
             })
            }
          </div>
        </div>

        {/* Правая колонка */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto relative">
          {!selectedStudent ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
               <Users size={64} className="text-gray-200 mb-4" />
               <p className="text-lg font-medium text-gray-600">Выберите ученика</p>
               <p className="text-sm mt-1">Нажмите на карточку ученика в списке слева, чтобы посмотреть его покупки, расписание и управлять доступом.</p>
             </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {(selectedStudent.studentName || selectedStudent.fullName || selectedStudent.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.studentName || selectedStudent.fullName || 'Без имени'}</h2>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1"><Mail size={14}/> {selectedStudent.email}</span>
                      {selectedStudent.phone && <span className="flex items-center gap-1"><Phone size={14}/> {selectedStudent.phone}</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Расписание и Группы */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={16} className="text-indigo-500"/> Расписание (Группы)</h3>
                    <button onClick={() => setIsGroupModalOpen(true)} className="text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1">
                      <UserPlus size={14} /> Добавить
                    </button>
                  </div>
                  {selectedStudent.studentGroups.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Ученик еще не прикреплен к расписанию.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.studentGroups.map((sg: any) => {
                        const currentGroup = groups.find(g => g.id === sg.groupId);
                        return (
                          <div key={sg.groupId} className="bg-white border border-gray-200 p-3 rounded-xl flex flex-col gap-2 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{sg.group.name}</p>
                                <p className="text-xs text-gray-500">{sg.group.type === 'group' ? 'Групповое занятие' : 'Индивидуально'}</p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm('Вы уверены, что хотите убрать ученика из этой группы?')) {
                                    try {
                                      await apiClient.delete(`/groups/${sg.groupId}/students/${selectedStudent.id}`);
                                      fetchData(selectedStudent.id);
                                    } catch (err) {
                                      alert('Ошибка при удалении из группы');
                                    }
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Убрать ученика из группы"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 whitespace-nowrap">Преподаватель:</span>
                              <span className="text-xs font-bold text-gray-900">
                                {teachers.find(t => t.id === currentGroup?.teacherId)?.fullName || teachers.find(t => t.id === currentGroup?.teacherId)?.email || 'Не назначен'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Доступ к курсам (Покупки) */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><BookOpen size={18} className="text-indigo-500"/> Открытые курсы</h3>
                    <button onClick={() => setIsCourseModalOpen(true)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1">
                      + Добавить
                    </button>
                  </div>
                  {selectedStudent.purchases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <BookOpen size={32} className="mb-3 opacity-20" />
                      <p className="text-sm font-medium">Нет выданных курсов</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedStudent.purchases.map((p: any) => (
                        <div key={p.id} className="relative bg-gray-50 border border-gray-100 hover:border-indigo-200 p-4 rounded-xl transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600">
                              <BookOpen size={18} />
                            </div>
                            <div className="flex-1 pr-6">
                              <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{p.course?.title}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Доступ открыт</span>
                                <span className="text-xs font-medium text-gray-400">с {new Date(p.purchaseAt).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRevokeAccess(p.courseId)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                            title="Закрыть доступ"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Group Modal */}
      {isGroupModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Поставить в расписание</h2>
            <p className="text-sm text-gray-600 mb-4">Выберите формат обучения для ученика <span className="font-bold">{selectedStudent.studentName || selectedStudent.fullName}</span>.</p>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={assignmentType === 'group'} onChange={() => setAssignmentType('group')} className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Группа</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={assignmentType === 'individual'} onChange={() => setAssignmentType('individual')} className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Индивидуально</span>
              </label>
            </div>

            {assignmentType === 'group' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Группа</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                >
                  <option value={0} disabled>Выберите группу...</option>
                  {groups.filter(g => g.type === 'group').map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Преподаватель</label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(Number(e.target.value))}
                  >
                    <option value={0} disabled>Выберите преподавателя...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName || t.studentName || t.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">По какому курсу</label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={assignCourseId}
                    onChange={(e) => setAssignCourseId(Number(e.target.value))}
                  >
                    <option value={0} disabled>Выберите курс...</option>
                    {allCourses.filter(c => selectedStudent.purchases.some((p: any) => p.courseId === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  {allCourses.filter(c => selectedStudent.purchases.some((p: any) => p.courseId === c.id)).length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Ученику не выдан ни один курс. Сначала выдайте доступ к курсу.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Отмена
              </button>
              <button 
                onClick={handleAddStudentToGroup}
                disabled={assignmentType === 'group' ? !selectedGroupId : (!assignTeacherId || !assignCourseId)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Назначить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Выдать доступ к курсу</h2>
            <p className="text-sm text-gray-600 mb-4">Выберите курс для ученика <span className="font-bold">{selectedStudent.studentName || selectedStudent.fullName}</span>.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Курс</label>
              <select 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              >
                <option value={0} disabled>Выберите курс...</option>
                {allCourses.filter(c => !selectedStudent.purchases.some((p: any) => p.courseId === c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsCourseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Отмена
              </button>
              <button 
                onClick={handleGrantAccess}
                disabled={!selectedCourseId}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Выдать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
