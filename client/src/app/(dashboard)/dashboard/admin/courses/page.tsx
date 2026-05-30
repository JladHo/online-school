'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Edit2, Trash2, Plus, X, ListTree } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ageCategory: '',
    price: 0
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке курсов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenModal = (course?: any) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        ageCategory: course.ageCategory,
        price: course.price
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        ageCategory: '',
        price: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { 
        ...formData, 
        price: Number(formData.price) 
      };

      if (editingCourse) {
        await apiClient.patch(`/admin/courses/${editingCourse.id}`, payload);
      } else {
        await apiClient.post('/admin/courses', payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('ВНИМАНИЕ: Вы уверены? Удаление курса приведет к каскадному удалению ВСЕХ его модулей, уроков и домашек!')) {
      try {
        await apiClient.delete(`/admin/courses/${id}`);
        fetchCourses();
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="text-indigo-500"/> Управление курсами</h1>
          <p className="text-gray-500 text-sm mt-1">Создание, редактирование и удаление курсов</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group transition hover:shadow-md hover:border-indigo-100">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                {course.ageCategory}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button onClick={() => handleOpenModal(course)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(course.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">{course.description}</p>
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-gray-400">Стоимость</p>
                <p className="font-bold text-gray-900">{course.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Модулей / Покупок</p>
                <p className="font-bold text-gray-900">{course._count.modules} / {course._count.purchases}</p>
              </div>
            </div>

            <Link href={`/dashboard/admin/courses/${course.id}`} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition border border-gray-200">
              <ListTree size={16} /> Структура курса
            </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingCourse ? 'Редактировать курс' : 'Новый курс'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название курса</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Возрастная категория</label>
                  <input type="text" placeholder="Напр. 10-14 лет" value={formData.ageCategory} onChange={e => setFormData({...formData, ageCategory: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость (₽)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание курса</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
              <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
