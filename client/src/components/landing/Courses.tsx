'use client';

import { Code2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  ageCategory: string;
  price: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/courses');
        setCourses(res.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-gray-50 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Наши курсы</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Программы обучения разработаны с учетом возрастных особенностей и современных требований IT-индустрии.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Курсы пока не добавлены.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                <div className="p-8 flex-grow">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <Code2 size={24} />
                  </div>
                  <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full mb-4">
                    {course.ageCategory}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="text-2xl font-bold text-blue-600">
                    {course.price.toLocaleString('ru-RU')} ₽ <span className="text-sm font-normal text-gray-500">/ месяц</span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                  <Link 
                    href={`#apply`} 
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition"
                  >
                    Записаться на курс
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
