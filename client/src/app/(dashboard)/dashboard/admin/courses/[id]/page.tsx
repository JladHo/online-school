'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit2, Trash2, X, ListTree, FileText, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCourseStructurePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Inline Lesson Edit State
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({ 
    title: '', description: '', content: '', orderNumber: 1, moduleId: 0, 
    homeworkDescription: '', homeworkId: null as number | null 
  });
  const [blocks, setBlocks] = useState<{id: string, type: 'text'|'image'|'video', value: string}[]>([]);

  // Homeworks List
  const [homeworks, setHomeworks] = useState<any[]>([]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseId = parseInt(params.id, 10);
      
      const [courseRes, modulesRes, lessonsRes, homeworksRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}`),
        apiClient.get('/modules'),
        apiClient.get('/lessons'),
        apiClient.get('/homeworks')
      ]);

      setCourse(courseRes.data);
      setHomeworks(homeworksRes.data);
      
      const courseModules = modulesRes.data.filter((m: any) => m.courseId === courseId);
      setModules(courseModules);
      
      const moduleIds = courseModules.map((m: any) => m.id);
      setLessons(lessonsRes.data.filter((l: any) => moduleIds.includes(l.moduleId)));
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке структуры курса');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [params.id]);

  // --- Module Handlers ---
  const handleOpenModuleModal = (module?: any) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description || '' });
    } else {
      setEditingModule(null);
      setModuleForm({ title: '', description: '' });
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async () => {
    try {
      if (editingModule) {
        await apiClient.patch(`/modules/${editingModule.id}`, moduleForm);
      } else {
        await apiClient.post('/modules', { ...moduleForm, courseId: parseInt(params.id, 10) });
      }
      setIsModuleModalOpen(false);
      fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка сохранения модуля');
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (confirm('Удаление модуля приведет к каскадному удалению ВСЕХ уроков в нем! Вы уверены?')) {
      try {
        await apiClient.delete(`/modules/${id}`);
        fetchCourseData();
      } catch {
        alert('Ошибка удаления модуля');
      }
    }
  };

  // --- Lesson Handlers ---
  const handleOpenLessonModal = (moduleId: number, lesson?: any) => {
    const hw = lesson ? homeworks.find(h => h.lessonId === lesson.id) : undefined;
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ 
        title: lesson.title, 
        description: lesson.description || '',
        content: lesson.content || '',
        orderNumber: lesson.orderNumber,
        moduleId: lesson.moduleId,
        homeworkDescription: hw ? hw.description : '',
        homeworkId: hw ? hw.id : null
      });

      let initialBlocks = [];
      try {
        const parsed = JSON.parse(lesson.content || '[]');
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
          initialBlocks = parsed;
        } else {
          throw new Error('Not blocks');
        }
      } catch {
        initialBlocks = lesson.content ? [{ id: Date.now().toString(), type: 'text', value: lesson.content }] : [];
      }
      if (initialBlocks.length === 0) {
        initialBlocks = [{ id: Date.now().toString(), type: 'text', value: '' }];
      }
      setBlocks(initialBlocks);

    } else {
      setEditingLesson(null);
      // Auto-increment order number
      const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
      const nextOrder = moduleLessons.length > 0 ? Math.max(...moduleLessons.map(l => l.orderNumber)) + 1 : 1;
      
      setLessonForm({ 
        title: '', 
        description: '',
        content: '',
        orderNumber: nextOrder,
        moduleId: moduleId,
        homeworkDescription: '',
        homeworkId: null
      });
      setBlocks([{ id: Date.now().toString(), type: 'text', value: '' }]);
    }
    setIsEditingLesson(true);
  };

  const handleSaveLesson = async () => {
    try {
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description,
        moduleId: lessonForm.moduleId,
        content: JSON.stringify(blocks),
        orderNumber: Number(lessonForm.orderNumber)
      };

      let savedLessonId;
      if (editingLesson) {
        const res = await apiClient.patch(`/lessons/${editingLesson.id}`, payload);
        savedLessonId = res.data.id;
      } else {
        const res = await apiClient.post('/lessons', payload);
        savedLessonId = res.data.id;
      }

      // Handle Homework
      if (lessonForm.homeworkDescription.trim()) {
        if (lessonForm.homeworkId) {
          await apiClient.patch(`/homeworks/${lessonForm.homeworkId}`, { description: lessonForm.homeworkDescription });
        } else {
          await apiClient.post('/homeworks', { description: lessonForm.homeworkDescription, lessonId: savedLessonId });
        }
      } else if (lessonForm.homeworkId) {
         await apiClient.delete(`/homeworks/${lessonForm.homeworkId}`);
      }

      setIsEditingLesson(false);
      fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка сохранения урока');
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот урок?')) {
      try {
        await apiClient.delete(`/lessons/${id}`);
        fetchCourseData();
      } catch {
        alert('Ошибка удаления урока');
      }
    }
  };

  const handleInsertImage = () => {
    // legacy
  };

  const addBlock = (type: 'text'|'image'|'video') => {
    setBlocks([...blocks, { id: Date.now().toString(), type, value: '' }]);
  };

  const updateBlock = (id: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, value } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up'|'down') => {
    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    }
    setBlocks(newBlocks);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Editing Lesson Inline View */}
      {isEditingLesson ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <div>
              <button onClick={() => setIsEditingLesson(false)} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-2 transition">
                <ChevronLeft size={16} className="mr-1" /> Назад к структуре
              </button>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-indigo-500" />
                {editingLesson ? 'Редактировать урок' : 'Новый урок'}
              </h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4 flex flex-col grow">
            <div className="grid grid-cols-4 gap-4 shrink-0">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Название урока</label>
                <input type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядковый номер</label>
                <input type="number" min="1" value={lessonForm.orderNumber} onChange={e => setLessonForm({...lessonForm, orderNumber: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div className="flex flex-col grow min-h-[400px]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <label className="block text-sm font-medium text-gray-700">Контент урока (Блоки)</label>
              </div>
              
              <div className="space-y-4 mb-6">
                {blocks.map((block, index) => (
                  <div key={block.id} className="relative group border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:border-indigo-300 transition-colors">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"><span className="text-[10px]">▲</span></button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 shadow-sm"><span className="text-[10px]">▼</span></button>
                    </div>
                    
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
                          {block.type === 'text' && <FileText size={14} />}
                          {block.type === 'image' && <ImageIcon size={14} />}
                          {block.type === 'video' && <FileText size={14} />}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {block.type === 'text' && 'Текст'}
                          {block.type === 'image' && 'Изображение'}
                          {block.type === 'video' && 'Видео (YouTube)'}
                        </span>
                      </div>
                      <button onClick={() => removeBlock(block.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>

                    {block.type === 'text' && (
                      <textarea
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed resize-y min-h-[100px]"
                        placeholder="Напишите текст..."
                      />
                    )}
                    {block.type === 'image' && (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <input
                            type="text"
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            className="flex-1 bg-white border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Вставьте ссылку (URL) на картинку..."
                          />
                          <span className="text-sm font-medium text-gray-400 text-center sm:text-left">ИЛИ</span>
                          <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg text-sm font-semibold transition border border-indigo-200 whitespace-nowrap text-center">
                            Загрузить файл
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const file = e.target.files[0];
                                  const formData = new FormData();
                                  formData.append('image', file);
                                  try {
                                    const res = await apiClient.post('/upload', formData, {
                                      headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    updateBlock(block.id, res.data.url);
                                  } catch (err) {
                                    alert('Ошибка загрузки файла');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                        {block.value && (
                          <img 
                            src={block.value.match(/!\[.*?\]\((.*?)\)/)?.[1] || block.value} 
                            alt="Preview" 
                            className="max-h-48 rounded-lg object-contain bg-white border border-gray-100 p-1" 
                          />
                        )}
                      </div>
                    )}
                    {block.type === 'video' && (
                      <input
                        type="text"
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Вставьте ссылку на YouTube (например: https://www.youtube.com/watch?v=...)"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Add Block Menu */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 pb-8">
                <span className="text-sm font-medium text-gray-500 mr-2">Добавить блок:</span>
                <button onClick={() => addBlock('text')} className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <FileText size={16} className="text-indigo-500"/> Текст
                </button>
                <button onClick={() => addBlock('image')} className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <ImageIcon size={16} className="text-indigo-500"/> Изображение
                </button>
                <button onClick={() => addBlock('video')} className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <FileText size={16} className="text-indigo-500"/> Видео
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-indigo-500" size={18} />
                <h3 className="font-bold text-gray-900 text-lg">Домашнее задание к уроку</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Опишите, что ученик должен сделать. Задание поддерживает Markdown-разметку. Оставьте пустым, если ДЗ не требуется.</p>
              <textarea 
                rows={6}
                value={lessonForm.homeworkDescription}
                onChange={e => setLessonForm({...lessonForm, homeworkDescription: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-y"
                placeholder="Напишите текст домашнего задания (Markdown)..."
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0 rounded-b-2xl">
            <button onClick={() => setIsEditingLesson(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
            <button onClick={handleSaveLesson} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Сохранить урок и ДЗ</button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Link href="/dashboard/admin/courses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition">
              <ChevronLeft size={16} className="mr-1" /> Вернуться к списку курсов
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ListTree className="text-indigo-500" />
                  Структура: {course.title}
                </h1>
                <p className="text-gray-500 text-sm mt-1">Управление модулями и контентом уроков</p>
              </div>
              <button 
                onClick={() => handleOpenModuleModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
              >
                <Plus size={16} /> Новый модуль
              </button>
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-6 pb-10">
            {modules.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl">
                <ListTree size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">В этом курсе пока нет модулей.</p>
                <p className="text-sm text-gray-400 mt-1">Создайте первый модуль, чтобы начать добавлять уроки.</p>
              </div>
            ) : (
              modules.map(mod => {
                const moduleLessons = lessons.filter(l => l.moduleId === mod.id).sort((a, b) => a.orderNumber - b.orderNumber);
                
                return (
                  <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{mod.title}</h3>
                        {mod.description && <p className="text-sm text-gray-500 mt-1">{mod.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenModuleModal(mod)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition" title="Редактировать модуль"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteModule(mod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Удалить модуль"><Trash2 size={16}/></button>
                      </div>
                    </div>
                    
                    {/* Lessons List */}
                    <div className="p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Уроки ({moduleLessons.length})</h4>
                        <button 
                          onClick={() => handleOpenLessonModal(mod.id)}
                          className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Plus size={14} /> Добавить урок
                        </button>
                      </div>

                      {moduleLessons.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">В этом модуле пока нет уроков.</p>
                      ) : (
                        <div className="space-y-2">
                          {moduleLessons.map(lesson => {
                            const hw = homeworks.find(h => h.lessonId === lesson.id);
                            return (
                              <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/50 transition group gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                    {lesson.orderNumber}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">{lesson.title}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                    <button onClick={() => handleOpenLessonModal(mod.id, lesson)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-md transition" title="Редактировать контент"><Edit2 size={14}/></button>
                                    <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Удалить урок"><Trash2 size={14}/></button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Module Modal (remains a modal since it's just a tiny form) */}
      {isModuleModalOpen && !isEditingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingModule ? 'Редактировать модуль' : 'Новый модуль'}</h2>
              <button onClick={() => setIsModuleModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название модуля</label>
                <input type="text" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание (опционально)</label>
                <textarea rows={3} value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModuleModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
              <button onClick={handleSaveModule} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
