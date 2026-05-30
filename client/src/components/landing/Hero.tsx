import { ArrowRight, Code, Gamepad2, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Набор на 2026 год открыт
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            Открой мир <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">программирования</span> для своего ребенка
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed">
            От визуального кодирования в Scratch до профессиональной разработки на Python и React. Обучаем детей от 7 до 17 лет создавать игры, сайты и приложения.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#apply" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Начать обучение
              <ArrowRight size={20} />
            </a>
            <a href="#courses" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition border border-gray-200 shadow-sm">
              Смотреть курсы
            </a>
          </div>
        </div>

        {/* Floating Icons Background (Decorative) */}
        <div className="hidden lg:block absolute top-10 left-10 p-4 bg-white rounded-2xl shadow-xl rotate-[-10deg] animate-pulse">
          <Gamepad2 size={40} className="text-purple-500" />
        </div>
        <div className="hidden lg:block absolute bottom-10 left-20 p-4 bg-white rounded-2xl shadow-xl rotate-[15deg]">
          <Code size={40} className="text-blue-500" />
        </div>
        <div className="hidden lg:block absolute top-20 right-10 p-4 bg-white rounded-2xl shadow-xl rotate-[12deg] animate-bounce">
          <Globe size={40} className="text-green-500" />
        </div>
      </div>
    </section>
  );
}
