'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Users, Mail, Phone, User, X, Save, Edit3, Search } from 'lucide-react';
import { groupService } from '@/lib/services/group.service';
import { sessionService } from '@/lib/services/session.service';
import { moduleService } from '@/lib/services/module.service';
import { lessonService } from '@/lib/services/lesson.service';
import { homeworkService } from '@/lib/services/homework.service';

interface StudentSubmission {
  id: number;
  status: string;
  score: number | null;
  submittedAt: string | Date;
  courseTitle?: string;
  moduleTitle?: string;
  lessonTitle?: string;
  lessonOrder?: number;
}

interface StudentAttendance {
  id: number;
  isPresent: boolean;
  sessionDate: string | Date;
  courseTitle?: string;
  moduleTitle?: string;
  lessonTitle?: string;
  lessonOrder?: number;
}

interface EnrichedStudent {
  id: number;
  fullName: string;
  studentName: string;
  email: string;
  phone: string;
  groupId: number;
  groupName: string;
  groupType: 'group' | 'individual';
  courseId: number;
  courseName: string;
  teacherNote: string;
  homeworkStats: {
    total: number;
    accepted: number;
    averageScore: number;
  };
  attendanceStats: {
    pastSessions: number;
    attended: number;
  };
  homeworkList: StudentSubmission[];
  attendanceList: StudentAttendance[];
}

