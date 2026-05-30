'use client';

import { Calendar as CalendarIcon, Clock, Video, FileText, X, ChevronLeft, ChevronRight, LayoutGrid, List, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { LessonSession, sessionService } from '@/lib/services/session.service';
import { useAuthStore } from '@/store/authStore';
import { lessonService } from '@/lib/services/lesson.service';
import { courseService } from '@/lib/services/course.service';
import { groupService } from '@/lib/services/group.service';
import { moduleService } from '@/lib/services/module.service';
import { apiClient } from '@/lib/api';

interface EnrichedSession extends LessonSession {
  lessonTitle?: string;
  courseTitle?: string;
  moduleTitle?: string;
  teacherName?: string;
  groupName?: string;
  groupType?: string;
  status: 'starting_soon' | 'in_progress' | 'scheduled' | 'past';
  formattedDate: string;
  formattedTime: string;
  dateObj: Date;
}

interface StudentInfo {
  id: number;
  fullName: string;
  studentName: string;
  isPresent: boolean;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
};

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

import { useScheduleStore } from '@/store/scheduleStore';

export default function SchedulePage() {
  const { user } = useAuthStore();
  const { selectedDateStr, viewMode, setSelectedDateStr, setViewMode } = useScheduleStore();
  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived dates from Zustand store
  const selectedDate = new Date(selectedDateStr);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date(selectedDateStr));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const calendarRef = useRef<HTMLDivElement>(null);

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [journalStudents, setJournalStudents] = useState<StudentInfo[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<EnrichedSession | null>(null);
  const [sessionFormData, setSessionFormData] = useState({
    scheduledAt: '',
    durationMin: 60,
    meetingLink: '',
    lessonId: 0,
    groupId: 0,
    teacherId: 0
  });
  const [lessonsList, setLessonsList] = useState<{id: number, title: string, moduleId: number}[]>([]);
  const [groupsList, setGroupsList] = useState<{id: number, name: string, type: 'group' | 'individual', teacherId?: number | null}[]>([]);
  const [coursesList, setCoursesList] = useState<{id: number, title: string}[]>([]);
  const [modulesList, setModulesList] = useState<{id: number, title: string, courseId: number}[]>([]);
  const [teachersList, setTeachersList] = useState<{id: number, fullName: string, email: string, studentName?: string}[]>([]);

  const [sessionType, setSessionType] = useState<'group' | 'individual'>('group');
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedModuleId, setSelectedModuleId] = useState<number | ''>('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSchedule = async () => {
    if (!user) return;
    try {
      const allLessonsData = await lessonService.getAll();
      setLessonsList(allLessonsData);

      const courses = await courseService.getAll();
      setCoursesList(courses);
      
      const modules = await moduleService.getAll();
      setModulesList(modules);

      let fetchedGroups: {id: number, name: string, type: 'group' | 'individual', teacherId?: number | null}[] = [];
      if (user.role === 'teacher') {
        fetchedGroups = await groupService.getGroupsByTeacherId(user.id);
      } else if (user.role === 'user') {
        const userGroupsRes = await apiClient.get(`/users/${user.id}/groups`);
        fetchedGroups = userGroupsRes.data;
      } else {
        fetchedGroups = await groupService.getAll();
        const usersRes = await apiClient.get('/users');
        setTeachersList(usersRes.data.filter((u: any) => u.role === 'teacher'));
      }
      setGroupsList(fetchedGroups);

      const allSessions = await sessionService.getAll();
      let mySessions = [];

      if (user.role === 'teacher') {
        mySessions = allSessions.filter(s => s.teacherId === user.id);
      } else if (user.role === 'user') {
        const myGroupIds = fetchedGroups.map(g => g.id);
        mySessions = allSessions.filter(s => myGroupIds.includes(s.groupId));
      } else {
        mySessions = allSessions;
      }

      const enriched = await Promise.all(
        mySessions.map(async (s) => {
          let lessonTitle = 'Неизвестный урок';
          let moduleTitle = 'Неизвестный модуль';
          let courseTitle = 'Неизвестный курс';
          let groupType = 'group';
          let groupName = 'Неизвестная группа';
          
          const lesson = allLessonsData.find((l: {id: number, title: string, moduleId: number}) => l.id === s.lessonId);
          if (lesson) {
            lessonTitle = lesson.title;
            const mod = modules.find((m: {id: number, title: string, courseId: number}) => m.id === lesson.moduleId);
            if (mod) {
              moduleTitle = mod.title;
              const course = courses.find((c: {id: number, title: string}) => c.id === mod.courseId);
              if (course) courseTitle = course.title;
            }
          }

          const group = fetchedGroups.find(g => g.id === s.groupId);
          if (group) {
            groupType = group.type;
            groupName = group.name;
          }

          let teacherName = 'Преподаватель';
          try {
             const teacherRes = await apiClient.get(`/users/${s.teacherId}`);
             teacherName = teacherRes.data.fullName || teacherRes.data.email;
          } catch {}

          const sessionDate = new Date(s.scheduledAt);
          const sessionEnd = new Date(sessionDate.getTime() + s.durationMin * 60000);
          const now = new Date();
          let status: 'starting_soon' | 'in_progress' | 'scheduled' | 'past' = 'scheduled';
          
          if (now.getTime() >= sessionDate.getTime() && now.getTime() <= sessionEnd.getTime()) {
            status = 'in_progress';
          } else if (now.getTime() < sessionDate.getTime() && sessionDate.getTime() - now.getTime() <= 15 * 60000) {
            status = 'starting_soon';
          } else if (now.getTime() > sessionEnd.getTime()) {
            status = 'past';
          }

          return {
            ...s,
            lessonTitle: lessonTitle,
            courseTitle,
            moduleTitle,
            teacherName,
            groupType,
            groupName,
            status,
            dateObj: sessionDate,
            formattedDate: sessionDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }),
            formattedTime: sessionDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + 
                           ' - ' + 
                           new Date(sessionDate.getTime() + s.durationMin * 60000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          };
        })
      );

      const sortedSessions = enriched.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
      setSessions(sortedSessions);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const openJournal = async (sessionId: number, groupId: number) => {
    setSelectedSessionId(sessionId);
    setIsJournalOpen(true);
    setJournalLoading(true);

    try {
      const studentLinksRes = await apiClient.get(`/groups/${groupId}/students`);
      const studentLinks = studentLinksRes.data;

      let existingAttendances: { studentId: number; isPresent: boolean }[] = [];
      try {
        const attendanceRes = await apiClient.get(`/sessions/${sessionId}/attendance`);
        existingAttendances = attendanceRes.data;
      } catch {}

      const studentsData = await Promise.all(
        studentLinks.map(async (link: { studentId: number }) => {
          const userRes = await apiClient.get(`/users/${link.studentId}`);
          const attendanceRecord = existingAttendances.find(a => a.studentId === link.studentId);
          return {
            id: userRes.data.id,
            fullName: userRes.data.fullName || '',
            studentName: userRes.data.studentName || `Ученик #${userRes.data.id}`,
            isPresent: attendanceRecord ? attendanceRecord.isPresent : false
          };
        })
      );
      setJournalStudents(studentsData);
    } catch {
      alert('Ошибка при загрузке журнала');
      setIsJournalOpen(false);
    } finally {
      setJournalLoading(false);
    }
  };

  const toggleAttendance = async (studentId: number, currentStatus: boolean) => {
    if (!selectedSessionId) return;
    setJournalStudents(prev => prev.map(s => s.id === studentId ? { ...s, isPresent: !currentStatus } : s));
    try {
      await apiClient.post(`/sessions/${selectedSessionId}/attendance`, { studentId, isPresent: !currentStatus });
    } catch {
      setJournalStudents(prev => prev.map(s => s.id === studentId ? { ...s, isPresent: currentStatus } : s));
      alert('Не удалось сохранить посещаемость');
    }
  };

  const handleNewSession = () => {
    setEditingSession(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    setSessionType('group');
    setSelectedCourseId('');
    setSelectedModuleId('');
    
    setSessionFormData({
      scheduledAt: now.toISOString().slice(0, 16),
      durationMin: 60,
      meetingLink: '',
      lessonId: 0,
      groupId: 0,
      teacherId: user?.role === 'teacher' ? user.id : 0
    });
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session: EnrichedSession) => {
    setEditingSession(session);
    const d = new Date(session.scheduledAt);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    
    const lesson = lessonsList.find(l => l.id === session.lessonId);
    if (lesson) {
      const mod = modulesList.find(m => m.id === lesson.moduleId);
      if (mod) {
        setSelectedModuleId(mod.id);
        setSelectedCourseId(mod.courseId);
      }
    }
    const group = groupsList.find(g => g.id === session.groupId);
    if (group) {
      setSessionType(group.type);
    } else {
      setSessionType('group');
    }

    setSessionFormData({
      scheduledAt: d.toISOString().slice(0, 16),
      durationMin: session.durationMin,
      meetingLink: session.meetingLink || '',
      lessonId: session.lessonId,
      groupId: session.groupId,
      teacherId: session.teacherId || 0
    });
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async () => {
    if (!user) return;

    if (user.role === 'manager' && (!sessionFormData.teacherId || sessionFormData.teacherId === 0)) {
      alert('Пожалуйста, выберите преподавателя.');
      return;
    }
    
    if (!sessionFormData.groupId || sessionFormData.groupId === 0) {
      alert('Пожалуйста, выберите группу или ученика.');
      return;
    }
    
    if (!sessionFormData.lessonId || sessionFormData.lessonId === 0) {
      alert('Пожалуйста, выберите тему урока.');
      return;
    }

    try {
      const dataToSave = {
        ...sessionFormData,
        lessonId: Number(sessionFormData.lessonId),
        groupId: Number(sessionFormData.groupId),
        durationMin: Number(sessionFormData.durationMin),
        teacherId: user.role === 'manager' || user.role === 'admin' ? Number(sessionFormData.teacherId) : user.id,
        scheduledAt: new Date(sessionFormData.scheduledAt).toISOString()
      };

      if (editingSession) {
        await sessionService.update(editingSession.id, dataToSave);
      } else {
        await sessionService.create(dataToSave);
      }
      setIsSessionModalOpen(false);
      fetchSchedule();
    } catch (err) {
      console.error("Save Session Error:", err);
      alert('Ошибка при сохранении занятия');
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить это занятие?')) {
      try {
        await sessionService.delete(id);
        fetchSchedule();
      } catch {
        alert('Ошибка при удалении занятия');
      }
    }
  };

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 1));
    setSelectedDateStr(newDate.toISOString());
    setCalendarViewDate(new Date(newDate));
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 1));
    setSelectedDateStr(newDate.toISOString());
    setCalendarViewDate(new Date(newDate));
  };

  const formatHeaderDate = (d: Date) => {
    if (viewMode === 'day') {
      const weekday = d.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase();
      const dateStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
      return `${weekday} ${dateStr}`;
    } else {
      const start = new Date(d);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      return `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
  };

  const daysInMonth = getDaysInMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth());
  const firstDay = getFirstDayOfMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth());
  
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCalendarViewDate(newDate);
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDate = new Date(calendarViewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCalendarViewDate(newDate);
  };

  const selectDateFromCalendar = (day: number) => {
    const newDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
    setSelectedDateStr(newDate.toISOString());
    setIsCalendarOpen(false);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  // Получаем уникальные даты сессий для отображения точек на календаре
  const sessionDatesSet = new Set(sessions.map(s => s.dateObj.toDateString()));

  // Расчет данных для недели
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const currentWeekDates = getWeekDates(selectedDate);
  
  const filteredSessions = viewMode === 'day' 
    ? sessions.filter(s => isSameDay(s.dateObj, selectedDate))
    : sessions.filter(s => {
        const start = currentWeekDates[0];
        const end = new Date(currentWeekDates[6]);
        end.setHours(23,59,59,999);
        return s.dateObj >= start && s.dateObj <= end;
      });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Расписание занятий</h1>
          <p className="text-gray-500">Ваши предстоящие онлайн-уроки с преподавателями.</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm ring-1 ring-gray-200">
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'day' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={16} />
            День
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === 'week' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} />
            Неделя
          </button>
        </div>
      </div>

      {/* Custom Date Navigator */}
      <div className="bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button onClick={handlePrev} className="p-2 text-blue-800 hover:bg-blue-50 rounded-full transition">
            <ChevronLeft size={24} />
          </button>
          
          <div className="relative mx-4" ref={calendarRef}>
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="font-bold text-lg text-blue-600 hover:text-blue-800 transition px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              {formatHeaderDate(selectedDate)}
            </button>

            {/* Popover Calendar */}
            {isCalendarOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 p-4 z-50 w-72">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="font-semibold text-gray-800 capitalize">
                    {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                  </div>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateOfCell = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
                    const isSelected = isSameDay(dateOfCell, selectedDate);
                    const hasSession = sessionDatesSet.has(dateOfCell.toDateString());
                    
                    return (
                      <button
                        key={day}
                        onClick={() => selectDateFromCalendar(day)}
                        className={`
                          relative h-8 w-8 rounded-md flex items-center justify-center text-sm font-medium transition
                          ${isSelected ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'}
                        `}
                      >
                        {day}
                        {hasSession && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400"></span>
                        )}
                        {hasSession && isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleNext} className="p-2 text-blue-800 hover:bg-blue-50 rounded-full transition">
            <ChevronRight size={24} />
          </button>
        </div>

        {user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'manager' ? (
          <button onClick={handleNewSession} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition">
            <span className="text-xl leading-none">+</span> Новое занятие
          </button>
        ) : null}
      </div>

      {viewMode === 'day' ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Нет занятий</h3>
              <p className="mt-1 text-sm text-gray-500">На этот день у вас не запланировано уроков.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSessions.map((item) => (
                <div key={item.id} className={`p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-colors ${item.status === 'past' ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}`}>
                  {/* Date & Time Block */}
                  <div className={`flex-shrink-0 w-full md:w-48 flex flex-col justify-center border-l-4 pl-4 ${(item.status === 'in_progress' || item.status === 'starting_soon') ? 'border-blue-500' : item.status === 'past' ? 'border-gray-300' : 'border-indigo-400'}`}>
                    <div className="font-bold text-gray-900 capitalize">{item.formattedDate}</div>
                    <div className={`flex items-center gap-1.5 mt-1 ${item.status === 'past' ? 'text-gray-500' : 'text-blue-600'}`}>
                      <Clock size={16} />
                      <span className="font-semibold">{item.formattedTime}</span>
                    </div>
                  </div>

                  {/* Info Block */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {item.courseTitle}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                        {item.moduleTitle}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {item.groupName}
                      </span>
                      {item.status === 'past' && (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Завершено
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold ${item.status === 'past' ? 'text-gray-600' : 'text-gray-900'}`}>{item.lessonTitle}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                      <Video size={16} className="text-gray-400" />
                      <span>Преподаватель: {item.teacherName}</span>
                    </div>
                  </div>

                  {/* Action Block */}
                  <div className="w-full md:w-auto flex-shrink-0 flex flex-col gap-2">
                    {item.status === 'in_progress' ? (
                      <a 
                        href={item.meetingLink || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
                      >
                        <Video size={18} />
                        Подключиться к уроку
                      </a>
                    ) : item.status === 'starting_soon' ? (
                      <button 
                        disabled
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-100 px-6 py-3 text-sm font-semibold text-amber-700 cursor-not-allowed"
                      >
                        Скоро начнется
                      </button>
                    ) : item.status === 'past' ? (
                      <button 
                        disabled
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
                      >
                        Завершено
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-400 cursor-not-allowed"
                      >
                        Кнопка появится за 15 минут
                      </button>
                    )}

                    {/* Кнопка журнала для преподавателя */}
                    {user?.role === 'teacher' && (
                      <button 
                        onClick={() => openJournal(item.id, item.groupId)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                      >
                        <FileText size={16} />
                        Журнал посещаемости
                      </button>
                    )}
                    {(user?.role === 'teacher' || user?.role === 'manager' || user?.role === 'admin') && (
                      <div className="flex items-center gap-2 mt-2 w-full justify-end">
                        <button onClick={() => handleEditSession(item)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Редактировать">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteSession(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Удалить">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {currentWeekDates.map((date, idx) => {
            const daySessions = filteredSessions.filter(s => isSameDay(s.dateObj, date));
            const isToday = isSameDay(date, new Date());
            
            return (
              <div key={idx} className={`flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                <div className={`p-3 text-center border-b border-gray-100 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold uppercase ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{weekDays[idx]}</p>
                  <p className={`text-lg font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>{date.getDate()}</p>
                </div>
                <div className="flex-1 p-2 space-y-2 min-h-[150px]">
                  {daySessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-4">
                      <span className="text-xs">Нет занятий</span>
                    </div>
                  ) : (
                    daySessions.map(session => (
                      <div key={session.id} className={`p-3 rounded-xl border text-left hover:shadow-sm transition cursor-pointer ${
                        session.status === 'in_progress' ? 'bg-blue-50 border-blue-200' : 
                        session.status === 'starting_soon' ? 'bg-amber-50 border-amber-200' :
                        session.status === 'past' ? 'bg-gray-50 border-gray-200 opacity-75' :
                        'bg-indigo-50 border-indigo-100'
                      }`}>
                        <div className={`text-xs font-bold mb-1 flex justify-between ${session.status === 'starting_soon' ? 'text-amber-700' : session.status === 'past' ? 'text-gray-500' : 'text-indigo-700'}`}>
                          <span>{session.formattedTime.split(' - ')[0]}</span>
                          <span className="truncate ml-2 font-medium opacity-75" title={session.groupName}>
                            {session.groupType === 'group' ? session.groupName : session.groupName}
                          </span>
                        </div>
                        <div className={`text-xs font-medium line-clamp-2 leading-tight mb-2 ${session.status === 'past' ? 'text-gray-500' : 'text-gray-800'}`}>{session.lessonTitle}</div>
                        {user?.role === 'teacher' && (
                          <button 
                            onClick={() => openJournal(session.id, session.groupId)}
                            className="w-full py-1.5 mt-1 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-50"
                          >
                            Журнал
                          </button>
                        )}
                        {(user?.role === 'teacher' || user?.role === 'manager' || user?.role === 'admin') && (
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <button onClick={(e) => { e.stopPropagation(); handleEditSession(session); }} className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="p-1 text-gray-400 hover:text-red-600 rounded">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно Журнала */}
      {isJournalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Журнал занятия</h2>
              </div>
              <button 
                onClick={() => setIsJournalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {journalLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : journalStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">В группе нет учеников.</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">Отметьте присутствующих на онлайн-занятии. Данные сохраняются автоматически.</p>
                  {journalStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleAttendance(student.id, student.isPresent)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                      </div>
                      
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${student.isPresent ? 'bg-indigo-600' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${student.isPresent ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsJournalOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно Создания/Редактирования занятия */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{editingSession ? 'Редактировать занятие' : 'Новое занятие'}</h2>
              <button 
                onClick={() => setIsSessionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {user?.role === 'manager' && (
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Преподаватель</label>
                  <select
                    value={sessionFormData.teacherId}
                    onChange={(e) => {
                      setSessionFormData({...sessionFormData, teacherId: Number(e.target.value), groupId: 0});
                    }}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value={0} disabled>Выберите преподавателя</option>
                    {teachersList.map(t => <option key={t.id} value={t.id}>{t.fullName || t.email}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-6 mb-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={sessionType === 'group'} onChange={() => {
                    setSessionType('group');
                    setSessionFormData({...sessionFormData, groupId: 0});
                  }} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Групповое</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={sessionType === 'individual'} onChange={() => {
                    setSessionType('individual');
                    setSessionFormData({...sessionFormData, groupId: 0});
                  }} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Индивидуальное</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{sessionType === 'group' ? 'Группа' : 'Ученик (Индивидуально)'}</label>
                <select
                  value={sessionFormData.groupId}
                  onChange={(e) => setSessionFormData({...sessionFormData, groupId: Number(e.target.value)})}
                  disabled={user?.role === 'manager' && !sessionFormData.teacherId}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value={0} disabled>Выберите {sessionType === 'group' ? 'группу' : 'ученика'}</option>
                  {groupsList.filter(g => g.type === sessionType && (user?.role === 'manager' ? g.teacherId === sessionFormData.teacherId : true)).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Курс</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(Number(e.target.value));
                    setSelectedModuleId('');
                    setSessionFormData({...sessionFormData, lessonId: 0});
                  }}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="" disabled>Выберите курс</option>
                  {coursesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Модуль</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(Number(e.target.value));
                    setSessionFormData({...sessionFormData, lessonId: 0});
                  }}
                  disabled={!selectedCourseId}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="" disabled>Выберите модуль</option>
                  {modulesList.filter(m => m.courseId === selectedCourseId).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тема урока</label>
                <select
                  value={sessionFormData.lessonId}
                  onChange={(e) => setSessionFormData({...sessionFormData, lessonId: Number(e.target.value)})}
                  disabled={!selectedModuleId}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value={0} disabled>Выберите тему урока</option>
                  {lessonsList.filter(l => l.moduleId === selectedModuleId).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата и время</label>
                <input
                  type="datetime-local"
                  value={sessionFormData.scheduledAt}
                  onChange={(e) => setSessionFormData({...sessionFormData, scheduledAt: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Длительность (мин)</label>
                <input
                  type="number"
                  value={sessionFormData.durationMin}
                  onChange={(e) => setSessionFormData({...sessionFormData, durationMin: Number(e.target.value)})}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на встречу (опционально)</label>
                <input
                  type="text"
                  value={sessionFormData.meetingLink}
                  onChange={(e) => setSessionFormData({...sessionFormData, meetingLink: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsSessionModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Отмена
              </button>
              <button 
                onClick={handleSaveSession}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}