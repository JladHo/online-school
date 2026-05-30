import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-4">
              <Terminal size={24} />
              <span className="font-bold text-xl tracking-tight">CodeSchool</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Современная онлайн-школа программирования для детей и подростков. Мы помогаем сделать первый шаг в IT и освоить востребованные навыки.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition">Преимущества</a></li>
              <li><a href="#courses" className="hover:text-white transition">Программы обучения</a></li>
              <li><a href="#apply" className="hover:text-white transition">Записаться</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li>8 (800) 555-35-35</li>
              <li>info@codeschool.ru</li>
              <li>г. Москва, ул. Программистов, 1</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
          &copy; {new Date().getFullYear()} CodeSchool. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
