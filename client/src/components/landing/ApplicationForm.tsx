'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Send } from 'lucide-react';

import axios from 'axios';

interface Course {
  id: number;
  title: string;
  ageCategory: string;
}

export default function ApplicationForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    phone: '',
    email: '',
    courseId: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/courses');
        setCourses(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, courseId: String(res.data[0].id) }));
        }
      } catch (error) {
        console.error('Failed to fetch courses for form', error);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      await apiClient.post('/applications', {
        ...formData,
        courseId: parseInt(formData.courseId, 10) || (courses.length > 0 ? courses[0].id : 1),
      });
      setStatus('success');
      setFormData({ parentName: '', studentName: '', phone: '', email: '', courseId: courses.length > 0 ? String(courses[0].id) : '1' });
    } catch (error) {
      console.error(error);
      setStatus('error');
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Произошла ошибка при отправке заявки. Попробуйте еще раз.');
      } else {
        setErrorMessage('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
      }
    }
  };

  return (
    <section id="apply" className="py-20 bg-blue-600 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 opacity-30 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-10 md:w-5/12 bg-gray-900 text-white flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">Оставьте заявку</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Оставьте контактные данные, и наш менеджер свяжется с вами в течение рабочего дня, чтобы подобрать идеальную программу и ответить на все вопросы.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-blue-400">1</div>
                <span className="text-sm font-medium">Оставьте заявку</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-blue-400">2</div>
                <span className="text-sm font-medium">Менеджер звонит вам</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-blue-400">3</div>
                <span className="text-sm font-medium">Создание кабинета</span>
              </div>
            </div>
          </div>
          
          <div className="p-10 md:w-7/12">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <Send size={40} />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Заявка отправлена!</h4>
                <p className="text-gray-600">Мы свяжемся с вами в ближайшее время.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Отправить еще одну
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя (Родитель)</label>
                    <input 
                      type="text" 
                      name="parentName"
                      required
                      value={formData.parentName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя ученика</label>
                    <input 
                      type="text" 
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      placeholder="Алексей"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      placeholder="+7 (999) 000-00-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                      placeholder="example@mail.ru"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Предпочтительный курс (предварительно)</label>
                  <select 
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-white"
                  >
                    {courses.length === 0 ? (
                      <option value="1">Загрузка курсов...</option>
                    ) : (
                      courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.ageCategory})</option>
                      ))
                    )}
                  </select>
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-md disabled:bg-blue-400"
                >
                  {status === 'loading' ? 'Отправка...' : 'Оставить заявку'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