export default function MyStudentsPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<EnrichedStudent | null>(null);
  
  // Pool state
  const [viewMode, setViewMode] = useState<'my' | 'pool'>('my');
  const [poolStudents, setPoolStudents] = useState<any[]>([]);

  // Note editing state
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'hw' | 'attendance' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(s => 
    (s.studentName || s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPool = poolStudents.filter(p => 
    (p.student.studentName || p.student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStudents = async () => {
    if (!user || user.role !== 'teacher') return;

    try {
      setLoading(true);
      if (viewMode === 'pool') {
        const poolRes = await apiClient.get('/users/pool');
        setPoolStudents(poolRes.data);
        return;
      }

      const groups = await groupService.getGroupsByTeacherId(user.id);
        const allStudentsMap = new Map<number, EnrichedStudent>();

        const coursesRes = await apiClient.get('/courses');
        const courses = coursesRes.data;
        const allSessions = await sessionService.getAll();
        const allLessons = await lessonService.getAll();
        const allHomeworks = await homeworkService.getAll();
        
        // Fetch all modules
        const allModulesList = await moduleService.getAll();

        for (const group of groups) {
          const course = courses.find((c: { id: number }) => c.id === group.courseId);
          const courseName = course?.title || 'Неизвестный курс';
          
          const modules = allModulesList.filter((m: any) => m.courseId === group.courseId);
          const totalLessonsInCourse = allLessons.filter((l: { moduleId: number }) => modules.some((m: { id: number }) => m.id === l.moduleId)).length || 16;
          
          const now = new Date();
          const pastGroupSessions = allSessions.filter(s => s.groupId === group.id && new Date(s.scheduledAt) < now);

          const studentLinks = await groupService.getStudentsByGroupId(group.id);
          
          for (const link of studentLinks) {
            if (!allStudentsMap.has(link.studentId)) {
              const userRes = await apiClient.get(`/users/${link.studentId}`);
              const userData = userRes.data;

              let totalHw = 0;
              let acceptedHw = 0;
              let scoreSum = 0;
              let hwList: StudentSubmission[] = [];
              let attendanceList: StudentAttendance[] = [];
              let attendedCount = 0;

              // Find all groups THIS teacher teaches THIS student
              const studentGroupsForTeacher = groups.filter(g => 
                 // We need to know if the student is in 'g'. We'll fetch links if we don't have them.
                 // Actually we can just fetch all student groups for this student and intersect with teacher's groups.
                 true // We'll filter later based on all groups
              );
              
              const userGroupsRes = await apiClient.get(`/users/${link.studentId}/groups`);
              const allUserGroups = userGroupsRes.data;
              const teacherGroupIds = groups.map(g => g.id);
              const relevantGroups = allUserGroups.filter((g: any) => teacherGroupIds.includes(g.id));
              const relevantCourseIds = relevantGroups.map((g: any) => g.courseId);
              
              const firstGroup = relevantGroups[0] || group;
              const cRes = courses.find((c: { id: number }) => c.id === firstGroup.courseId);

              try {
                const subsRes = await apiClient.get(`/homeworks/submissions/student/${link.studentId}`);
                let submissions = subsRes.data;

                let hwListRaw = submissions.map((s: any) => {
                  const hw = allHomeworks.find((h: { id: number }) => h.id === s.homeworkId);
                  let lessonTitle = 'Неизвестный урок';
                  let moduleTitle = 'Неизвестный модуль';
                  let hwCourseTitle = 'Неизвестный курс';
                  let lessonOrder = 0;
                  let hwCourseId = 0;

                  if (hw) {
                    const lesson = allLessons.find((l: { id: number }) => l.id === hw.lessonId);
                    if (lesson) {
                      lessonTitle = lesson.title;
                      lessonOrder = lesson.orderNumber;
                      const mod = allModulesList.find((m: { id: number }) => m.id === lesson.moduleId);
                      if (mod) {
                        moduleTitle = mod.title;
                        hwCourseId = mod.courseId;
                        const c = courses.find((c: { id: number }) => c.id === mod.courseId);
                        if (c) hwCourseTitle = c.title;
                      }
                    }
                  }

                  return {
                    id: s.id,
                    status: s.status,
                    score: s.score,
                    submittedAt: s.submittedAt,
                    courseId: hwCourseId,
                    courseTitle: hwCourseTitle,
                    moduleTitle: moduleTitle,
                    lessonTitle: lessonTitle,
                    lessonOrder: lessonOrder
                  };
                });

                // Filter to only include submissions for courses the teacher teaches this student
                hwList = hwListRaw.filter((hw: any) => relevantCourseIds.includes(hw.courseId)).sort((a: { submittedAt: string | Date }, b: { submittedAt: string | Date }) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                
                totalHw = hwList.length;
                acceptedHw = hwList.filter((s: { status: string }) => s.status === 'accepted').length;
                hwList.forEach((s: { score: number | null }) => {
                  if (s.score) scoreSum += s.score;
                });

              } catch {}

              try {
                const attRes = await apiClient.get(`/sessions/attendance/student/${link.studentId}`);
                
                const relevantSessions = allSessions.filter(s => relevantGroups.some((rg: any) => rg.id === s.groupId));
                const relevantPastSessions = relevantSessions.filter(s => new Date(s.scheduledAt) < now);
                
                const groupAttendances = attRes.data.filter((a: any) => relevantSessions.some(s => s.id === a.sessionId));
                attendedCount = groupAttendances.filter((a: { isPresent: boolean }) => a.isPresent).length;

                attendanceList = groupAttendances.map((a: { id: number; isPresent: boolean; sessionId: number }) => {
                  const session = relevantSessions.find(s => s.id === a.sessionId);
                  let lessonTitle = 'Неизвестный урок';
                  let moduleTitle = 'Неизвестный модуль';
                  let hwCourseTitle = 'Неизвестный курс';
                  let lessonOrder = 0;

                  if (session) {
                    const lesson = allLessons.find((l: { id: number; moduleId: number; title: string; orderNumber: number }) => l.id === session.lessonId);
                    if (lesson) {
                      lessonTitle = lesson.title;
                      lessonOrder = lesson.orderNumber;
                      const mod = allModulesList.find((m: { id: number; courseId: number; title: string }) => m.id === lesson.moduleId);
                      if (mod) {
                        moduleTitle = mod.title;
                        const c = courses.find((c: { id: number; title: string }) => c.id === mod.courseId);
                        if (c) hwCourseTitle = c.title;
                      }
                    }
                  }

                  return {
                    id: a.id,
                    isPresent: a.isPresent,
                    sessionDate: session ? session.scheduledAt : new Date(),
                    courseTitle: hwCourseTitle,
                    moduleTitle: moduleTitle,
                    lessonTitle: lessonTitle,
                    lessonOrder: lessonOrder
                  };
                }).sort((a: StudentAttendance, b: StudentAttendance) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
                
                pastGroupSessions.length = relevantPastSessions.length; // Override for stats
              } catch {}

              allStudentsMap.set(link.studentId, {
                id: link.studentId,
                fullName: userData.fullName || '',
                studentName: userData.studentName || `Ученик #${link.studentId}`,
                email: userData.email,
                phone: userData.phone || '',
                groupId: firstGroup.id,
                groupName: relevantGroups.map((g: any) => g.name).join(', '),
                groupType: firstGroup.type,
                courseId: firstGroup.courseId,
                courseName: relevantGroups.map((g: any) => courses.find((c: any) => c.id === g.courseId)?.title).join(', '),
                teacherNote: link.teacherNote || '',
                homeworkStats: {
                  total: totalHw,
                  accepted: acceptedHw,
                  averageScore: totalHw > 0 ? Math.round(scoreSum / totalHw) : 0
                },
                attendanceStats: {
                  pastSessions: pastGroupSessions.length,
                  attended: attendedCount
                },
                homeworkList: hwList,
                attendanceList: attendanceList
              });
            }
          }
        }

        setStudents(Array.from(allStudentsMap.values()));
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить список учеников');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchStudents();
    }, [user, viewMode]);

  const handleSelectStudent = (student: EnrichedStudent) => {
    setSelectedStudent(student);
    setNote(student.teacherNote);
  };

  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    setIsSavingNote(true);
    try {
      await apiClient.patch(`/groups/${selectedStudent.groupId}/students/${selectedStudent.id}/note`, { note });
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, teacherNote: note } : s));
      setSelectedStudent({ ...selectedStudent, teacherNote: note });
      alert('Заметка сохранена');
    } catch {
      alert('Ошибка при сохранении заметки');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex-shrink-0">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Мои ученики</h1>
        <p className="text-gray-400 relative z-10">Статистика, успеваемость и заметки по каждому ученику</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        
        {/* Левая колонка: Список учеников */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div className="flex gap-2 mb-2 border-b border-gray-200 pb-2">
              <button 
                onClick={() => setViewMode('my')} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'my' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Мои ученики
              </button>
              <button 
                onClick={() => setViewMode('pool')} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'pool' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Свободный пул
              </button>
            </div>
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Users size={18} className="text-indigo-500" />
              {viewMode === 'my' ? `Список (${filteredStudents.length})` : `Пул свободных (${filteredPool.length})`}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск учеников..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {viewMode === 'my' ? (
              <>
                {filteredStudents.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">Учеников не найдено.</div>
                ) : (
                  filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => handleSelectStudent(student)}
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
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ml-2">
                          {student.groupType === 'group' ? 'Группа' : 'Инд.'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400"/> {student.phone || 'Нет телефона'}</div>
                        <div className="flex items-center gap-1"><Mail size={12} className="text-gray-400"/> {student.email}</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 truncate max-w-full">
                          {student.groupName}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {filteredPool.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">Свободных учеников нет.</div>
                ) : (
                  filteredPool.map((poolItem) => (
                    <div 
                      key={`${poolItem.student.id}-${poolItem.course.id}`} 
                      className="p-4 rounded-xl border bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50 transition-all flex flex-col gap-3"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {poolItem.student.studentName || poolItem.student.fullName || 'Без имени'}
                        </h3>
                        <p className="text-xs font-semibold text-green-600 mt-1">{poolItem.course.title}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.post(`/groups/teacher/${user?.id}/claim`, {
                              studentId: poolItem.student.id,
                              courseId: poolItem.course.id
                            });
                            // Refresh
                            setViewMode('my');
                          } catch (err) {
                            alert('Ошибка при взятии ученика');
                          }
                        }}
                        className="w-full py-2 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        Взять ученика
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Правая колонка: Детали */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto flex flex-col relative">
          {viewMode === 'pool' ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
               <Users size={64} className="text-gray-300 mb-4" />
               <p className="text-lg font-medium text-gray-600">Пул свободных учеников</p>
               <p className="text-sm mt-1 max-w-md">Здесь отображаются ученики, которые приобрели курс, но еще не прикреплены к преподавателю. Нажмите "Взять ученика" в списке слева, чтобы забрать его к себе на индивидуальное обучение.</p>
             </div>
          ) : !selectedStudent ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <User size={64} className="text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-600">Выберите ученика из списка</p>
              <p className="text-sm mt-1">Здесь появится подробная информация о его успеваемости, домашних заданиях и ваша личная заметка.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex flex-col min-h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                    {(selectedStudent.studentName || selectedStudent.fullName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedStudent.studentName || selectedStudent.fullName}</h2>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {selectedStudent.groupName}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {selectedStudent.courseName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs and Content */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                  <button 
                    onClick={() => setActiveTab('hw')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'hw' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    История ДЗ
                  </button>
                  <button 
                    onClick={() => setActiveTab('attendance')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Вся посещаемость
                  </button>
                  <button 
                    onClick={() => setActiveTab(null)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === null ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Заметка преподавателя
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {activeTab === null && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">Личная заметка об ученике</label>
                        <span className="text-xs text-gray-400">Видна только вам</span>
                      </div>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Например: Отлично справляется с React, но нужно подтянуть CSS Flexbox..."
                        className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveNote}
                          disabled={isSavingNote}
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition disabled:opacity-50 shadow-sm"
                        >
                          {isSavingNote ? 'Сохранение...' : <><Save size={16} /> Сохранить</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hw' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="space-y-3">
                        {selectedStudent.homeworkList.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Нет сданных работ
                          </div>
                        ) : (
                          selectedStudent.homeworkList.map(sub => (
                            <div key={sub.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{sub.courseTitle}</p>
                                  <span className="text-gray-300">•</span>
                                  <p className="text-xs font-medium text-gray-500">{sub.moduleTitle}</p>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">{sub.lessonTitle}</h4>
                                <p className="text-xs font-medium text-gray-400">{new Date(sub.submittedAt).toLocaleDateString('ru-RU')} {new Date(sub.submittedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="text-right ml-4">
                                {sub.status === 'accepted' ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md mb-1">Принято</span>
                                    <span className="font-black text-lg text-green-600">{sub.score} <span className="text-xs font-medium text-green-600/70">баллов</span></span>
                                  </div>
                                ) : sub.status === 'rejected' ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md mb-1">Отклонено</span>
                                    <span className="font-bold text-sm text-red-500">Доработка</span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">На проверке</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="space-y-3">
                        {selectedStudent.attendanceList.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Нет записей о посещаемости
                          </div>
                        ) : (
                          selectedStudent.attendanceList.map(att => (
                            <div key={att.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{att.courseTitle}</p>
                                  <span className="text-gray-300">•</span>
                                  <p className="text-xs font-medium text-gray-500">{att.moduleTitle}</p>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">{att.lessonTitle}</h4>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs font-medium text-gray-400">{new Date(att.sessionDate).toLocaleDateString('ru-RU')} {new Date(att.sessionDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                                  {att.isPresent ? (
                                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Присутствовал</span>
                                  ) : (
                                    <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">Отсутствовал</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
