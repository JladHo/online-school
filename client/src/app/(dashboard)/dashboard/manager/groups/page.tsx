'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Users, User, BookOpen, Plus, X, Search, Edit2, Trash2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ManagerGroupsPage() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout States
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all'|'group'|'individual'>('all');

  // Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    courseId: 0,
    teacherId: 0
  });

  const fetchData = async (currentSelectedId?: number) => {
    try {
      setLoading(true);
      const [groupsRes, coursesRes, usersRes, studentsRes] = await Promise.all([
        apiClient.get('/groups'),
        apiClient.get('/courses'),
        apiClient.get('/users'),
        apiClient.get('/users/manager/students') // Includes purchases and studentGroups
      ]);

      const allGroups = groupsRes.data;
      setCourses(coursesRes.data);
      setTeachers(usersRes.data.filter((u: any) => u.role === 'teacher'));
      setStudents(studentsRes.data);

      // Enhance groups with student data
      const enrichedGroups = await Promise.all(allGroups.map(async (g: any) => {
        try {
           const stds = await apiClient.get(`/groups/${g.id}/students`);
           return { ...g, studentsList: stds.data };
        } catch {
           return { ...g, studentsList: [] };
        }
      }));

      setGroups(enrichedGroups);

      const activeId = currentSelectedId || selectedGroup?.id;
      if (activeId) {
        const updated = enrichedGroups.find((g: any) => g.id === activeId);
        if (updated) setSelectedGroup(updated);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenGroupModal = () => {
    setFormData({
      name: '',
      courseId: courses.length > 0 ? courses[0].id : 0,
      teacherId: 0
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!formData.name.trim() || !formData.courseId) {
      alert('Заполните название группы и выберите курс');
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        type: 'group', // Strict creation is only 'group'
        courseId: Number(formData.courseId),
        teacherId: formData.teacherId ? Number(formData.teacherId) : null
      };

      await apiClient.post('/groups', payload);
      setIsGroupModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка создания группы');
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту группу? Ученики из нее будут исключены.')) {
      try {
        await apiClient.delete(`/groups/${id}`);
        setSelectedGroup(null);
        fetchData();
      } catch (err) {
        alert('Ошибка при удалении группы');
      }
    }
  };

  const handleUpdateGroupParams = async (field: string, value: any) => {
    if (!selectedGroup) return;
    try {
      if (field === 'teacherId') {
        await apiClient.patch(`/groups/${selectedGroup.id}/teacher`, { teacherId: value ? Number(value) : null });
      } else {
        await apiClient.patch(`/groups/${selectedGroup.id}`, { [field]: value });
      }
      fetchData(selectedGroup.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка обновления группы');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!selectedGroup) return;
    if (confirm('Убрать ученика из группы?')) {
      try {
        await apiClient.delete(`/groups/${selectedGroup.id}/students/${studentId}`);
        fetchData(selectedGroup.id);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Ошибка при удалении ученика');
      }
    }
  };

  const handleAddStudent = async () => {
    if (!selectedGroup || !selectedStudentToAdd) return;
    try {
      await apiClient.post(`/groups/${selectedGroup.id}/students`, { studentId: selectedStudentToAdd });
      setIsAddStudentModalOpen(false);
      setSelectedStudentToAdd(0);
      fetchData(selectedGroup.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при добавлении ученика');
    }
  };

  const filteredGroupsList = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || g.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex-shrink-0">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Группы (Учебная логистика)</h1>
        <p className="text-gray-400 relative z-10">Управление потоками, преподавателями и составом классов</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Левая колонка: Список групп */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
               <div className="flex gap-2">
                 <button onClick={() => setFilterType('all')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Все</button>
                 <button onClick={() => setFilterType('group')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterType === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Группы</button>
                 <button onClick={() => setFilterType('individual')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterType === 'individual' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Инд.</button>
               </div>
               <button 
                 onClick={handleOpenGroupModal}
                 className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-1.5 rounded-lg transition"
                 title="Создать новую группу"
               >
                 <Plus size={16} />
               </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск групп..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {loading ? <div className="text-center text-gray-500 mt-10">Загрузка...</div> : 
             filteredGroupsList.length === 0 ? <div className="text-center text-gray-500 mt-10">Группы не найдены.</div> :
             filteredGroupsList.map(group => (
               <div 
                 key={group.id} 
                 onClick={() => setSelectedGroup(group)}
                 className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                   selectedGroup?.id === group.id 
                     ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                     : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 <div className="flex justify-between items-start">
                   <h3 className={`text-sm font-bold truncate ${selectedGroup?.id === group.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                     {group.name}
                   </h3>
                   <span className={`px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ml-2 ${group.type === 'individual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                     {group.type === 'individual' ? 'Инд.' : 'Группа'}
                   </span>
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    <BookOpen size={12} className="text-gray-400"/> 
                    <span className="truncate">{courses.find(c => c.id === group.courseId)?.title || 'Курс не найден'}</span>
                 </div>
                 <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Users size={12}/> {group.studentsList?.length || 0} уч.</span>
                    <span className="flex items-center gap-1"><User size={12}/> {teachers.find(t => t.id === group.teacherId)?.fullName || 'Не назначен'}</span>
                 </div>
               </div>
             ))
            }
          </div>
        </div>

        {/* Правая колонка: Детали группы */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto relative">
          {!selectedGroup ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
               <Users size={64} className="text-gray-200 mb-4" />
               <p className="text-lg font-medium text-gray-600">Выберите группу</p>
               <p className="text-sm mt-1">Нажмите на карточку в списке слева, чтобы редактировать настройки группы и её состав.</p>
             </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedGroup.type === 'individual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                       {selectedGroup.type === 'individual' ? 'Индивидуальное занятие' : 'Групповое занятие'}
                     </span>
                     <span className="text-gray-400 text-xs font-mono">ID: {selectedGroup.id}</span>
                  </div>
                  <input 
                    type="text" 
                    value={selectedGroup.name}
                    onChange={(e) => setSelectedGroup({...selectedGroup, name: e.target.value})}
                    onBlur={(e) => handleUpdateGroupParams('name', e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-full transition-colors pb-1"
                  />
                </div>
                <button 
                  onClick={() => handleDeleteGroup(selectedGroup.id)}
                  className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center shrink-0"
                  title="Удалить группу"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Учебный курс</label>
                  <div className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-lg">
                    <BookOpen size={16} className="text-indigo-500 shrink-0 mx-2"/>
                    <select 
                      className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
                      value={selectedGroup.courseId}
                      onChange={(e) => handleUpdateGroupParams('courseId', Number(e.target.value))}
                    >
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Преподаватель</label>
                  <div className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-lg">
                    <User size={16} className="text-indigo-500 shrink-0 mx-2"/>
                    <select 
                      className="flex-1 bg-transparent text-sm font-semibold text-gray-900 outline-none cursor-pointer"
                      value={selectedGroup.teacherId || ''}
                      onChange={(e) => handleUpdateGroupParams('teacherId', e.target.value)}
                    >
                      <option value="">Не назначен (Пул свободных)</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName || t.email}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Состав учеников */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Состав группы</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedGroup.type === 'group' && selectedGroup.studentsList?.length >= 6 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedGroup.studentsList?.length || 0} {selectedGroup.type === 'group' ? '/ 6' : '/ 1'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Добавить
                  </button>
                </div>

                <div className="space-y-2">
                  {!selectedGroup.studentsList || selectedGroup.studentsList.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
                      В этой группе пока нет учеников
                    </div>
                  ) : (
                    selectedGroup.studentsList.map((link: any) => {
                      const st = students.find(s => s.id === link.studentId);
                      return (
                        <div key={link.studentId} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                              {(st?.studentName || st?.fullName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{st?.studentName || st?.fullName || 'Ученик удален'}</p>
                              <p className="text-xs text-gray-500">{st?.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveStudent(link.studentId)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Исключить из группы"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Group Creation Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Новая группа</h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название группы</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Напр. Web-101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Учебный курс</label>
                <select 
                  value={formData.courseId} 
                  onChange={e => setFormData({...formData, courseId: Number(e.target.value)})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={0} disabled>Выберите курс</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Преподаватель (Опционально)</label>
                <select 
                  value={formData.teacherId} 
                  onChange={e => setFormData({...formData, teacherId: Number(e.target.value)})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={0}>-- Не назначать пока --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName || t.studentName || t.email}</option>)}
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsGroupModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
              <button onClick={handleSaveGroup} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Создать</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Добавить ученика</h2>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">Выберите ученика для добавления в <span className="font-bold">{selectedGroup.name}</span>.</p>
              
              <div>
                <select 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedStudentToAdd}
                  onChange={(e) => setSelectedStudentToAdd(Number(e.target.value))}
                >
                  <option value={0} disabled>Выберите ученика...</option>
                  {students
                    .filter(s => {
                      // Ученик должен иметь доступ к курсу группы
                      const hasCourse = s.purchases?.some((p: any) => p.courseId === selectedGroup.courseId);
                      // Ученик НЕ должен уже быть в этой группе
                      const notInGroup = !s.studentGroups?.some((sg: any) => sg.groupId === selectedGroup.id);
                      return hasCourse && notInGroup;
                    })
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.studentName || s.fullName} ({s.email})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Отображаются только ученики, которым выдан доступ к курсу этой группы.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsAddStudentModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
              <button onClick={handleAddStudent} disabled={!selectedStudentToAdd} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition">Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
